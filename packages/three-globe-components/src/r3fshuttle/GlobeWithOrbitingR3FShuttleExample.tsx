import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import GlobeWithOrbitingR3FShuttle from './GlobeWithOrbitingR3FShuttle';
import { OrbitPoint } from '../types';

interface Props {
  width: number;
  height: number;
}

/**
 * Example component that demonstrates how to use the refactored GlobeWithOrbitingR3FShuttle
 * with custom shuttle position and path.
 */
const GlobeWithOrbitingR3FShuttleExample: React.FC<Props> = ({ width, height }) => {
  // State for shuttle position and path
  const [shuttlePosition, setShuttlePosition] = useState<THREE.Vector3>(new THREE.Vector3(0, 0, 130));
  const [shuttleLookAt, setShuttleLookAt] = useState<THREE.Vector3>(new THREE.Vector3(0, 0, 0));
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

  // Animate the shuttle along the orbit path
  useEffect(() => {
    const intervalId = setInterval(() => {
      // Update the angle (faster movement)
      angle.current = (angle.current + 0.005) % (Math.PI * 2);

      // Calculate position using spherical coordinates with custom orbit
      const x = orbitRadius * Math.cos(angle.current);
      const z = orbitRadius * Math.sin(angle.current);
      const y = orbitHeight * Math.sin(angle.current * verticalOscillations); // Controlled vertical oscillation

      // Update the position
      setShuttlePosition(new THREE.Vector3(x, y, z));

      // Always look at the center of the globe
      setShuttleLookAt(new THREE.Vector3(0, 0, 0));
    }, 16); // ~60fps

    return () => clearInterval(intervalId);
  }, [orbitRadius, orbitHeight, verticalOscillations]);

  return (
    <div style={{ position: 'relative' }}>
    
      <GlobeWithOrbitingR3FShuttle
        width={width}
        height={height}
        shuttlePath="/Shuttle Model.glb"
        shuttlePosition={shuttlePosition}
        shuttleLookAt={shuttleLookAt}
        orbitPathPoints={orbitPath}
      />
    </div>
  );
};

export default GlobeWithOrbitingR3FShuttleExample;
