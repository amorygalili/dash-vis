import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import * as THREE from "three";

export function GlbModelLoader({ path }: { path: string }) {
    const { scene } = useGLTF(path);

    return (
        <Canvas gl={{ antialias: true, toneMapping: THREE.NoToneMapping }}>
            <ambientLight intensity={1} />
            <directionalLight position={[0, 10, 5]} intensity={1}/>
            <primitive object={scene} />
            <OrbitControls />
        </Canvas>
    );
}