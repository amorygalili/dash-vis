import { useEffect, useRef, useState } from 'react';
import Globe from 'react-globe.gl';
import * as THREE from 'three';
// @ts-ignore - These modules exist but TypeScript can't find them
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
// @ts-ignore - These modules exist but TypeScript can't find them
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';

interface Props {
  width: number;
  height: number;
}

interface ShuttleData {
  lat: number;
  lng: number;
  alt: number;
}

const GlobeWithOrbitingGlbShuttle = ({ width, height }: Props) => {
  const globeRef = useRef<any>(undefined);
  const [shuttleData, setShuttleData] = useState<ShuttleData[]>([]);
  const shuttleModelRef = useRef<THREE.Group | null>(null);

  // Load the shuttle model and start animation
  useEffect(() => {
    // Initialize DRACO loader
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/');

    // Initialize GLTF loader with DRACO support
    const gltfLoader = new GLTFLoader();
    gltfLoader.setDRACOLoader(dracoLoader);

    // Load the model
    gltfLoader.load('/Shuttle Model.glb',
      // @ts-ignore - Type issues with the GLTFLoader
      (gltf: any) => {
        const model = gltf.scene;

        // Scale the model down to an appropriate size
        model.scale.set(0.05, 0.05, 0.05);

        // Create a group to hold the model
        const group = new THREE.Group();
        group.add(model);

        // Store the model in the ref
        shuttleModelRef.current = group;

        // Initialize shuttle data
        setShuttleData([{
          lat: 0,
          lng: 0,
          alt: 0.2 // Altitude above the globe surface
        }]);

        // Wait for the next frame to ensure the globe is initialized
        const timeoutId = setTimeout(() => {
          if (!globeRef.current) {
            console.error('Globe ref not available');
            return;
          }

          console.log('Starting GLB shuttle animation');
          let angle = 0;
          const orbitRadius = 30; // Orbit radius in degrees
          const orbitSpeed = 0.5; // Degrees per frame
          const orbitAltitude = 0.2; // Altitude above the globe surface

          const animateOrbit = () => {
            angle += orbitSpeed;

            // Calculate new position along the orbit
            const lat = orbitRadius * Math.sin(angle * Math.PI / 180);
            const lng = angle % 360;

            setShuttleData([{
              lat,
              lng,
              alt: orbitAltitude
            }]);

            requestAnimationFrame(animateOrbit);
          };

          const animationId = requestAnimationFrame(animateOrbit);

          // Store the animation ID in a ref so we can clean it up later
          const cleanupRef = { current: animationId };

          // Set up cleanup function
          return () => {
            console.log('Cleaning up GLB shuttle animation');
            cancelAnimationFrame(cleanupRef.current);
          };
        }, 500); // Wait 500ms for everything to initialize

        return () => {
          clearTimeout(timeoutId);
        };
      },
      // @ts-ignore - Type issues with the GLTFLoader
      (xhr: any) => {
        console.log((xhr.loaded / xhr.total * 100) + '% loaded');
      },
      // @ts-ignore - Type issues with the GLTFLoader
      (error: any) => {
        console.error('Error loading shuttle model:', error);
      }
    );

    // Clean up
    return () => {
      dracoLoader.dispose();
    };
  }, []);

  // Custom object update function to position and rotate the shuttle
  const customThreeObjectUpdate = (obj: THREE.Object3D, objData: object) => {
    if (!globeRef.current) return;

    const d = objData as ShuttleData;

    // Position the shuttle at the correct coordinates
    const position = globeRef.current.getCoords(d.lat, d.lng, d.alt);
    Object.assign(obj.position, position);

    // Calculate direction of travel (tangent to the orbit)
    const nextLng = (d.lng + 1) % 360;
    const nextPosition = globeRef.current.getCoords(d.lat, nextLng, d.alt);

    // Make the shuttle face the direction of travel
    const lookAtPosition = new THREE.Vector3(nextPosition.x, nextPosition.y, nextPosition.z);
    obj.lookAt(lookAtPosition);
  };

  return (
    <Globe
      width={width}
      height={height}
      ref={globeRef}
      globeImageUrl="//cdn.jsdelivr.net/npm/three-globe/example/img/earth-blue-marble.jpg"
      bumpImageUrl="//cdn.jsdelivr.net/npm/three-globe/example/img/earth-topology.png"
      backgroundImageUrl="//cdn.jsdelivr.net/npm/three-globe/example/img/night-sky.png"
      customLayerData={shuttleData}
      customThreeObject={() => {
        // Return the shuttle model
        if (!shuttleModelRef.current) {
          // Return an empty mesh if the model isn't ready yet
          return new THREE.Mesh();
        }
        return shuttleModelRef.current.clone();
      }}
      customThreeObjectUpdate={customThreeObjectUpdate}
    />
  );
};

export default GlobeWithOrbitingGlbShuttle;
