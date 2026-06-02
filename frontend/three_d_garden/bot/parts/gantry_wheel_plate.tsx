/* eslint-disable max-len */
import React from "react";
import * as THREE from "three";
import { InstancedBufferAttribute } from "three";
import type { GLTF } from "three-stdlib";
import { Group, Mesh as MeshComponent } from "../../components";
import { ThreeElements } from "@react-three/fiber";
import {
  fallbackInstancedMeshes,
  mergedInstancedGeometry,
} from "./merged_instanced_geometry";

type Mesh = THREE.Mesh & { instanceMatrix: InstancedBufferAttribute | undefined };
type GantryWheelPlateNodes = Record<string, Mesh> & {
  Gantry_Wheel_Plate: Mesh;
};

export type GantryWheelPlateFull = GLTF & {
  nodes: GantryWheelPlateNodes;
  materials: {
    PaletteMaterial001: THREE.MeshStandardMaterial;
  };
}

export const GantryWheelPlate = (model: GantryWheelPlateFull) =>
  (props: Omit<ThreeElements["group"], "ref">) => {
    const { nodes, materials } = model;
    const mergedGeometry = mergedInstancedGeometry(model, /^mesh/);
    return <Group {...props}>
      <MeshComponent
        geometry={nodes.Gantry_Wheel_Plate.geometry}
        material={materials.PaletteMaterial001}
        position={[0.002, 0.05, 0]}
        rotation={[Math.PI / 2, -Math.PI / 2, 0]} />
      {mergedGeometry
        ? <MeshComponent
          geometry={mergedGeometry}
          material={materials.PaletteMaterial001} />
        : fallbackInstancedMeshes(model, /^mesh/, materials.PaletteMaterial001)}
    </Group>;
  };
