import { useRef, useState, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { OrbitPoint } from '../types';
import GlobeScene from './GlobeScene';
import CameraViewSelector, { CameraView } from './CameraViewSelector';

interface Props {
  width: number;
  height: number;
  // Props for shuttle position and path
  shuttlePath?: string; // Path to the shuttle model
  shuttlePosition: THREE.Vector3; // Position for the shuttle
  shuttleRotation: THREE.Euler; // Rotation using Euler angles (roll, pitch, yaw)
  orbitPathPoints: OrbitPoint[]; // Orbit path points
}

// Camera view type is now imported from CameraViewSelector


// Main component
function GlobeWithOrbitingR3FShuttle({
  width,
  height,
  shuttlePath = "/Shuttle Model.glb",
  shuttlePosition,
  shuttleRotation,
  orbitPathPoints
}: Props) {
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
      {/* Camera view selector component */}
      <CameraViewSelector
        cameraView={cameraView}
        setCameraView={setCameraView}
        handleResetCamera={handleResetCamera}
      />

      <Canvas
        flat
        camera={{ fov: 50, position: [0, 0, 400], near: 0.01, far: 10000 }}
      >
        <GlobeScene
          cameraView={cameraView}
          controlsRef={controlsRef}
          shuttlePath={shuttlePath}
          shuttlePosition={shuttlePosition}
          shuttleRotation={shuttleRotation}
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
