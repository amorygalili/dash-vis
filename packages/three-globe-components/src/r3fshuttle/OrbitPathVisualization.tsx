import React, { memo } from 'react';
import * as THREE from 'three';
import { OrbitPoint } from '../types';

interface OrbitPathVisualizationProps {
  orbitPathPoints: OrbitPoint[];
  globeRadius: number;
}

const OrbitPathVisualization: React.FC<OrbitPathVisualizationProps> = memo(({
  orbitPathPoints,
  globeRadius
}) => {
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
    const lat = (point.lat * Math.PI) / 180; // Convert to radians
    const lng = (point.lng * Math.PI) / 180; // Convert to radians
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
    color: "#4fc3f7", // Light blue color
    opacity: 0.7,
    transparent: true,
    linewidth: 1,
  });

  return <primitive object={new THREE.Line(geometry, material)} />;
});

export default OrbitPathVisualization;
