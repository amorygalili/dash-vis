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
function Shuttle({ path, globeRadius }: { path: string; globeRadius: number }) {
  const shuttleRef = useRef<THREE.Group>(null);
  const [angle, setAngle] = useState(0);
  const [modelLoaded, setModelLoaded] = useState(false);
  const [loadError, setLoadError] = useState(false);

  // Try to load the model
  const { scene, error } = useGLTF(path, true) as any;

  // Create a fallback model if needed
  const createFallbackModel = useCallback(() => {
    console.log('Creating fallback shuttle model');
    if (!shuttleRef.current) return;

    // Clear any existing children
    while (shuttleRef.current.children.length > 0) {
      shuttleRef.current.remove(shuttleRef.current.children[0]);
    }

    // Create a simple shuttle shape
    const shuttleGroup = new THREE.Group();

    // Body (cone)
    const bodyGeometry = new THREE.ConeGeometry(5, 15, 16);
    const bodyMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000 });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.rotation.x = -Math.PI / 2;
    shuttleGroup.add(body);

    // Wings
    const wingGeometry = new THREE.BoxGeometry(20, 1, 7);
    const wingMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff });
    const wings = new THREE.Mesh(wingGeometry, wingMaterial);
    wings.position.y = -5;
    shuttleGroup.add(wings);

    // Add to the main group
    shuttleRef.current.add(shuttleGroup);
    setModelLoaded(true);
  }, []);

  // Handle model loading error
  useEffect(() => {
    if (error) {
      console.error('Error loading model:', error);
      setLoadError(true);
    }
  }, [error]);

  // Clone and prepare the model or create fallback
  useEffect(() => {
    if (!shuttleRef.current) return;

    if (scene && !loadError) {
      console.log('GLB Model loaded, preparing shuttle');

      // Clear any existing children
      while (shuttleRef.current.children.length > 0) {
        shuttleRef.current.remove(shuttleRef.current.children[0]);
      }

      try {
        // Clone the scene
        const modelClone = scene.clone();

        // Scale the model to an appropriate size
        modelClone.scale.set(5, 5, 5); // Much larger scale for visibility

        // Add the scene to the group
        shuttleRef.current.add(modelClone);
        setModelLoaded(true);

        // Log for debugging
        console.log('Shuttle model added to scene');
      } catch (err) {
        console.error('Error preparing model:', err);
        setLoadError(true);
      }
    } else if (loadError) {
      createFallbackModel();
    }
  }, [scene, loadError, createFallbackModel]);

  // Create fallback model if loading takes too long
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!modelLoaded && shuttleRef.current) {
        console.log('Model loading timeout, creating fallback');
        setLoadError(true);
      }
    }, 5000); // 5 second timeout

    return () => clearTimeout(timeout);
  }, [modelLoaded, createFallbackModel]);

  // Animate the shuttle orbiting the globe
  useFrame(() => {
    if (shuttleRef.current && (modelLoaded || loadError)) {
      // Update the angle
      setAngle(prev => (prev + 0.005) % (Math.PI * 2));

      // Calculate the position on the orbit
      const orbitRadius = globeRadius * 1.5; // Orbit further from the globe surface for visibility
      const height = globeRadius * 0.5; // More height above the equator for visibility

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

  // For debugging - add a visible indicator while loading
  if (!modelLoaded && !loadError) {
    return (
      <group ref={shuttleRef}>
        <mesh position={[globeRadius * 1.5, 0, 0]}>
          <sphereGeometry args={[10, 16, 16]} />
          <meshBasicMaterial color="yellow" />
        </mesh>
      </group>
    );
  }

  return (
    <group ref={shuttleRef} />
  );
}

// Stars background component
function Stars() {
  const starsRef = useRef<THREE.Points>(null);

  useEffect(() => {
    if (starsRef.current) {
      // Animate stars slowly
      const animate = () => {
        if (starsRef.current) {
          starsRef.current.rotation.y += 0.0001;
        }
        requestAnimationFrame(animate);
      };

      animate();
    }
  }, []);

  // Create stars
  const [positions] = useState(() => {
    const positions = [];
    for (let i = 0; i < 5000; i++) {
      const r = 1000;
      const theta = 2 * Math.PI * Math.random();
      const phi = Math.acos(2 * Math.random() - 1);
      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.sin(phi) * Math.sin(theta);
      const z = r * Math.cos(phi);
      positions.push(x, y, z);
    }
    return new Float32Array(positions);
  });

  return (
    <points ref={starsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial size={0.5} color="#ffffff" />
    </points>
  );
}

// Main scene component with globe and shuttle
const GlobeScene: React.FC = () => {
  const globeRef = useRef<any>(undefined);
  const controlsRef = useRef<any>(undefined);
  const { camera } = useThree();
  const [globeRadius, setGlobeRadius] = useState(100); // Default radius

  // Log for debugging
  useEffect(() => {
    console.log('GlobeScene mounted, camera position:', camera.position);
  }, []);

  // Update globe radius when the globe is ready
  useEffect(() => {
    const checkGlobeRadius = () => {
      if (globeRef.current) {
        globeRef.current.setPointOfView(camera);
        // Get the actual globe radius and update state
        const radius = globeRef.current.getGlobeRadius();
        if (radius) {
          console.log('Globe radius detected:', radius);
          setGlobeRadius(radius);
        } else {
          console.log('Globe radius not available yet, retrying...');
          // Try again in a moment
          setTimeout(checkGlobeRadius, 500);
        }
      } else {
        console.log('Globe ref not available yet, retrying...');
        // Try again in a moment
        setTimeout(checkGlobeRadius, 500);
      }
    };

    // Start checking for globe radius
    checkGlobeRadius();
  }, [camera]);

  const handleCameraChange = useCallback(() => {
    if (globeRef.current) {
      globeRef.current.setPointOfView(camera);
      const R = globeRef.current.getGlobeRadius();
      if (R) {
        const distToSurface = camera.position.length() - R;
        if (controlsRef.current) {
          controlsRef.current.rotateSpeed = (distToSurface / R) * 0.4;
          controlsRef.current.zoomSpeed = Math.sqrt(distToSurface / R) * 0.3;
        }
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
        onChange={handleCameraChange}
      />

      {/* r3f-globe component */}
      <R3fGlobe
        ref={globeRef}
        globeImageUrl="//cdn.jsdelivr.net/npm/three-globe/example/img/earth-blue-marble.jpg"
        bumpImageUrl="//cdn.jsdelivr.net/npm/three-globe/example/img/earth-topology.png"
        onGlobeReady={() => {
          console.log('Globe is ready');
          if (globeRef.current) {
            const radius = globeRef.current.getGlobeRadius();
            console.log('Globe radius on ready:', radius);
            if (radius) {
              setGlobeRadius(radius);
            }
          }
        }}
      />

      {/* Orbiting Shuttle */}
      {globeRadius > 0 && (
        <Shuttle path="/Shuttle Model.glb" globeRadius={globeRadius} />
      )}

      {/* Stars background */}
      <Stars />
    </>
  );
};

// Main component
const GlobeWithOrbitingR3FShuttle: React.FC<Props> = ({ width, height }) => {
  // Preload the model
  useEffect(() => {
    // Preload the model
    useGLTF.preload('/Shuttle Model.glb');
    console.log('Preloaded Shuttle Model.glb');
  }, []);

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
