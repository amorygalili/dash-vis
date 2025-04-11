import { useEffect, useRef, useState } from 'react';
import Globe from 'react-globe.gl';
import * as THREE from 'three';

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
  const animationRef = useRef<number | null>(null);

  // Create a simple shuttle model and start animation
  useEffect(() => {
    console.log('Setting up shuttle orbit animation');

    // Initialize shuttle data
    setShuttleData([{
      lat: 0,
      lng: 0,
      alt: 0.5 // Altitude above the globe surface
    }]);

    // Start animation after a short delay to ensure the globe is initialized
    const timeoutId = setTimeout(() => {
      if (!globeRef.current) {
        console.error('Globe ref not available');
        return;
      }

      console.log('Starting shuttle animation');
      let angle = 0;
      const orbitRadius = 40; // Orbit radius in degrees
      const orbitSpeed = 1; // Degrees per frame
      const orbitAltitude = 0.5; // Altitude above the globe surface

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

        animationRef.current = requestAnimationFrame(animateOrbit);
      };

      animationRef.current = requestAnimationFrame(animateOrbit);
    }, 1000); // Wait 1 second for everything to initialize

    return () => {
      clearTimeout(timeoutId);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  // Log the current state for debugging
  useEffect(() => {
    console.log('Shuttle data updated:', shuttleData);
  }, [shuttleData]);

  return (
    <Globe
      width={width}
      height={height}
      ref={globeRef}
      globeImageUrl="//cdn.jsdelivr.net/npm/three-globe/example/img/earth-blue-marble.jpg"
      bumpImageUrl="//cdn.jsdelivr.net/npm/three-globe/example/img/earth-topology.png"
      backgroundImageUrl="//cdn.jsdelivr.net/npm/three-globe/example/img/night-sky.png"
      customLayerData={shuttleData}
      onGlobeReady={() => console.log('Globe is ready')}
      customThreeObject={() => {
        // Create a visible shuttle model
        const group = new THREE.Group();

        // Create a cone for the body
        const bodyGeometry = new THREE.ConeGeometry(2, 8, 16);
        const bodyMaterial = new THREE.MeshLambertMaterial({ color: 0xff0000 });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.rotation.x = -Math.PI / 2; // Point forward
        group.add(body);

        // Create wings
        const wingGeometry = new THREE.BoxGeometry(10, 1, 3);
        const wingMaterial = new THREE.MeshLambertMaterial({ color: 0xffffff });
        const wings = new THREE.Mesh(wingGeometry, wingMaterial);
        wings.position.y = -2;
        group.add(wings);

        // Scale up for visibility
        group.scale.set(3, 3, 3);

        return group;
      }}
      customThreeObjectUpdate={(obj, d) => {
        if (!globeRef.current) return;

        const data = d as ShuttleData;

        // Position the shuttle at the correct coordinates
        const position = globeRef.current.getCoords(data.lat, data.lng, data.alt);
        Object.assign(obj.position, position);

        // Calculate direction of travel (tangent to the orbit)
        const nextLng = (data.lng + 1) % 360;
        const nextPosition = globeRef.current.getCoords(data.lat, nextLng, data.alt);

        // Make the shuttle face the direction of travel
        const lookAtPosition = new THREE.Vector3(nextPosition.x, nextPosition.y, nextPosition.z);
        obj.lookAt(lookAtPosition);
      }}
    />
  );
};

export default GlobeWithOrbitingGlbShuttle;
