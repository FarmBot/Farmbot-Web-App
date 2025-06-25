import React from "react";
import * as THREE from "three";
import { Mesh } from "./components";
import { GLTF } from "three-stdlib";

export type Model = GLTF & {
  nodes: { mesh: THREE.Mesh };
  materials: { material: THREE.MeshStandardMaterial };
}

export interface ModelMeshProps {
  name: string;
  model: Model;
}

export const ModelMesh = React.forwardRef((props: ModelMeshProps, ref) =>
  <Mesh
    name={props.name}
    ref={ref}
    scale={1000}
    geometry={props.model.nodes.mesh.geometry}
    material={props.model.materials.material} />);
