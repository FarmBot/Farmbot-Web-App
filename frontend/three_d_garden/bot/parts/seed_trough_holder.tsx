/* eslint-disable max-len */
import React from "react";
import * as THREE from "three";
import type { GLTF } from "three-stdlib";
import { Group, Mesh as MeshComponent } from "../../components";
import { SeedTroughHolderMaterial } from "../../constants";
import { ThreeElements } from "@react-three/fiber";

export type SeedTroughHolderFull = GLTF & {
  nodes: {
    Seed_Trough_Holder_Mount_Plate: THREE.Mesh;
    M5_x_10mm_Screw: THREE.Mesh;
  }
  materials: {
    [SeedTroughHolderMaterial.zero]: THREE.MeshStandardMaterial;
    [SeedTroughHolderMaterial.one]: THREE.MeshStandardMaterial;
  };
}

type PartGroupProps = Omit<ThreeElements["group"], "ref" | "scale">;

interface SeedTroughHolderProps extends PartGroupProps {
  model: SeedTroughHolderFull;
}

export const SeedTroughHolderModel = (props: SeedTroughHolderProps) => {
  const { model, ...groupProps } = props;
  const { nodes, materials } = model;
  // eslint-disable-next-line no-null/no-null
  return <Group {...groupProps} dispose={null}>
    <MeshComponent
      geometry={nodes.Seed_Trough_Holder_Mount_Plate.geometry}
      material={materials[SeedTroughHolderMaterial.zero]}
      position={[-2, 44, 0]}
      scale={1000} />
    <MeshComponent
      geometry={nodes.M5_x_10mm_Screw.geometry}
      material={materials[SeedTroughHolderMaterial.one]}
      position={[3, 34, 30]}
      scale={1000}
      rotation={[Math.PI / 2, Math.PI / 2, 0]} />
  </Group>;
};

export const SeedTroughHolder = (model: SeedTroughHolderFull) =>
  (props: PartGroupProps) =>
    <SeedTroughHolderModel {...props} model={model} />;
