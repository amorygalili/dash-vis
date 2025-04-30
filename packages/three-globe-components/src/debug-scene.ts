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

// Label specific inspector
function inspectLabels(scene: Scene): void {
    console.group('Labels Inspection');
    
    scene.traverse((obj: Object3D) => {
        const globeObj = obj as GlobeObject;
        if (globeObj.__globeObjType === 'label') {
            console.log('Found label:', {
                type: globeObj.type,
                children: globeObj.children.length,
                position: globeObj.position.toArray(),
                material: globeObj.material?.type,
                visible: globeObj.visible
            });
            
            globeObj.children.forEach((child: Object3D, i: number) => {
                const childObj = child as GlobeObject;
                console.log(`Child ${i}:`, {
                    type: childObj.type,
                    geometry: childObj.geometry?.type || 'none',
                    material: childObj.material?.type || 'none',
                    visible: childObj.visible
                });
            });
        }
    });
    
    console.groupEnd();
}

export { inspectScene, inspectLabels };