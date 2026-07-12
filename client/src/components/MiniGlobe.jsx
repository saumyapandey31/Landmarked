import { useEffect, useRef } from 'react';
import * as Cesium from 'cesium';

if (import.meta.env.VITE_CESIUM_ION_TOKEN) {
  Cesium.Ion.defaultAccessToken = import.meta.env.VITE_CESIUM_ION_TOKEN;
}

// A cinematic, always-rotating globe for the landing hero — designed to feel
// like a looping video rather than a static map. No controls, no UI chrome.
export default function MiniGlobe({ className = '' }) {
  const containerRef = useRef(null);
  const viewerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current || viewerRef.current) return;

    const viewer = new Cesium.Viewer(containerRef.current, {
      timeline: false,
      animation: false,
      baseLayerPicker: false,
      geocoder: false,
      homeButton: false,
      sceneModePicker: false,
      navigationHelpButton: false,
      fullscreenButton: false,
      infoBox: false,
      selectionIndicator: false,
      contextOptions: { webgl: { alpha: true } },
      creditContainer: document.createElement('div'),
    });

    viewer.scene.globe.enableLighting = true;
    viewer.scene.globe.showGroundAtmosphere = true;
    viewer.scene.skyAtmosphere.show = true;
    viewer.scene.skyAtmosphere.hueShift = -0.02;
    viewer.scene.skyAtmosphere.saturationShift = 0.1;
    viewer.scene.fog.enabled = true;
    viewer.scene.backgroundColor = Cesium.Color.TRANSPARENT;
    viewer.scene.screenSpaceCameraController.enableZoom = false;
    viewer.scene.screenSpaceCameraController.enableTilt = false;
    viewer.scene.screenSpaceCameraController.enableRotate = false;
    viewer.scene.screenSpaceCameraController.enableTranslate = false;
    viewer.scene.screenSpaceCameraController.enableLook = false;

    // cinematic intro: pull in from deep space
    viewer.camera.setView({
      destination: Cesium.Cartesian3.fromDegrees(20, 15, 45000000),
    });
    viewer.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(20, 15, 16000000),
      duration: 2.5,
      easingFunction: Cesium.EasingFunction.QUADRATIC_OUT,
    });

    let angle = 20;
    const removeListener = viewer.clock.onTick.addEventListener(() => {
      angle += 0.035; // slow, continuous, video-like drift
      const height = 16000000 + Math.sin(Cesium.JulianDate.toDate(viewer.clock.currentTime).getTime() / 4000) * 400000;
      viewer.camera.setView({
        destination: Cesium.Cartesian3.fromDegrees(angle % 360, 15, height),
      });
    });

    viewerRef.current = viewer;

    return () => {
      removeListener();
      viewer.destroy();
      viewerRef.current = null;
    };
  }, []);

  return (
    <div className={`relative w-full h-full ${className}`}>
      <div ref={containerRef} className="w-full h-full" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-accent-primary/25 via-transparent to-transparent" />
    </div>
  );
}
