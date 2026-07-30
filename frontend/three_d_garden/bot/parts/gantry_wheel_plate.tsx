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

interface GantryWheelPlateProps
  extends Omit<ThreeElements["group"], "ref" | "scale"> {
  mirrorY?: boolean;
}

export const GantryWheelPlate = (
  model: GantryWheelPlateFull,
  isV19 = false,
) =>
  (props: GantryWheelPlateProps) => {
    const { mirrorY, ...groupProps } = props;
    const { nodes, materials } = model;
    const mergedGeometry = mergedInstancedGeometry(model, /^mesh/);
    return <Group {...groupProps} scale={[1, mirrorY ? -1 : 1, 1]}>
      <MeshComponent
        geometry={nodes.Gantry_Wheel_Plate.geometry}
        material={materials.PaletteMaterial001}
        position={[2, 50, isV19 ? 162 : 0]}
        scale={1000}
        rotation={[Math.PI / 2, -Math.PI / 2, 0]} />
      {mergedGeometry
        ? <MeshComponent
          geometry={mergedGeometry}
          material={materials.PaletteMaterial001} />
        : fallbackInstancedMeshes(model, /^mesh/, materials.PaletteMaterial001)}
    </Group>;
  };
