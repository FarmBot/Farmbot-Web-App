import React from "react";
import * as THREE from "three";
import type { GLTF } from "three-stdlib";
import { ThreeElements } from "@react-three/fiber";
import { Group, Mesh } from "../../components";
import {
  GantryCornerBracketMaterial, PartName,
} from "../../constants";
import {
  mergeSolidGeometries,
  solidVertexColorMaterial,
} from "../../geometry_batching";

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
  extends Omit<ThreeElements["group"], "ref" | "scale"> {
  model: LeftGantryCornerBracketFull;
}

interface RightGantryCornerBracketProps
  extends Omit<ThreeElements["group"], "ref" | "scale"> {
  model: RightGantryCornerBracketFull;
}

export const LeftGantryCornerBracketModel =
  (props: LeftGantryCornerBracketProps) => {
    const { model, ...groupProps } = props;
    return <Group {...groupProps}>
      <Mesh
        geometry={model.nodes[PartName.leftBracket].geometry}
        material={model.materials.PaletteMaterial001}
        position={[45, 5, -2]}
        scale={1000} />
    </Group>;
  };

const rightBracketGeometryCache = new WeakMap<
  RightGantryCornerBracketFull,
  THREE.BufferGeometry
>();

export const rightGantryCornerBracketGeometry = (
  model: RightGantryCornerBracketFull,
) => {
  const cached = rightBracketGeometryCache.get(model);
  if (cached) { return cached; }
  const { nodes, materials } = model;
  const geometry = mergeSolidGeometries([
    {
      geometry: nodes[PartName.gantryCornerBracketNutBar].geometry,
      color: materials[GantryCornerBracketMaterial.hardware].color,
      position: [20, 11, -70],
      rotation: [Math.PI / 2, 0, -Math.PI],
      scale: 1000,
    },
    {
      geometry: nodes[PartName.rightBracket].geometry,
      color: materials[GantryCornerBracketMaterial.bracket].color,
      position: [-30, 5, -40],
      scale: 1000,
    },
  ]);
  if (geometry) { rightBracketGeometryCache.set(model, geometry); }
  return geometry;
};

export const RightGantryCornerBracketModel =
  (props: RightGantryCornerBracketProps) => {
    const { model, ...groupProps } = props;
    const { nodes, materials } = model;
    const geometry = rightGantryCornerBracketGeometry(model);
    return <Group {...groupProps}>
      {geometry
        ? <Mesh
          geometry={geometry}
          material={solidVertexColorMaterial(
            materials[GantryCornerBracketMaterial.bracket],
          )} />
        : <>
          <Mesh
            geometry={nodes[PartName.gantryCornerBracketNutBar].geometry}
            material={materials[GantryCornerBracketMaterial.hardware]}
            position={[20, 11, -70]}
            scale={1000}
            rotation={[Math.PI / 2, 0, -Math.PI]} />
          <Mesh
            geometry={nodes[PartName.rightBracket].geometry}
            material={materials[GantryCornerBracketMaterial.bracket]}
            position={[-30, 5, -40]}
            scale={1000} />
        </>}
    </Group>;
  };
