import React, { useRef, useState, useEffect, useCallback } from "react";
import { useThree } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import * as THREE from "three";
import R3fGlobe from "r3f-globe";
import { OrbitPoint, Object3D as CustomObject3D } from "../types";
import { CameraView } from "./CameraViewSelector";
import OrbitPathVisualization from "./OrbitPathVisualization";

// Camera view type is now imported from CameraViewSelector

interface Props {
  cameraView: CameraView;
  controlsRef: React.RefObject<any>;
  objects3D: CustomObject3D[];
  orbitPathPoints: OrbitPoint[];
}

// Main scene component with globe and 3D objects
function GlobeScene({
  cameraView,
  controlsRef,
  objects3D = [],
  orbitPathPoints = [],
}: Props) {
  const globeRef = useRef<any>(undefined);
  const { camera } = useThree();
  const [globeRadius, setGlobeRadius] = useState(100); // Default radius

  // Preload all 3D models
  useEffect(() => {
    objects3D.forEach(obj => {
      useGLTF.preload(obj.path);
    });
  }, [objects3D]);

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
  }, [camera, updateControlsSpeeds]);

  // Handle camera controls changes
  const handleControlsChange = useCallback(() => {
    if (globeRef.current && controlsRef.current) {
      globeRef.current.setPointOfView(camera);
      updateControlsSpeeds();
    }
  }, [camera, updateControlsSpeeds]);

  // Update camera position based on selected view
  useEffect(() => {
    if (cameraView === "shuttle" && objects3D.length > 0 && camera) {
      // Use the first object as the focus for the camera
      const focusObject = objects3D[0];

      // Convert lat/lng to cartesian coordinates
      const objectPosition = new THREE.Vector3();
      if (globeRef.current) {
        const coords = globeRef.current.getCoords(
          focusObject.lat,
          focusObject.lng,
          focusObject.altitude
        );
        objectPosition.set(coords.x, coords.y, coords.z);
      }

      // Calculate the direction from the globe center to the object
      const directionFromCenter = new THREE.Vector3().copy(objectPosition).normalize();

      // Create a rotation matrix for the base orientation
      const upVector = new THREE.Vector3(0, 1, 0);
      const rightVector = new THREE.Vector3().crossVectors(upVector, directionFromCenter).normalize();
      const adjustedUpVector = new THREE.Vector3().crossVectors(directionFromCenter, rightVector).normalize();

      // Apply the object's rotation to get the actual direction
      const forward = new THREE.Vector3(0, 0, 1);

      // Create a quaternion from the object's rotation
      const [rotX, rotY, rotZ] = focusObject.rotation;
      const rotationEuler = new THREE.Euler(
        THREE.MathUtils.degToRad(rotX),
        THREE.MathUtils.degToRad(rotY),
        THREE.MathUtils.degToRad(rotZ)
      );
      const rotationQuaternion = new THREE.Quaternion().setFromEuler(rotationEuler);

      // Apply the rotation to the forward vector
      forward.applyQuaternion(rotationQuaternion);

      // Transform vector to be relative to the globe
      const baseMatrix = new THREE.Matrix4().makeBasis(rightVector, adjustedUpVector, directionFromCenter);
      forward.applyMatrix4(baseMatrix);

      const objectDirection = forward.normalize();

      // Create an offset that's behind and above the object
      const up = new THREE.Vector3(0, 1, 0);
      const right = new THREE.Vector3()
        .crossVectors(objectDirection, up)
        .normalize();
      const adjustedUp = new THREE.Vector3()
        .crossVectors(right, objectDirection)
        .normalize();

      // Create the offset vector (behind and above)
      const offset = new THREE.Vector3()
        .copy(objectDirection)
        .multiplyScalar(-30) // 30 units behind
        .add(adjustedUp.multiplyScalar(10)); // 10 units above

      const cameraPosition = new THREE.Vector3()
        .copy(objectPosition)
        .add(offset);

      // Set camera position and look in the direction the object is facing
      camera.position.copy(cameraPosition);
      camera.lookAt(new THREE.Vector3().addVectors(objectPosition, objectDirection));
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
  }, [cameraView, objects3D, camera]);

  // Create a custom 3D object
  const createObject3D = useCallback((data: CustomObject3D) => {
    const gltf = useGLTF(data.path);
    const obj = new THREE.Group();

    // Clone the scene
    if (gltf && gltf.scene) {
      const modelClone = gltf.scene.clone();

      // Create a container group for the model to apply rotations
      const modelContainer = new THREE.Group();
      modelContainer.add(modelClone);

      // Apply initial rotations to align the model
      modelContainer.rotateZ(-Math.PI / 2);
      modelContainer.rotateY(-Math.PI / 2);

      // Add the container to the main group
      obj.add(modelContainer);
    }

    return obj;
  }, []);

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
        // Add 3D Objects layer
        objectsData={objects3D}
        objectLat={(d: any) => (d as CustomObject3D).lat}
        objectLng={(d: any) => (d as CustomObject3D).lng}
        objectAltitude={(d: any) => (d as CustomObject3D).altitude}
        objectThreeObject={(d: any) => createObject3D(d as CustomObject3D)}
        objectFacesSurfaces={false} // Don't auto-rotate to face the surface
      />

      {/* Orbit Path Visualization */}
      {orbitPathPoints.length > 0 && (
        <OrbitPathVisualization
          orbitPathPoints={orbitPathPoints}
          globeRadius={globeRadius}
        />
      )}
    </>
  );
}

export default GlobeScene;
