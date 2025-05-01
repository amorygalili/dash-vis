import {
  Scene,
  Object3D,
  Material,
  BufferGeometry,
  Mesh,
  MeshLambertMaterial,
  BoxGeometry,
} from "three";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry.js";

interface GlobeObject extends Object3D {
  __globeObjType?: string;
  __data?: any;
  material?: Material | Material[];
  geometry?: BufferGeometry | TextGeometry;
}

function inspectLabels(scene: Scene): void {
  console.group("Labels Inspection");

  scene.traverse((obj: Object3D) => {
    const globeObj = obj as GlobeObject;
    if (globeObj.__globeObjType === "label") {
      // Log the entire label object
      console.log("Full Label Object:", globeObj);

      console.group("Label Object:", {
        type: globeObj.type,
        position: globeObj.position.toArray(),
        visible: globeObj.visible,
        userData: globeObj.userData,
        data: globeObj.__data,
      });

      // Inspect direct children
      globeObj.children.forEach((child: Object3D, i: number) => {
        // Log the entire child object
        console.log(`Full Child ${i} Object:`, child);

        const childObj = child as GlobeObject;
        const mesh = childObj as Mesh;

        console.group(`Child ${i}:`, {
          type: childObj.type,
          geometryType: childObj.geometry?.type || "none",
          material: childObj.material,
          visible: childObj.visible,
          position: childObj.position.toArray(),
          scale: childObj.scale.toArray(),
        });

        // Additional details for text geometry
        if (childObj.geometry?.type === "TextGeometry") {
          // Log the entire geometry object
          console.log("Full Geometry Object:", childObj.geometry);
          console.log("Raw Parameters:", (childObj.geometry as any).parameters);

          console.log("Text Geometry Details:", {
            boundingBox: childObj.geometry.boundingBox,
            parameters: (childObj.geometry as any).parameters,
          });
        }

        // Material details
        if (mesh.material) {
          // Log the entire material object
          console.log("Full Material Object:", mesh.material);

          const material = mesh.material as MeshLambertMaterial;
          console.log("Material Details:", {
            color: material.color?.getHexString(),
            opacity: material.opacity,
            transparent: material.transparent,
            visible: material.visible,
          });
        }

        // Inspect grandchildren (for the text mesh's bounding box)
        childObj.children.forEach((grandChild: Object3D, j: number) => {
          // Log the entire grandchild object
          console.log(`Full Grandchild ${j} Object:`, grandChild);

          const grandChildObj = grandChild as GlobeObject;
          console.log(`Grandchild ${j}:`, {
            type: grandChildObj.type,
            geometry: grandChildObj.geometry?.type || "none",
            material: grandChildObj.material,
            visible: grandChildObj.visible,
            position: grandChildObj.position.toArray(),
          });
        });

        console.groupEnd();
      });

      console.groupEnd();
    }
  });

  console.groupEnd();
}

/**
 * Updates the text of a label in the scene
 * @param scene The Three.js scene containing the labels
 * @param labelIndex The index of the label to update (0-based)
 * @param newText The new text to display
 * @param font The font to use (if not provided, will try to reuse existing font)
 * @returns True if the label was found and updated, false otherwise
 */
function updateLabelText(scene: Scene, textProperty: string) {
  scene.traverse((obj: Object3D) => {
    const globeObj = obj as GlobeObject;
    if (globeObj.__globeObjType !== "label") {
      return;
    }

    const newText = globeObj.__data[textProperty];

    globeObj.children.forEach((child: Object3D) => {
      const childObj = child as Mesh;

      if (childObj.geometry?.type !== "TextGeometry") {
        return;
      }

      // Get the current geometry parameters
      const currentGeometry = childObj.geometry as any;
      const params = currentGeometry.parameters?.options || {};

      if (!params.font) {
        return;
      }

      // Create new geometry with the same parameters but new text
      const newGeometry = new TextGeometry(newText, {
        font: params.font,
        size: params.size || 0.5,
        // height: params.height || 0,
        curveSegments: params.curveSegments || 3,
        bevelEnabled: params.bevelEnabled || false,
        bevelThickness: params.bevelThickness || 0,
        bevelSize: params.bevelSize || 0,
        bevelOffset: params.bevelOffset || 0,
        bevelSegments: params.bevelSegments || 0,
      });

      // Dispose of old geometry and replace with new one
      childObj.geometry.dispose();
      childObj.geometry = newGeometry;

      // Update the bounding box if it exists
      if (childObj.children.length > 0) {
        const bbObj = childObj.children[0] as Mesh;
        if (bbObj && bbObj.geometry) {
          bbObj.geometry.dispose();
          newGeometry.computeBoundingBox();
          if (newGeometry.boundingBox) {
            bbObj.geometry = new BoxGeometry(
              newGeometry.boundingBox.max.x - newGeometry.boundingBox.min.x,
              newGeometry.boundingBox.max.y - newGeometry.boundingBox.min.y,
              newGeometry.boundingBox.max.z - newGeometry.boundingBox.min.z
            );
          }
        }
      }
    });
  });
}

export { inspectLabels, updateLabelText };
