import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useGLTF, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import R3fGlobe from 'r3f-globe';

interface Props {
  width: number;
  height: number;
}

// Shuttle component that loads the GLB model and handles the orbit animation
function Shuttle({ path, globeRadius }: { path: string; globeRadius: number }) {
  const shuttleRef = useRef<THREE.Group>(null);
  const [angle, setAngle] = useState(0);

  // Load the model
  const { scene } = useGLTF(path);

  // Clone and prepare the model
  useEffect(() => {
    if (shuttleRef.current && scene) {
      console.log('GLB Model loaded, preparing shuttle');

      // Clone the scene
      const modelClone = scene.clone();

      // Scale the model to an appropriate size
      modelClone.scale.set(5, 5, 5); // Larger scale for visibility

      // Add the scene to the group
      shuttleRef.current.add(modelClone);

      console.log('Shuttle model added to scene');
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

      // Make the shuttle face the direction of travel
      const tangent = new THREE.Vector3(-Math.sin(angle), 0, Math.cos(angle));
      const normal = new THREE.Vector3(0, 1, 0);
      const binormal = new THREE.Vector3().crossVectors(normal, tangent);

      // Create a rotation matrix
      const matrix = new THREE.Matrix4().makeBasis(tangent, binormal, normal);
      shuttleRef.current.quaternion.setFromRotationMatrix(matrix);

      // Add a slight tilt in the direction of the orbit
      shuttleRef.current.rotateY(Math.PI / 2);
    }
  });

  return (
    <group ref={shuttleRef} />
  );
}



// Main scene component with globe and shuttle
const GlobeScene: React.FC = () => {
  const globeRef = useRef<any>(undefined);
  const controlsRef = useRef<any>(undefined);
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
      }
    }
  }, [camera]);

  return (
    <>
      <OrbitControls
        ref={controlsRef}
        minDistance={globeRadius * 1.1}
        maxDistance={1000}
        dampingFactor={0.1}
        zoomSpeed={0.3}
        rotateSpeed={0.3}
      />

      {/* r3f-globe component */}
      <R3fGlobe
        ref={globeRef}
        globeImageUrl="//cdn.jsdelivr.net/npm/three-globe/example/img/earth-blue-marble.jpg"
        bumpImageUrl="//cdn.jsdelivr.net/npm/three-globe/example/img/earth-topology.png"
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
      <Shuttle path="/Shuttle Model.glb" globeRadius={globeRadius} />
    </>
  );
};

// Main component
const GlobeWithOrbitingR3FShuttle: React.FC<Props> = ({ width, height }) => {
  // Preload the model

  return (
    <div style={{ width: `${width}px`, height: `${height}px` }}>
      <Canvas
        flat
        camera={{ fov: 50, position: [0, 0, 400], near: 0.01, far: 10000 }}
      >
        <GlobeScene />
        <color attach="background" args={['black']} />
        <ambientLight color={0xcccccc} intensity={Math.PI} />
        <directionalLight intensity={0.6 * Math.PI} />
      </Canvas>
    </div>
  );
};

export default GlobeWithOrbitingR3FShuttle;
