import { useRef, useState, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { OrbitPoint } from '../types';
import GlobeScene from './GlobeScene';

interface Props {
  width: number;
  height: number;
  // Props for shuttle position and path
  shuttlePath?: string; // Path to the shuttle model
  shuttlePosition: THREE.Vector3; // Position for the shuttle
  shuttleLookAt: THREE.Vector3; // LookAt point for the shuttle
  orbitPathPoints: OrbitPoint[]; // Orbit path points
}

// Camera view options
type CameraView = 'orbit' | 'shuttle';


// Main component
function GlobeWithOrbitingR3FShuttle({
  width,
  height,
  shuttlePath = "/Shuttle Model.glb",
  shuttlePosition,
  shuttleLookAt,
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
