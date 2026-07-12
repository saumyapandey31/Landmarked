import { useEffect, useRef, useState } from 'react';
import * as Cesium from 'cesium';
import { reverseGeocode } from '../utils/geocode';

if (import.meta.env.VITE_CESIUM_ION_TOKEN) {
  Cesium.Ion.defaultAccessToken = import.meta.env.VITE_CESIUM_ION_TOKEN;
}

const MARKER_COLORS = {
  VISITED: Cesium.Color.fromCssColorString('#235347'),
  WANT_TO_VISIT: Cesium.Color.fromCssColorString('#E4572E'),
  CURRENTLY_TRAVELLING: Cesium.Color.fromCssColorString('#D4AC0D'),
  BUCKET_LIST: Cesium.Color.fromCssColorString('#7B4FA6'),
};

const IDLE_TIMEOUT_MS = 6000;

// Cesium World Imagery (and its Ion fallback, Esri World Imagery) is pure
// satellite pixels — no place names, no borders. A Google-Earth-like feel
// comes from layering a labels-only basemap on top. CARTO's "*_only_labels"
// raster tiles are free, keyless, and ship country/state/city/ocean/river/
// mountain labels plus admin borders, pre-generalized per zoom level (so
// labels thin out and never overlap — the tile provider does the LOD work
// for us). A separate OSM raster layer supplies road + airport detail,
// gated to close-in zooms only so it costs nothing when zoomed out.
const LABELS_TILE_URL = (theme) =>
  `https://{s}.basemaps.cartocdn.com/rastertiles/${theme === 'dark' ? 'dark_only_labels' : 'light_only_labels'}/{z}/{x}/{y}{r}.png`;

const ROADS_TILE_URL = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

// Camera-height band (meters) over which the roads/airports overlay eases
// in and out, so it never just "pops" — it fades smoothly with altitude.
const ROADS_FADE_START_M = 300000;
const ROADS_FADE_END_M = 60000;

export default function InteractiveGlobe({ markers = [], onMapClick, onMarkerClick }) {
  const containerRef = useRef(null);
  const viewerRef = useRef(null);
  const idleTimerRef = useRef(null);
  const autoRotateRef = useRef(false);
  const labelsLayerRef = useRef(null);
  const roadsLayerRef = useRef(null);
  const placeToastTimerRef = useRef(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [nightMode, setNightMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [placeToast, setPlaceToast] = useState(null); // { label, loading }

  useEffect(() => {
    if (!containerRef.current || viewerRef.current) return;

    const viewer = new Cesium.Viewer(containerRef.current, {
      timeline: false,
      animation: false,
      // We build the imagery stack ourselves (satellite + labels + roads),
      // so skip Cesium's automatic default base layer and the picker UI
      // for it — otherwise we'd end up with a duplicate base layer and a
      // picker that only controls one of three stacked layers.
      baseLayer: false,
      baseLayerPicker: false,
      geocoder: true,
      homeButton: true,
      sceneModePicker: true,
      navigationHelpButton: false,
      fullscreenButton: true,
      infoBox: false,
    });

    // cinematic look: atmosphere, lighting, fog — makes the globe feel alive
    // instead of a flat static map.
    viewer.scene.globe.enableLighting = true;
    viewer.scene.globe.showGroundAtmosphere = true;
    viewer.scene.skyAtmosphere.show = true;
    viewer.scene.skyAtmosphere.hueShift = -0.02;
    viewer.scene.skyAtmosphere.saturationShift = 0.1;
    viewer.scene.fog.enabled = true;
    viewer.scene.fog.density = 0.0002;

    // Performance: keep the globe smooth even with three imagery layers
    // stacked (satellite + labels + roads) by capping tile screen-space
    // error and giving Cesium a healthy tile cache instead of thrashing it.
    viewer.scene.globe.maximumScreenSpaceError = 2;
    viewer.scene.globe.tileCacheSize = 100;
    viewer.scene.globe.baseColor = Cesium.Color.fromCssColorString('#0b1a17');

    let cancelled = false;
    async function setupImagery(theme) {
      // Base layer: real satellite pixels. Prefer Cesium World Imagery via
      // Ion (best quality) and gracefully fall back to Esri World Imagery
      // (no key required) if no Ion token is configured, so the globe never
      // ships blank.
      let baseProvider = null;
      if (Cesium.Ion.defaultAccessToken) {
        try {
          baseProvider = await Cesium.IonImageryProvider.fromAssetId(2);
        } catch {
          baseProvider = null;
        }
      }
      if (!baseProvider) {
        baseProvider = new Cesium.UrlTemplateImageryProvider({
          url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
          credit: 'Esri, Maxar, Earthstar Geographics',
          maximumLevel: 19,
        });
      }
      if (cancelled) return;
      viewer.imageryLayers.addImageryProvider(baseProvider);

      // Labels overlay: countries, states/provinces, capitals & cities,
      // oceans/seas, rivers & lakes, mountain ranges, admin borders and
      // coastlines — all on a transparent background so satellite pixels
      // stay visible underneath. Text ships with a built-in halo so it
      // stays readable over bright or dark imagery in either theme.
      const labelsLayer = viewer.imageryLayers.addImageryProvider(
        new Cesium.UrlTemplateImageryProvider({
          url: LABELS_TILE_URL(theme),
          subdomains: ['a', 'b', 'c', 'd'],
          credit: '© OpenStreetMap contributors © CARTO',
          maximumLevel: 18,
        })
      );
      labelsLayerRef.current = labelsLayer;

      // Roads/airport overlay: only meaningful once zoomed in, so give it a
      // minimumLevel — Cesium simply won't request tiles for zoomed-out
      // views, which is what keeps this layer free performance-wise until
      // the user actually needs it. Visibility/alpha is then eased smoothly
      // by the LOD listener below instead of popping on/off.
      const roadsLayer = viewer.imageryLayers.addImageryProvider(
        new Cesium.UrlTemplateImageryProvider({
          url: ROADS_TILE_URL,
          subdomains: ['a', 'b', 'c'],
          credit: '© OpenStreetMap contributors',
          maximumLevel: 19,
          minimumLevel: 12,
        })
      );
      roadsLayer.alpha = 0;
      roadsLayer.show = false;
      roadsLayerRef.current = roadsLayer;
    }
    setupImagery(nightMode ? 'dark' : 'light');

    // Smoothly fade the roads/airport layer in as the camera descends, and
    // fully disable it (no tile requests) once far away — this is the
    // "labels/detail appear and disappear by zoom level" behavior applied
    // to raster overlays, plus a performance win when zoomed out.
    function updateLOD() {
      const layer = roadsLayerRef.current;
      if (!layer) return;
      const height = viewer.camera.positionCartographic?.height ?? Infinity;
      if (height > ROADS_FADE_START_M) {
        if (layer.show) layer.show = false;
        return;
      }
      if (!layer.show) layer.show = true;
      const t = Cesium.Math.clamp(
        (ROADS_FADE_START_M - height) / (ROADS_FADE_START_M - ROADS_FADE_END_M),
        0,
        1
      );
      layer.alpha = t;
    }
    const lodListener = viewer.scene.postRender.addEventListener(updateLOD);

    // cinematic intro: start far out in space, then fly in
    viewer.camera.setView({
      destination: Cesium.Cartesian3.fromDegrees(78, 22, 40000000),
    });
    viewer.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(78, 22, 12000000),
      duration: 3,
      easingFunction: Cesium.EasingFunction.QUADRATIC_OUT,
      complete: () => setIsLoading(false),
    });

    function markInteraction() {
      autoRotateRef.current = false;
      clearTimeout(idleTimerRef.current);
      idleTimerRef.current = setTimeout(() => {
        autoRotateRef.current = true;
      }, IDLE_TIMEOUT_MS);
    }
    markInteraction();

    const canvas = viewer.scene.canvas;
    canvas.addEventListener('pointerdown', markInteraction);
    canvas.addEventListener('wheel', markInteraction);

    // idle auto-rotate — gives the globe a "playing video" feel when untouched
    const rotateListener = viewer.clock.onTick.addEventListener(() => {
      if (autoRotateRef.current) {
        viewer.scene.camera.rotate(Cesium.Cartesian3.UNIT_Z, -0.0006);
      }
    });

    const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
    handler.setInputAction((movement) => {
      markInteraction();
      const cartesian = viewer.camera.pickEllipsoid(movement.position, viewer.scene.globe.ellipsoid);
      if (cartesian) {
        const cartographic = Cesium.Cartographic.fromCartesian(cartesian);
        const lat = Cesium.Math.toDegrees(cartographic.latitude);
        const lon = Cesium.Math.toDegrees(cartographic.longitude);
        onMapClick?.({ lat, lon });

        // Clicking a country/city surfaces its name as a small toast — the
        // same click still opens the existing create-journal flow via
        // onMapClick above, so this is purely additive context.
        clearTimeout(placeToastTimerRef.current);
        setPlaceToast({ label: 'Locating…', loading: true });
        reverseGeocode(lat, lon).then((place) => {
          setPlaceToast({ label: place.label, loading: false });
          placeToastTimerRef.current = setTimeout(() => setPlaceToast(null), 4000);
        });
      }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

    viewerRef.current = viewer;

    return () => {
      cancelled = true;
      clearTimeout(idleTimerRef.current);
      clearTimeout(placeToastTimerRef.current);
      canvas.removeEventListener('pointerdown', markInteraction);
      canvas.removeEventListener('wheel', markInteraction);
      rotateListener();
      lodListener();
      handler.destroy();
      viewer.destroy();
      viewerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // sync markers into the scene, with a drop-in animation via scale
  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer) return;

    viewer.entities.removeAll();

    // Journey markers use the same collision-avoidance philosophy as the
    // place-name layer: instead of letting dense clusters of pins overlap
    // each other, group nearby ones into a single badge with a count once
    // the camera is far enough that they'd otherwise collide.
    const clustering = viewer.dataSourceDisplay?.defaultDataSource?.clustering;
    if (clustering && !clustering._landmarkedConfigured) {
      clustering.enabled = true;
      clustering.pixelRange = 55;
      clustering.minimumClusterSize = 3;
      clustering.clusterEvent.addEventListener((entities, cluster) => {
        cluster.label.show = true;
        cluster.label.text = String(entities.length);
        cluster.label.font = '600 13px Inter, sans-serif';
        cluster.label.fillColor = Cesium.Color.WHITE;
        cluster.billboard.show = false;
        cluster.point.show = true;
        cluster.point.pixelSize = 22;
        cluster.point.color = Cesium.Color.fromCssColorString('#235347');
        cluster.point.outlineColor = Cesium.Color.fromCssColorString('#DAF1DE');
        cluster.point.outlineWidth = 2;
      });
      clustering._landmarkedConfigured = true;
    }

    markers.forEach((marker) => {
      const entity = viewer.entities.add({
        position: Cesium.Cartesian3.fromDegrees(marker.longitude, marker.latitude),
        point: {
          pixelSize: 14,
          color: MARKER_COLORS[marker.type] || Cesium.Color.WHITE,
          outlineColor: Cesium.Color.fromCssColorString('#DAF1DE'),
          outlineWidth: 2,
          heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
        },
        label: {
          text: marker.label || '',
          font: '600 12px Inter, sans-serif',
          pixelOffset: new Cesium.Cartesian2(0, -20),
          fillColor: Cesium.Color.fromCssColorString('#DAF1DE'),
          outlineColor: Cesium.Color.BLACK,
          outlineWidth: 2,
          style: Cesium.LabelStyle.FILL_AND_OUTLINE,
          showBackground: true,
          backgroundColor: Cesium.Color.fromCssColorString('#051F20').withAlpha(0.75),
          disableDepthTestDistance: Number.POSITIVE_INFINITY,
          scaleByDistance: new Cesium.NearFarScalar(1.0e6, 1.0, 3.0e7, 0.6),
        },
      });
      entity.landmarkData = marker;
    });

    const clickHandler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
    clickHandler.setInputAction((movement) => {
      const picked = viewer.scene.pick(movement.position);
      if (Cesium.defined(picked) && picked.id?.landmarkData) {
        onMarkerClick?.(picked.id.landmarkData);
      }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

    return () => clickHandler.destroy();
  }, [markers, onMarkerClick]);

  function toggleNightMode() {
    const viewer = viewerRef.current;
    if (!viewer) return;
    setNightMode((prev) => {
      const next = !prev;
      viewer.scene.globe.enableLighting = next;

      // Swap the labels overlay for the dark/light variant so text keeps
      // reading cleanly against the sun-lit vs. night-lit globe. Imagery
      // providers are immutable once created, so we rebuild the layer
      // in-place rather than mutating it.
      const oldLabels = labelsLayerRef.current;
      if (oldLabels) {
        const index = viewer.imageryLayers.indexOf(oldLabels);
        const newLabels = new Cesium.ImageryLayer(
          new Cesium.UrlTemplateImageryProvider({
            url: LABELS_TILE_URL(next ? 'dark' : 'light'),
            subdomains: ['a', 'b', 'c', 'd'],
            credit: '© OpenStreetMap contributors © CARTO',
            maximumLevel: 18,
          })
        );
        viewer.imageryLayers.remove(oldLabels, true);
        viewer.imageryLayers.add(newLabels, index);
        labelsLayerRef.current = newLabels;
      }

      return next;
    });
  }

  async function handleSearch(e) {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`
      );
      const results = await res.json();
      if (results[0]) {
        const { lat, lon } = results[0];
        autoRotateRef.current = false;
        clearTimeout(idleTimerRef.current);
        viewerRef.current?.camera.flyTo({
          destination: Cesium.Cartesian3.fromDegrees(parseFloat(lon), parseFloat(lat), 1200000),
          duration: 2.2,
          easingFunction: Cesium.EasingFunction.QUADRATIC_OUT,
        });
        idleTimerRef.current = setTimeout(() => {
          autoRotateRef.current = true;
        }, IDLE_TIMEOUT_MS);
      }
    } catch {
      // fly-to search is a nice-to-have; fail silently in the UI
    }
  }

  return (
    <div className="relative w-full h-full rounded-xl2 overflow-hidden shadow-soft globe-frame">
      <div ref={containerRef} className="w-full h-full" />

      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-accent-primary">
          <p className="text-white font-display text-lg tracking-wide animate-pulse">
            Descending to Earth…
          </p>
        </div>
      )}

      <form
        onSubmit={handleSearch}
        className="absolute top-4 left-4 flex items-center gap-2 glass-dark rounded-full px-4 py-2 shadow-card"
      >
        <input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search countries, cities, landmarks..."
          className="bg-transparent outline-none text-sm text-white placeholder:text-white/50 w-64"
        />
        <button type="submit" className="text-sage text-sm font-medium">
          Go
        </button>
      </form>
   {placeToast && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 glass-dark rounded-full px-4 py-2 shadow-card text-sm font-medium text-white pointer-events-none animate-fade-in">
          {placeToast.loading ? placeToast.label : `📍 ${placeToast.label}`}
        </div>
      )}
    </div>
  );
}
