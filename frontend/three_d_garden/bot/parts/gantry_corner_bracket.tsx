import React from "react";
import * as THREE from "three";
import type { GLTF } from "three-stdlib";
import { ThreeElements } from "@react-three/fiber";
import { Group, Mesh } from "../../components";
import {
  GantryCornerBracketMaterial, PartName,
} from "../../constants";

export type RightGantryCornerBracketFull = GLTF & {
  nodes: {
    [PartName.gantryCornerBracketNutBar]: THREE.Mesh;
    [PartName.rightBracket]: THREE.Mesh;
  };
  materials: {
    [GantryCornerBracketMaterial.hardware]: THREE.MeshStandardMaterial;
    [GantryCornerBracketMaterial.bracket]: THREE.MeshStandardMaterial;
  };
}

export type LeftGantryCornerBracketFull = GLTF & {
  nodes: {
    [PartName.leftBracket]: THREE.Mesh;
  };
  materials: {
    PaletteMaterial001: THREE.MeshStandardMaterial;
  };
}

interface LeftGantryCornerBracketProps
  extends Omit<ThreeElements["group"], "ref"> {
  model: LeftGantryCornerBracketFull;
}

interface RightGantryCornerBracketProps
  extends Omit<ThreeElements["group"], "ref"> {
  model: RightGantryCornerBracketFull;
}

export const LeftGantryCornerBracketModel =
  (props: LeftGantryCornerBracketProps) => {
    const { model, ...groupProps } = props;
    return <Group {...groupProps}>
      <Mesh
        geometry={model.nodes[PartName.leftBracket].geometry}
        material={model.materials.PaletteMaterial001}
        position={[0.045, 0.005, -0.002]} />
    </Group>;
  };

export const RightGantryCornerBracketModel =
  (props: RightGantryCornerBracketProps) => {
    const { model, ...groupProps } = props;
    const { nodes, materials } = model;
    return <Group {...groupProps}>
      <Mesh
        geometry={nodes[PartName.gantryCornerBracketNutBar].geometry}
        material={materials[GantryCornerBracketMaterial.hardware]}
        position={[0.02, 0.011, -0.07]}
        rotation={[Math.PI / 2, 0, -Math.PI]} />
      <Mesh
        geometry={nodes[PartName.rightBracket].geometry}
        material={materials[GantryCornerBracketMaterial.bracket]}
        position={[-0.03, 0.005, -0.04]} />
    </Group>;
  };
