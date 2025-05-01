import React, { useState, useEffect, useRef } from 'react';
import GlobeWithOrbitingR3FShuttle, { Object3D } from './GlobeWithOrbitingR3FShuttle';
import { OrbitPoint } from '../types';

interface Props {
  width: number;
  height: number;
}

/**
 * Example component that demonstrates how to use the refactored GlobeWithOrbitingR3FShuttle
 * with multiple 3D objects.
 */
const GlobeWithOrbitingR3FShuttleExample: React.FC<Props> = ({ width, height }) => {
  // State for 3D objects and orbit path
  const [objects3D, setObjects3D] = useState<Object3D[]>([]);
  const [orbitPath, setOrbitPath] = useState<OrbitPoint[]>([]);

  // Animation parameters
  const angle = useRef(0);
  const globeRadius = 100;
  const orbitRadius = globeRadius * 1.5; // Larger orbit than default
  const orbitHeight = globeRadius * 0.5; // Higher orbit than default
  const verticalOscillations = 3; // Number of vertical oscillations per orbit

  // Generate orbit path points
  useEffect(() => {
    const orbitPoints: OrbitPoint[] = [];
    const numPoints = 100;

    for (let i = 0; i < numPoints; i++) {
      const a = (i / numPoints) * Math.PI * 2;

      // Calculate position using spherical coordinates with custom orbit
      const x = orbitRadius * Math.cos(a);
      const z = orbitRadius * Math.sin(a);
      const y = orbitHeight * Math.sin(a * verticalOscillations); // Controlled vertical oscillation

      // Convert cartesian to spherical coordinates
      const r = Math.sqrt(x*x + y*y + z*z);
      const lat = Math.asin(y / r) * 180 / Math.PI;
      const lng = Math.atan2(z, x) * 180 / Math.PI;

      orbitPoints.push({
        lat,
        lng,
        alt: (r - globeRadius) / globeRadius
      });
    }

    setOrbitPath(orbitPoints);
  }, [orbitRadius, orbitHeight, globeRadius, verticalOscillations]);

  // Animate the objects along the orbit path
  useEffect(() => {
    const intervalId = setInterval(() => {
      // Update the angle (faster movement)
      angle.current = (angle.current + 0.005) % (Math.PI * 2);

      // Create multiple objects at different positions along the orbit
      const newObjects: Object3D[] = [];

      // Main shuttle
      const verticalAngle = angle.current * verticalOscillations;

      // Calculate position using spherical coordinates
      const x = orbitRadius * Math.cos(angle.current);
      const z = orbitRadius * Math.sin(angle.current);
      const y = orbitHeight * Math.sin(verticalAngle);

      // Convert cartesian to spherical coordinates
      const r = Math.sqrt(x*x + y*y + z*z);
      const lat = Math.asin(y / r) * 180 / Math.PI;
      const lng = Math.atan2(z, x) * 180 / Math.PI;
      const alt = (r - globeRadius) / globeRadius;

      // Create rotation angles
      const roll = Math.sin(verticalAngle) * 30; // Convert to degrees
      const pitch = Math.sin(angle.current * 2) * 15;
      const yaw = Math.cos(angle.current) * 10;

      // Add main shuttle
      newObjects.push({
        id: 'shuttle1',
        path: "/Shuttle Model.glb",
        lat,
        lng,
        altitude: alt,
        rotation: [roll, pitch, yaw]
      });

      // Add a second shuttle at the opposite side of the orbit
      const oppositeAngle = (angle.current + Math.PI) % (Math.PI * 2);
      const oppositeVerticalAngle = oppositeAngle * verticalOscillations;

      const x2 = orbitRadius * Math.cos(oppositeAngle);
      const z2 = orbitRadius * Math.sin(oppositeAngle);
      const y2 = orbitHeight * Math.sin(oppositeVerticalAngle);

      const r2 = Math.sqrt(x2*x2 + y2*y2 + z2*z2);
      const lat2 = Math.asin(y2 / r2) * 180 / Math.PI;
      const lng2 = Math.atan2(z2, x2) * 180 / Math.PI;
      const alt2 = (r2 - globeRadius) / globeRadius;

      // Add second shuttle with different rotation
      newObjects.push({
        id: 'shuttle2',
        path: "/Shuttle Model.glb",
        lat: lat2,
        lng: lng2,
        altitude: alt2,
        rotation: [-roll, -pitch, -yaw]
      });

      // Update the objects state
      setObjects3D(newObjects);
    }, 16); // ~60fps

    return () => clearInterval(intervalId);
  }, [orbitRadius, orbitHeight, globeRadius, verticalOscillations]);

  return (
    <div style={{ position: 'relative' }}>
      <GlobeWithOrbitingR3FShuttle
        width={width}
        height={height}
        objects3D={objects3D}
        orbitPathPoints={orbitPath}
      />
      <div style={{ position: 'absolute', top: 10, left: 10, background: 'rgba(0,0,0,0.7)', color: 'white', padding: '5px 10px', borderRadius: 5 }}>
        Multiple 3D objects with rotation in [x, y, z] degrees
      </div>
    </div>
  );
};

export default GlobeWithOrbitingR3FShuttleExample;
