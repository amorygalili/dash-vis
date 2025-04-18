import { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

// Shuttle component that loads the GLB model and displays it at the given position
function Shuttle({
  path,
  position,
  lookAt,
}: {
  path: string;
  position: THREE.Vector3;
  lookAt: THREE.Vector3;
}) {
  const shuttleRef = useRef<THREE.Group>(null);

  // Load the model
  const { scene } = useGLTF(path);

  // Clone and prepare the model
  useEffect(() => {
    if (shuttleRef.current && scene) {
      // Clone the scene
      const modelClone = scene.clone();

      // Scale the model to an appropriate size
      // modelClone.scale.set(2, 2, 2);

       // Apply initial rotations to align the model with its direction of travel
      // Create a container group for the model to apply rotations
      const modelContainer = new THREE.Group();
      modelContainer.add(modelClone);  
      modelContainer.rotateZ(-Math.PI / 2);
      modelContainer.rotateY(-Math.PI / 2);

      // Add the container to the main group
      shuttleRef.current.add(modelContainer);
    }
  }, [scene]);

  // Update position and orientation
  useFrame(() => {
    if (shuttleRef.current) {
      // Set the shuttle position
      shuttleRef.current.position.copy(position);

      // Calculate direction vector from position to lookAt
      const direction = new THREE.Vector3().subVectors(lookAt, position).normalize();

      // Create a rotation matrix to orient the shuttle
      const up = new THREE.Vector3(0, 1, 0);
      const right = new THREE.Vector3().crossVectors(direction, up).normalize();
      const newUp = new THREE.Vector3().crossVectors(right, direction).normalize();

      const matrix = new THREE.Matrix4().makeBasis(right, newUp, direction.negate());
      shuttleRef.current.quaternion.setFromRotationMatrix(matrix);
    }
  });

  return (
    <group ref={shuttleRef} />
  );
}

export default Shuttle;