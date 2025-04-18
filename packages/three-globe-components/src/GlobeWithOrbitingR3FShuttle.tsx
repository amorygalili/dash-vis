import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useGLTF, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import R3fGlobe from 'r3f-globe';
import { OrbitPoint } from './types';

interface Props {
  width: number;
  height: number;
  // Props for shuttle position and path
  shuttlePath?: string; // Path to the shuttle model
  shuttlePosition: THREE.Vector3; // Position for the shuttle
  shuttleLookAt: THREE.Vector3; // LookAt point for the shuttle
  orbitPathPoints: OrbitPoint[]; // Orbit path points
}

// Using OrbitPoint interface from types.ts

// Shuttle component that loads the GLB model and displays it at the given position
function Shuttle({
  path,
  position,
  lookAt,
}: {
  path: string;
  position: THREE.Vector3;
  lookAt: THREE.Vector3;
}) {
  const shuttleRef = useRef<THREE.Group>(null);

  // Load the model
  const { scene } = useGLTF(path);

  // Clone and prepare the model
  useEffect(() => {
    if (shuttleRef.current && scene) {
      // Clone the scene
      const modelClone = scene.clone();

      // Scale the model to an appropriate size
      // modelClone.scale.set(2, 2, 2);

       // Apply initial rotations to align the model with its direction of travel
      // Create a container group for the model to apply rotations
      const modelContainer = new THREE.Group();
      modelContainer.add(modelClone);  
      modelContainer.rotateZ(-Math.PI / 2);
      modelContainer.rotateY(-Math.PI / 2);

      // Add the container to the main group
      shuttleRef.current.add(modelContainer);
    }
  }, [scene]);

  // Update position and orientation
  useFrame(() => {
    if (shuttleRef.current) {
      // Set the shuttle position
      shuttleRef.current.position.copy(position);

      // Calculate direction vector from position to lookAt
      const direction = new THREE.Vector3().subVectors(lookAt, position).normalize();

      // Create a rotation matrix to orient the shuttle
      const up = new THREE.Vector3(0, 1, 0);
      const right = new THREE.Vector3().crossVectors(direction, up).normalize();
      const newUp = new THREE.Vector3().crossVectors(right, direction).normalize();

      const matrix = new THREE.Matrix4().makeBasis(right, newUp, direction.negate());
      shuttleRef.current.quaternion.setFromRotationMatrix(matrix);
    }
  });

  return (
    <group ref={shuttleRef} />
  );
}



// Camera view options
type CameraView = 'orbit' | 'shuttle';

// Main scene component with globe and shuttle
const GlobeScene: React.FC<{
  cameraView: CameraView,
  controlsRef: React.RefObject<any>,
  shuttlePath?: string,
  shuttlePosition: THREE.Vector3,
  shuttleLookAt: THREE.Vector3,
  orbitPathPoints: OrbitPoint[]
}> = ({
  cameraView,
  controlsRef,
  shuttlePath = "/Shuttle Model.glb",
  shuttlePosition,
  shuttleLookAt,
  orbitPathPoints
}) => {
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
          controlsRef.current.zoomSpeed = Math.max(0.02, Math.sqrt(distToSurface / radius) * 0.3);
          controlsRef.current.rotateSpeed = Math.max(0.005, distToSurface / radius * 0.4);
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
      controlsRef.current.zoomSpeed = Math.max(0.02, Math.sqrt(distToSurface / R) * 0.3);

      // Also adjust rotation speed for better control when zoomed in
      controlsRef.current.rotateSpeed = Math.max(0.005, distToSurface / R * 0.4);
    }
  }, [camera]);

  // Update camera position based on selected view
  useEffect(() => {
    if (cameraView === 'shuttle' && shuttlePosition && shuttleLookAt && camera) {
      // Position the camera slightly behind and above the shuttle
      const shuttleDirection = new THREE.Vector3().subVectors(shuttleLookAt, shuttlePosition).normalize();

      // Create an offset that's behind and above the shuttle
      const up = new THREE.Vector3(0, 1, 0);
      const right = new THREE.Vector3().crossVectors(shuttleDirection, up).normalize();
      const adjustedUp = new THREE.Vector3().crossVectors(right, shuttleDirection).normalize();

      // Create the offset vector (behind and above)
      const offset = new THREE.Vector3()
        .copy(shuttleDirection).multiplyScalar(-30) // 30 units behind
        .add(adjustedUp.multiplyScalar(10)); // 10 units above

      const cameraPosition = new THREE.Vector3().copy(shuttlePosition).add(offset);

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
      const lat = point.lat * Math.PI / 180; // Convert to radians
      const lng = point.lng * Math.PI / 180; // Convert to radians
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
      color: '#4fc3f7', // Light blue color
      opacity: 0.7,
      transparent: true,
      linewidth: 1
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
        enabled={cameraView === 'orbit'}
        onChange={handleControlsChange}
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
};

// Main component
const GlobeWithOrbitingR3FShuttle: React.FC<Props> = ({
  width,
  height,
  shuttlePath = "/Shuttle Model.glb",
  shuttlePosition,
  shuttleLookAt,
  orbitPathPoints
}) => {
  // Preload the model
  useGLTF.preload('/Shuttle Model.glb');

  // State for camera view selection
  const [cameraView, setCameraView] = useState<CameraView>('orbit');

  // Reference to the controls for reset functionality
  const controlsRef = useRef<any>(null);

  // Function to reset the camera to the default position
  const handleResetCamera = useCallback(() => {
    if (controlsRef.current) {
      // Manually set the camera to the default position
      const camera = controlsRef.current.object;
      if (camera) {
        camera.position.set(0, 0, 400);
        camera.lookAt(0, 0, 0);
        camera.updateProjectionMatrix();
      }
    }
  }, []);

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

          {/* Reset camera button */}
          <button
            onClick={handleResetCamera}
            style={{
              marginTop: '8px',
              padding: '6px 10px',
              backgroundColor: 'rgba(255,255,255,0.15)',
              border: '1px solid rgba(255,255,255,0.3)',
              borderRadius: '4px',
              color: 'white',
              cursor: 'pointer',
              fontSize: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background-color 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.25)'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.15)'}
          >
            🔄 Reset Camera
          </button>
        </div>
      </div>

      <Canvas
        flat
        camera={{ fov: 50, position: [0, 0, 400], near: 0.01, far: 10000 }}
      >
        <GlobeScene
          cameraView={cameraView}
          controlsRef={controlsRef}
          shuttlePath={shuttlePath}
          shuttlePosition={shuttlePosition}
          shuttleLookAt={shuttleLookAt}
          orbitPathPoints={orbitPathPoints}
        />
        <color attach="background" args={['black']} />
        <ambientLight color={0xffffff} intensity={0.8 * Math.PI} />
        <directionalLight position={[1, 1, 1]} intensity={0.8 * Math.PI} />
        <directionalLight position={[-1, -1, -1]} intensity={0.2 * Math.PI} />
      </Canvas>
    </div>
  );
};

export default GlobeWithOrbitingR3FShuttle;
