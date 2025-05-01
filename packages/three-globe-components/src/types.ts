// Interface for orbit path points
export interface OrbitPoint {
  lat: number;
  lng: number;
  alt: number;
}

export interface Object3D {
  id: string;
  path: string; // Path to the 3D model
  lat: number; // Latitude
  lng: number; // Longitude
  altitude: number; // Altitude in globe radius units
  rotation: [number, number, number]; // [x, y, z] rotation in degrees
}
