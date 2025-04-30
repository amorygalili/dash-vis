import { Scene, Object3D, Material, BufferGeometry, Mesh, MeshLambertMaterial } from 'three';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';

interface GlobeObject extends Object3D {
    __globeObjType?: string;
    __data?: any;
    material?: Material | Material[];
    geometry?: BufferGeometry | TextGeometry;
}

function inspectLabels(scene: Scene): void {
    console.group('Labels Inspection');
    
    scene.traverse((obj: Object3D) => {
        const globeObj = obj as GlobeObject;
        if (globeObj.__globeObjType === 'label') {
            console.group('Label Object:', {
                type: globeObj.type,
                position: globeObj.position.toArray(),
                visible: globeObj.visible,
                userData: globeObj.userData,
                data: globeObj.__data
            });
            
            // Inspect direct children
            globeObj.children.forEach((child: Object3D, i: number) => {
                const childObj = child as GlobeObject;
                const mesh = childObj as Mesh;
                
                console.group(`Child ${i}:`, {
                    type: childObj.type,
                    geometryType: childObj.geometry?.type || 'none',
                    // materialType: childObj.material?.type || 'none',
                    visible: childObj.visible,
                    position: childObj.position.toArray(),
                    scale: childObj.scale.toArray()
                });

                // Additional details for text geometry
                if (childObj.geometry?.type === 'TextGeometry') {
                    console.log('Text Geometry Details:', {
                        parameters: (childObj.geometry as any).parameters,
                        boundingBox: childObj.geometry.boundingBox,
                        size: (childObj.geometry as any).parameters?.size,
                        height: (childObj.geometry as any).parameters?.height,
                        curveSegments: (childObj.geometry as any).parameters?.curveSegments
                    });
                }

                // Material details
                if (mesh.material) {
                    const material = mesh.material as MeshLambertMaterial;
                    console.log('Material Details:', {
                        color: material.color?.getHexString(),
                        opacity: material.opacity,
                        transparent: material.transparent,
                        visible: material.visible
                    });
                }

                // Inspect grandchildren (for the text mesh's bounding box)
                childObj.children.forEach((grandChild: Object3D, j: number) => {
                    const grandChildObj = grandChild as GlobeObject;
                    console.log(`Grandchild ${j}:`, {
                        type: grandChildObj.type,
                        geometry: grandChildObj.geometry?.type || 'none',
                        // material: grandChildObj.material?.type || 'none',
                        visible: grandChildObj.visible,
                        position: grandChildObj.position.toArray()
                    });
                });

                console.groupEnd();
            });
            
            console.groupEnd();
        }
    });
    
    console.groupEnd();
}

export { inspectLabels };