import React, { useRef, useState, useEffect, useCallback } from "react";
import { useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import R3fGlobe from "r3f-globe";
import { OrbitPoint } from "../types";
import Shuttle from "./Shuttle";
import { CameraView } from "./CameraViewSelector";
import OrbitPathVisualization from "./OrbitPathVisualization";

// Camera view type is now imported from CameraViewSelector

interface Props {
  cameraView: CameraView;
  controlsRef: React.RefObject<any>;
  shuttlePath?: string;
  shuttlePosition: THREE.Vector3;
  shuttleLookAt: THREE.Vector3;
  orbitPathPoints: OrbitPoint[];
}

// Main scene component with globe and shuttle
function GlobeScene({
  cameraView,
  controlsRef,
  shuttlePath = "/Shuttle Model.glb",
  shuttlePosition,
  shuttleLookAt,
  orbitPathPoints,
}: Props) {
  const globeRef = useRef<any>(undefined);
  const { camera } = useThree();
  const [globeRadius, setGlobeRadius] = useState(100); // Default radius

  // Helper function to update controls speeds based on distance to surface
  const updateControlsSpeeds = useCallback(() => {
    const controls = controlsRef.current;
    const globe = globeRef.current;
    if (!controls || !globe) return;

    const radius = globe.getGlobeRadius();
    const distToSurface = camera.position.length() - radius;

    // Make zoom speed slower when closer to the surface
    controls.zoomSpeed = Math.max(
      0.02,
      Math.sqrt(distToSurface / radius) * 0.3
    );

    // Also adjust rotation speed for better control when zoomed in
    controls.rotateSpeed = Math.max(0.005, (distToSurface / radius) * 0.4);
  }, [camera]);

  // Update globe radius when the globe is ready
  useEffect(() => {
    if (globeRef.current) {
      globeRef.current.setPointOfView(camera);
      setGlobeRadius(globeRef.current.getGlobeRadius());
      updateControlsSpeeds();
    }
  }, [camera]);

  // Handle camera controls changes
  const handleControlsChange = useCallback(() => {
    if (globeRef.current && controlsRef.current) {
      globeRef.current.setPointOfView(camera);
      updateControlsSpeeds();
    }
  }, [camera, updateControlsSpeeds]);

  // Update camera position based on selected view
  useEffect(() => {
    if (
      cameraView === "shuttle" &&
      shuttlePosition &&
      shuttleLookAt &&
      camera
    ) {
      // Position the camera slightly behind and above the shuttle
      const shuttleDirection = new THREE.Vector3()
        .subVectors(shuttleLookAt, shuttlePosition)
        .normalize();

      // Create an offset that's behind and above the shuttle
      const up = new THREE.Vector3(0, 1, 0);
      const right = new THREE.Vector3()
        .crossVectors(shuttleDirection, up)
        .normalize();
      const adjustedUp = new THREE.Vector3()
        .crossVectors(right, shuttleDirection)
        .normalize();

      // Create the offset vector (behind and above)
      const offset = new THREE.Vector3()
        .copy(shuttleDirection)
        .multiplyScalar(-30) // 30 units behind
        .add(adjustedUp.multiplyScalar(10)); // 10 units above

      const cameraPosition = new THREE.Vector3()
        .copy(shuttlePosition)
        .add(offset);

      // Set camera position and look at the Earth
      camera.position.copy(cameraPosition);
      camera.lookAt(shuttleLookAt);
      camera.updateProjectionMatrix();

      // Disable controls when in shuttle view
      if (controlsRef.current) {
        controlsRef.current.enabled = false;
      }
    } else {
      // Re-enable controls when in orbit view
      if (controlsRef.current) {
        controlsRef.current.enabled = true;
      }
    }
  }, [cameraView, shuttlePosition, shuttleLookAt, camera]);

  // Orbit path visualization is now imported from a separate component

  return (
    <>
      <OrbitControls
        ref={controlsRef}
        minDistance={globeRadius * 1.001}
        maxDistance={1000}
        dampingFactor={0.1}
        zoomSpeed={0.3}
        rotateSpeed={0.3}
        enabled={cameraView === "orbit"}
        onChange={handleControlsChange}
      />

      {/* r3f-globe component with satellite imagery */}
      <R3fGlobe
        ref={globeRef}
        globeTileEngineUrl={(x, y, l) =>
          `https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/${l}/${y}/${x}`
        }
        onGlobeReady={() => {
          if (globeRef.current) {
            const radius = globeRef.current.getGlobeRadius();
            if (radius) {
              setGlobeRadius(radius);
            }
          }
        }}
      />

      {/* Orbit Path Visualization */}
      {orbitPathPoints.length > 0 && (
        <OrbitPathVisualization
          orbitPathPoints={orbitPathPoints}
          globeRadius={globeRadius}
        />
      )}

      {/* Orbiting Shuttle */}
      <Shuttle
        path={shuttlePath}
        position={shuttlePosition}
        lookAt={shuttleLookAt}
      />
    </>
  );
}

export default GlobeScene;
