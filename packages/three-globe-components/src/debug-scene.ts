import { Scene, Object3D, Material, BufferGeometry } from 'three';

interface GlobeObject extends Object3D {
    __globeObjType?: string;
    material?: Material;
    geometry?: BufferGeometry;
}

function inspectScene(scene: Scene): void {
    console.group('Scene Inspection');
    
    function traverse(obj: GlobeObject, level: number = 0): void {
        const indent: string = '  '.repeat(level);
        const type: string = obj.type;
        const name: string = obj.name || 'unnamed';
        const globeType: string = obj.__globeObjType || '';
        
        console.log(`${indent}└─ ${type} (${name}) ${globeType}`);
        
        if (obj.material) {
            console.log(`${indent}   Material: ${obj.material.type}`);
        }
        
        if (obj.geometry) {
            console.log(`${indent}   Geometry: ${obj.geometry.type}`);
        }
        
        if (obj.children && obj.children.length > 0) {
            obj.children.forEach((child: Object3D) => 
                traverse(child as GlobeObject, level + 1)
            );
        }
    }
    
    traverse(scene as GlobeObject);
    console.groupEnd();
}
function inspectLabels(scene: Scene): void {
    console.group('Labels Inspection');
    
    scene.traverse((obj: Object3D) => {
        const globeObj = obj as GlobeObject;
        if (globeObj.__globeObjType === 'label') {
            console.group('Label Object:', {
                type: globeObj.type,
                position: globeObj.position.toArray(),
                visible: globeObj.visible
            });
            
            // Inspect direct children
            globeObj.children.forEach((child: Object3D, i: number) => {
                const childObj = child as GlobeObject;
                console.group(`Child ${i}:`, {
                    type: childObj.type,
                    geometry: childObj.geometry?.type || 'none',
                    material: childObj.material?.type || 'none',
                    visible: childObj.visible
                });

                // Inspect grandchildren (for the text mesh's bounding box)
                childObj.children.forEach((grandChild: Object3D, j: number) => {
                    const grandChildObj = grandChild as GlobeObject;
                    console.log(`Grandchild ${j}:`, {
                        type: grandChildObj.type,
                        geometry: grandChildObj.geometry?.type || 'none',
                        material: grandChildObj.material?.type || 'none',
                        visible: grandChildObj.visible
                    });
                });

                console.groupEnd();
            });
            
            console.groupEnd();
        }
    });
    
    console.groupEnd();
}

export { inspectScene, inspectLabels };