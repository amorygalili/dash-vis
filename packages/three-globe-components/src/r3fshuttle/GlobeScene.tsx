import React, { useRef, useState, useEffect, useCallback } from "react";
import { useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import R3fGlobe from "r3f-globe";
import { OrbitPoint } from "../types";
import Shuttle from "./Shuttle";

// Camera view options
type CameraView = "orbit" | "shuttle";

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

  // Update globe radius when the globe is ready
  useEffect(() => {
    if (globeRef.current) {
      globeRef.current.setPointOfView(camera);
      // Get the actual globe radius and update state
      const radius = globeRef.current.getGlobeRadius();
      if (radius) {
        setGlobeRadius(radius);

        // Initialize controls with dynamic zoom speed
        if (controlsRef.current) {
          const distToSurface = camera.position.length() - radius;
          controlsRef.current.zoomSpeed = Math.max(
            0.02,
            Math.sqrt(distToSurface / radius) * 0.3
          );
          controlsRef.current.rotateSpeed = Math.max(
            0.005,
            (distToSurface / radius) * 0.4
          );
        }
      }
    }
  }, [camera]);

  // Handle camera controls changes
  const handleControlsChange = useCallback(() => {
    if (globeRef.current && controlsRef.current) {
      // Report new camera position to globe for tile management
      globeRef.current.setPointOfView(camera);

      // Adjust controls speed based on altitude
      const R = globeRef.current.getGlobeRadius();
      const distToSurface = camera.position.length() - R;

      // Make zoom speed slower when closer to the surface
      // This gives more precise control when zoomed in
      controlsRef.current.zoomSpeed = Math.max(
        0.02,
        Math.sqrt(distToSurface / R) * 0.3
      );

      // Also adjust rotation speed for better control when zoomed in
      controlsRef.current.rotateSpeed = Math.max(
        0.005,
        (distToSurface / R) * 0.4
      );
    }
  }, [camera]);

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

  // Create orbit path visualization from the provided orbit path points
  const OrbitPathVisualization = useCallback(() => {
    if (orbitPathPoints.length === 0) return null;

    // For direct Cartesian coordinates visualization
    // We'll create a simple line geometry from the points
    const numPoints = orbitPathPoints.length;
    const orbitPoints: THREE.Vector3[] = [];

    // First, we'll create a set of points in Cartesian space that match the shuttle's orbit
    for (let i = 0; i < numPoints; i++) {
      const point = orbitPathPoints[i];

      // We need to convert the lat/lng/alt to Cartesian coordinates
      // This is the inverse of the conversion in the example component
      const lat = (point.lat * Math.PI) / 180; // Convert to radians
      const lng = (point.lng * Math.PI) / 180; // Convert to radians
      const alt = point.alt;

      // Calculate the radius from the altitude
      const radius = globeRadius * (1 + alt);

      // Convert spherical to Cartesian coordinates
      // Note: This matches the coordinate system used by the shuttle
      const x = radius * Math.cos(lat) * Math.cos(lng);
      const z = radius * Math.cos(lat) * Math.sin(lng);
      const y = radius * Math.sin(lat);

      orbitPoints.push(new THREE.Vector3(x, y, z));
    }

    // Create a smooth curve that follows the orbit points
    const curve = new THREE.CatmullRomCurve3(orbitPoints, true); // true = closed curve
    const curvePoints = curve.getPoints(200); // Get more points for smoother rendering
    const geometry = new THREE.BufferGeometry().setFromPoints(curvePoints);

    // Create a line with a glowing effect
    const material = new THREE.LineBasicMaterial({
      color: "#4fc3f7", // Light blue color
      opacity: 0.7,
      transparent: true,
      linewidth: 1,
    });

    return <primitive object={new THREE.Line(geometry, material)} />;
  }, [orbitPathPoints, globeRadius]);

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
      {orbitPathPoints.length > 0 && <OrbitPathVisualization />}

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
