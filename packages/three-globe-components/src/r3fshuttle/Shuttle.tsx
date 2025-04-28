import { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

// Shuttle component that loads the GLB model and displays it at the given position
function Shuttle({
  path,
  position,
  rotation,
}: {
  path: string;
  position: THREE.Vector3;
  rotation: THREE.Euler; // Changed from lookAt to rotation using Euler angles
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

      // Calculate rotation relative to the globe center
      // First, create a quaternion that would make the shuttle point away from the globe center
      const directionToCenter = new THREE.Vector3().copy(position).negate().normalize();
      const upVector = new THREE.Vector3(0, 1, 0);
      const rightVector = new THREE.Vector3().crossVectors(upVector, directionToCenter).normalize();
      const adjustedUpVector = new THREE.Vector3().crossVectors(directionToCenter, rightVector).normalize();

      // Create a rotation matrix and quaternion for the base orientation (pointing away from globe center)
      const baseMatrix = new THREE.Matrix4().makeBasis(rightVector, adjustedUpVector, directionToCenter);
      const baseQuaternion = new THREE.Quaternion().setFromRotationMatrix(baseMatrix);

      // Create a quaternion from the provided Euler rotation
      const rotationQuaternion = new THREE.Quaternion().setFromEuler(rotation);

      // Combine the quaternions (first align with globe, then apply the custom rotation)
      shuttleRef.current.quaternion.copy(baseQuaternion).multiply(rotationQuaternion);
    }
  });

  return (
    <group ref={shuttleRef} />
  );
}

export default Shuttle;