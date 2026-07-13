import { useEffect, useRef, useState } from 'react';
import * as Cesium from 'cesium';
import { reverseGeocode } from '../utils/geocode';

const ION_TOKEN = import.meta.env.VITE_CESIUM_ION_TOKEN;
if (ION_TOKEN) {
  Cesium.Ion.defaultAccessToken = ION_TOKEN;
} else {
  console.warn('[InteractiveGlobe] No VITE_CESIUM_ION_TOKEN set — falling back to Esri imagery + ellipsoid terrain.');
}

const MARKER_COLORS = {
  VISITED: Cesium.Color.fromCssColorString('#235347'),
  WANT_TO_VISIT: Cesium.Color.fromCssColorString('#E4572E'),
  CURRENTLY_TRAVELLING: Cesium.Color.fromCssColorString('#D4AC0D'),
  BUCKET_LIST: Cesium.Color.fromCssColorString('#7B4FA6'),
};

const IDLE_TIMEOUT_MS = 6000;

const LABELS_TILE_URL = (theme) =>
  `https://{s}.basemaps.cartocdn.com/rastertiles/${theme === 'dark' ? 'dark_only_labels' : 'light_only_labels'}/{z}/{x}/{y}{r}.png`;

const ROADS_TILE_URL = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

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
  const entityMapRef = useRef(new Map());
  const [searchQuery, setSearchQuery] = useState('');
  const [nightMode, setNightMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [placeToast, setPlaceToast] = useState(null);

  useEffect(() => {
    if (!containerRef.current || viewerRef.current) return;

    const viewer = new Cesium.Viewer(containerRef.current, {
      timeline: false,
      animation: false,
      baseLayer: false,
      baseLayerPicker: false,
      geocoder: true,
      homeButton: true,
      sceneModePicker: true,
      navigationHelpButton: false,
      fullscreenButton: true,
      infoBox: false,
    });

    viewer.scene.globe.enableLighting = true;
    viewer.scene.globe.showGroundAtmosphere = true;
    viewer.scene.skyAtmosphere.show = true;
    viewer.scene.skyAtmosphere.hueShift = -0.02;
    viewer.scene.skyAtmosphere.saturationShift = 0.1;
    viewer.scene.fog.enabled = true;
    viewer.scene.fog.density = 0.0002;
    viewer.scene.globe.depthTestAgainstTerrain = true;
    viewer.scene.globe.maximumScreenSpaceError = 2;
    viewer.scene.globe.tileCacheSize = 100;
    viewer.scene.globe.baseColor = Cesium.Color.fromCssColorString('#0b1a17');

    let cancelled = false;

    async function setupTerrain() {
      try {
        if (ION_TOKEN) {
          viewer.terrainProvider = await Cesium.createWorldTerrainAsync({
            requestWaterMask: true,
            requestVertexNormals: true,
          });
        } else {
          viewer.terrainProvider = new Cesium.EllipsoidTerrainProvider();
        }
      } catch (err) {
        console.error('[InteractiveGlobe] Terrain load failed, using ellipsoid:', err);
        if (!cancelled) viewer.terrainProvider = new Cesium.EllipsoidTerrainProvider();
      }
    }

    async function setupImagery(theme) {
      let baseProvider = null;

      if (ION_TOKEN) {
        try {
          baseProvider = await Cesium.IonImageryProvider.fromAssetId(2);
        } catch (err) {
          console.error('[InteractiveGlobe] Ion imagery failed, falling back to Esri:', err);
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

      baseProvider.errorEvent?.addEventListener((err) => {
        console.error('[InteractiveGlobe] Base imagery tile error:', err);
        setLoadError('Map imagery failed to load — check your network/ad-blocker and try again.');
      });

      if (cancelled) return;
      const labelsLayer = viewer.imageryLayers.addImageryProvider(
        new Cesium.UrlTemplateImageryProvider({
          url: LABELS_TILE_URL(theme),
          subdomains: ['a', 'b', 'c', 'd'],
          credit: '© OpenStreetMap contributors © CARTO',
          maximumLevel: 18,
        })
      );
      labelsLayerRef.current = labelsLayer;

      if (cancelled) return;
      // NOTE: no `minimumLevel` here. Setting minimumLevel on an imagery
      // layer while a real terrain provider is active triggers a known
      // Cesium bug — Imagery.getImageryFromCache recurses through tile
      // ancestors looking for a placeholder and never terminates, which
      // eventually throws "RangeError: Too many properties to enumerate"
      // and crashes the whole render loop. Visibility for this layer is
      // controlled entirely by `show`/`alpha` in updateLOD() below, which
      // achieves the same "don't load roads when zoomed out" goal safely
      // (show = false means Cesium requests zero tiles for this layer).
      const roadsLayer = viewer.imageryLayers.addImageryProvider(
        new Cesium.UrlTemplateImageryProvider({
          url: ROADS_TILE_URL,
          subdomains: ['a', 'b', 'c'],
          credit: '© OpenStreetMap contributors',
          maximumLevel: 19,
        })
      );
      roadsLayer.alpha = 0;
      roadsLayer.show = false;
      roadsLayerRef.current = roadsLayer;
    }

    Promise.all([setupTerrain(), setupImagery(nightMode ? 'dark' : 'light')]);

    function updateLOD() {
      const layer = roadsLayerRef.current;
      if (!layer) return;
      const height = viewer.camera.positionCartographic?.height ?? Infinity;
      if (height > ROADS_FADE_START_M) {
        layer.show = false; // no tile requests fire while show=false
        return;
      }
      layer.show = true;
      const t = Cesium.Math.clamp(
        (ROADS_FADE_START_M - height) / (ROADS_FADE_START_M - ROADS_FADE_END_M),
        0,
        1
      );
      layer.alpha = t;
    }
    const lodListener = viewer.scene.postRender.addEventListener(updateLOD);

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

    const rotateListener = viewer.clock.onTick.addEventListener(() => {
      if (autoRotateRef.current) {
        viewer.scene.camera.rotate(Cesium.Cartesian3.UNIT_Z, -0.0006);
      }
    });

    // Single click handler: pick first, branch to marker click or map
    // click. Prevents a marker click from also firing the map-click
    // (create journal entry) flow.
    const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
    handler.setInputAction((movement) => {
      markInteraction();

      const picked = viewer.scene.pick(movement.position);
      if (Cesium.defined(picked) && picked.id?.landmarkData) {
        onMarkerClick?.(picked.id.landmarkData);
        return;
      }

      const cartesian = viewer.camera.pickEllipsoid(movement.position, viewer.scene.globe.ellipsoid);
      if (cartesian) {
        const cartographic = Cesium.Cartographic.fromCartesian(cartesian);
        const lat = Cesium.Math.toDegrees(cartographic.latitude);
        const lon = Cesium.Math.toDegrees(cartographic.longitude);
        onMapClick?.({ lat, lon });

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

  // Diffed marker sync: update existing entities in place, add new ones,
  // remove stale ones. Avoids removeAll()+rebuild flicker on every render.
  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer) return;

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

    const seen = new Set();
    const entityMap = entityMapRef.current;

    markers.forEach((marker) => {
      const id = marker.id ?? `${marker.latitude},${marker.longitude},${marker.label}`;
      seen.add(id);
      const existing = entityMap.get(id);

      if (existing) {
        existing.position = Cesium.Cartesian3.fromDegrees(marker.longitude, marker.latitude);
        existing.point.color = MARKER_COLORS[marker.type] || Cesium.Color.WHITE;
        existing.label.text = marker.label || '';
        existing.landmarkData = marker;
        return;
      }

      const entity = viewer.entities.add({
        id,
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
      entityMap.set(id, entity);
    });

    for (const [id, entity] of entityMap) {
      if (!seen.has(id)) {
        viewer.entities.remove(entity);
        entityMap.delete(id);
      }
    }
  }, [markers, onMarkerClick]);

  function toggleNightMode() {
    const viewer = viewerRef.current;
    if (!viewer) return;
    setNightMode((prev) => {
      const next = !prev;
      viewer.scene.globe.enableLighting = next;

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

      {isLoading && !loadError && (
        <div className="absolute inset-0 flex items-center justify-center bg-accent-primary">
          <p className="text-white font-display text-lg tracking-wide animate-pulse">
            Descending to Earth…
          </p>
        </div>
      )}

      {loadError && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/70 z-10">
          <div className="text-white text-sm text-center max-w-xs px-4">
            <p className="mb-2">{loadError}</p>
            <button onClick={() => window.location.reload()} className="underline text-sage">
              Reload
            </button>
          </div>
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

      <button
        type="button"
        onClick={toggleNightMode}
        className="absolute top-4 right-4 glass-dark rounded-full p-2 shadow-card text-white text-sm"
        aria-label="Toggle night mode"
      >
        {nightMode ? '☀️' : '🌙'}
      </button>

      {placeToast && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 glass-dark rounded-full px-4 py-2 shadow-card text-sm font-medium text-white pointer-events-none animate-fade-in">
          {placeToast.loading ? placeToast.label : `📍 ${placeToast.label}`}
        </div>
      )}
    </div>
  );
}
