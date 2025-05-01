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
   * @param textProperty The property name in the label's __data object to use for the new text
   * @returns True if any labels were found and updated, false otherwise
   */
  function updateLabelText(scene: Scene, textProperty: string): boolean {
    let updatedCount = 0;
    
    scene.traverse((obj: Object3D) => {
      const globeObj = obj as GlobeObject;
      if (globeObj.__globeObjType !== "label") {
        return;
      }
      
      // Get the new text from the label's data
      const newText = globeObj.__data[textProperty];
      if (!newText) {
        console.warn(`Label has no text property '${textProperty}' in __data:`, globeObj.__data);
        return;
      }
      
      // Skip if this label has already been updated with this property
      if (globeObj.userData.__updatedTextProperties && 
          globeObj.userData.__updatedTextProperties[textProperty] === newText) {
        console.log(`Label already updated with '${textProperty}' = "${newText}"`);
        // return;
      }
      
      console.log(`Updating label with new text: "${newText}"`);
      
      globeObj.children.forEach((child: Object3D) => {
        const childObj = child as Mesh;
        
        if (childObj.geometry?.type !== "TextGeometry") {
          return;
        }
        
        console.log("Found text mesh to update:", childObj);
        
        // Store original position and scale
        const originalPosition = childObj.position.clone();
        const originalScale = childObj.scale.clone();
        
        // Get the current geometry parameters
        const currentGeometry = childObj.geometry as any;
        const params = currentGeometry.parameters?.options || {};
        
        if (!params.font) {
          console.warn("Cannot update text: font not found in geometry parameters");
          return;
        }
        
        // Create new geometry with the same parameters but new text
        // Important: Set height to 0 to make it flat, and disable bevel
        const newGeometry = new TextGeometry(newText, {
          font: params.font,
          size: params.size || 0.5,
          height: 0, // Force height to 0 to make it flat
          curveSegments: params.curveSegments || 3,
          bevelEnabled: false, // Disable bevel to keep it flat
          bevelThickness: 0,
          bevelSize: 0,
          bevelOffset: 0,
          bevelSegments: 0,
        });
        
        // Center the text geometry if it was centered before
        newGeometry.computeBoundingBox();
        if (Math.abs(currentGeometry.boundingBox.min.x + currentGeometry.boundingBox.max.x) < 0.001) {
          newGeometry.center();
        }
        
        // Dispose of old geometry and replace with new one
        childObj.geometry.dispose();
        childObj.geometry = newGeometry;
        
        // Restore original position and scale
        childObj.position.copy(originalPosition);
        childObj.scale.copy(originalScale);
        
        // Make sure the material is visible
        if (childObj.material) {
          const material = childObj.material as MeshLambertMaterial;
          material.visible = true;
          material.needsUpdate = true;
        }
        
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
              
              // Position the bounding box at the center of the text
              bbObj.position.set(0, 0, 0);
            }
          }
        }
        
        // Mark this label as updated with this property
        if (!globeObj.userData.__updatedTextProperties) {
          globeObj.userData.__updatedTextProperties = {};
        }
        globeObj.userData.__updatedTextProperties[textProperty] = newText;
        
        updatedCount++;
      });
    });
    
    console.log(`Updated ${updatedCount} labels with text property '${textProperty}'`);
    return updatedCount > 0;
  }
  
  export { inspectLabels, updateLabelText };
  


