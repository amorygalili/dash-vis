import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useGLTF, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import R3fGlobe from 'r3f-globe';

interface Props {
  width: number;
  height: number;
}

// Shuttle component that loads the GLB model and handles the orbit animation
function Shuttle({
  path,
  globeRadius,
  onPositionUpdate
}: {
  path: string;
  globeRadius: number;
  onPositionUpdate?: (position: THREE.Vector3, lookAt: THREE.Vector3) => void;
}) {
  const shuttleRef = useRef<THREE.Group>(null);
  const [angle, setAngle] = useState(0);

  // Load the model
  const { scene } = useGLTF(path);

  // Clone and prepare the model
  useEffect(() => {
    if (shuttleRef.current && scene) {
      // Clone the scene
      const modelClone = scene.clone();

      // Scale the model to an appropriate size
      modelClone.scale.set(5, 5, 5); // Larger scale for visibility

      // Add the scene to the group
      shuttleRef.current.add(modelClone);
    }
  }, [scene]);

  // Animate the shuttle orbiting the globe
  useFrame(() => {
    if (shuttleRef.current) {
      // Update the angle
      setAngle(prev => (prev + 0.005) % (Math.PI * 2));

      // Calculate the position on the orbit
      const orbitRadius = globeRadius * 1.5; // Orbit above the globe surface
      const height = globeRadius * 0.5; // Height above the equator

      // Calculate position using spherical coordinates
      const x = orbitRadius * Math.cos(angle);
      const z = orbitRadius * Math.sin(angle);
      const y = height * Math.sin(angle * 2); // Add some vertical movement

      // Update the position
      shuttleRef.current.position.set(x, y, z);

      // Calculate direction of travel for orientation
      const tangent = new THREE.Vector3(-Math.sin(angle), 0, Math.cos(angle));
      const normal = new THREE.Vector3(0, 1, 0);
      const binormal = new THREE.Vector3().crossVectors(normal, tangent);

      // Create a rotation matrix
      const matrix = new THREE.Matrix4().makeBasis(tangent, binormal, normal);
      shuttleRef.current.quaternion.setFromRotationMatrix(matrix);

      // Add a slight tilt in the direction of the orbit
      shuttleRef.current.rotateY(Math.PI / 2);

      // Calculate a point to look at (in front of the shuttle)
      // This will be used for the shuttle camera view
      if (onPositionUpdate) {
        // Get the current position
        const position = new THREE.Vector3();
        shuttleRef.current.getWorldPosition(position);

        // Calculate a point in front of the shuttle to look at
        // We'll look at the Earth (origin) but slightly offset to see where we're going
        const lookAt = new THREE.Vector3(0, 0, 0);

        // Call the callback with the updated position and lookAt
        onPositionUpdate(position, lookAt);
      }
    }
  });

  return (
    <group ref={shuttleRef} />
  );
}



// Camera view options
type CameraView = 'orbit' | 'shuttle';

// Main scene component with globe and shuttle
const GlobeScene: React.FC<{ cameraView: CameraView }> = ({ cameraView }) => {
  const globeRef = useRef<any>(undefined);
  const controlsRef = useRef<any>(undefined);
  const { camera } = useThree();
  const [globeRadius, setGlobeRadius] = useState(100); // Default radius
  const [shuttlePosition, setShuttlePosition] = useState<THREE.Vector3 | null>(null);
  const [shuttleLookAt, setShuttleLookAt] = useState<THREE.Vector3 | null>(null);

  // Handle shuttle position updates
  const handleShuttlePositionUpdate = useCallback((position: THREE.Vector3, lookAt: THREE.Vector3) => {
    setShuttlePosition(position.clone());
    setShuttleLookAt(lookAt.clone());
  }, []);

  // Update globe radius when the globe is ready
  useEffect(() => {
    if (globeRef.current) {
      globeRef.current.setPointOfView(camera);
      // Get the actual globe radius and update state
      const radius = globeRef.current.getGlobeRadius();
      if (radius) {
        setGlobeRadius(radius);
      }
    }
  }, [camera]);

  // Update camera position based on selected view
  useEffect(() => {
    if (cameraView === 'shuttle' && shuttlePosition && shuttleLookAt && camera) {
      // Position the camera slightly behind and above the shuttle
      const offset = new THREE.Vector3(0, 10, -30); // Offset from shuttle position
      const cameraPosition = shuttlePosition.clone().add(offset);

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

  return (
    <>
      <OrbitControls
        ref={controlsRef}
        minDistance={globeRadius * 1.1}
        maxDistance={1000}
        dampingFactor={0.1}
        zoomSpeed={0.3}
        rotateSpeed={0.3}
        enabled={cameraView === 'orbit'}
      />

      {/* r3f-globe component with satellite imagery */}
      <R3fGlobe
        ref={globeRef}
        globeTileEngineUrl={(x, y, l) => `https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/${l}/${y}/${x}`}
        onGlobeReady={() => {
          if (globeRef.current) {
            const radius = globeRef.current.getGlobeRadius();
            if (radius) {
              setGlobeRadius(radius);
            }
          }
        }}
      />

      {/* Orbiting Shuttle */}
      <Shuttle
        path="/Shuttle Model.glb"
        globeRadius={globeRadius}
        onPositionUpdate={handleShuttlePositionUpdate}
      />
    </>
  );
};

// Main component
const GlobeWithOrbitingR3FShuttle: React.FC<Props> = ({ width, height }) => {
  // Preload the model
  useGLTF.preload('/Shuttle Model.glb');

  // State for camera view selection
  const [cameraView, setCameraView] = useState<CameraView>('orbit');

  return (
    <div style={{ width: `${width}px`, height: `${height}px`, position: 'relative' }}>
      {/* Camera view selector */}
      <div style={{
        position: 'absolute',
        top: '10px',
        left: '10px',
        zIndex: 100,
        background: 'rgba(0,0,0,0.7)',
        padding: '10px',
        borderRadius: '8px',
        color: 'white',
        fontFamily: 'Arial, sans-serif',
        boxShadow: '0 2px 10px rgba(0,0,0,0.3)',
        backdropFilter: 'blur(5px)',
        border: '1px solid rgba(255,255,255,0.1)'
      }}>
        <div style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '8px' }}>
          Camera View
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label style={{
            display: 'flex',
            alignItems: 'center',
            cursor: 'pointer',
            padding: '4px',
            borderRadius: '4px',
            backgroundColor: cameraView === 'orbit' ? 'rgba(255,255,255,0.2)' : 'transparent'
          }}>
            <input
              type="radio"
              name="cameraView"
              value="orbit"
              checked={cameraView === 'orbit'}
              onChange={() => setCameraView('orbit')}
              style={{ marginRight: '8px' }}
            />
            <span>🌎 Orbit View</span>
          </label>
          <label style={{
            display: 'flex',
            alignItems: 'center',
            cursor: 'pointer',
            padding: '4px',
            borderRadius: '4px',
            backgroundColor: cameraView === 'shuttle' ? 'rgba(255,255,255,0.2)' : 'transparent'
          }}>
            <input
              type="radio"
              name="cameraView"
              value="shuttle"
              checked={cameraView === 'shuttle'}
              onChange={() => setCameraView('shuttle')}
              style={{ marginRight: '8px' }}
            />
            <span>🚀 Shuttle View</span>
          </label>
        </div>
      </div>

      <Canvas
        flat
        camera={{ fov: 50, position: [0, 0, 400], near: 0.01, far: 10000 }}
      >
        <GlobeScene cameraView={cameraView} />
        <color attach="background" args={['black']} />
        <ambientLight color={0xffffff} intensity={0.8 * Math.PI} />
        <directionalLight position={[1, 1, 1]} intensity={0.8 * Math.PI} />
        <directionalLight position={[-1, -1, -1]} intensity={0.2 * Math.PI} />
      </Canvas>
    </div>
  );
};

export default GlobeWithOrbitingR3FShuttle;
