import React, { useRef, useEffect, useCallback } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import R3fGlobe from 'r3f-globe';

interface Props {
  width: number;
  height: number;
}

const GlobeComponent: React.FC = () => {
  const globeRef = useRef<any>(undefined);
  const controlsRef = useRef<any>(undefined);
  const { camera } = useThree();

  useEffect(() => {
    if (globeRef.current) {
      globeRef.current.setPointOfView(camera);
    }
  }, [camera]);

  const handleCameraChange = useCallback(() => {
    if (globeRef.current) {
      globeRef.current.setPointOfView(camera);
      const R = globeRef.current.getGlobeRadius();
      const distToSurface = camera.position.length() - R;
      if (controlsRef.current) {
        controlsRef.current.rotateSpeed = (distToSurface / R) * 0.4;
        controlsRef.current.zoomSpeed = Math.sqrt(distToSurface / R) * 0.3;
      }
    }
  }, [camera]);

  return (
    <>
      <OrbitControls
        ref={controlsRef}
        minDistance={100 + Math.max(0.001, camera.near * 1.1)}
        maxDistance={camera.far - 100}
        dampingFactor={0.1}
        zoomSpeed={0.3}
        rotateSpeed={0.3}
        onChange={handleCameraChange}
      />
      <R3fGlobe
        ref={globeRef}
        globeTileEngineUrl={(x, y, l) => `https://tile.openstreetmap.org/${l}/${x}/${y}.png`}
      />
    </>
  );
};

const TiledGlobe: React.FC<Props> = ({ width, height }) => {
  return (
    <div style={{ width: `${width}px`, height: `${height}px` }}>
      <Canvas
        flat
        camera={{ fov: 50, position: [0, 0, 400], near: 0.01, far: 10000 }}
      >
        <GlobeComponent />
        <color attach="background" args={['black']} />
        <ambientLight color={0xcccccc} intensity={Math.PI} />
        <directionalLight intensity={0.6 * Math.PI} />
      </Canvas>
    </div>
  );
};

export default TiledGlobe;
