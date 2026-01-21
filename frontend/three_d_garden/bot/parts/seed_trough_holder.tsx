/* eslint-disable max-len */
import React from "react";
import * as THREE from "three";
import { GLTF } from "three-stdlib";
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

export const SeedTroughHolder = (model: SeedTroughHolderFull) =>
  React.memo((props: ThreeElements["group"]) => {
    const { nodes, materials } = model;
    const mountPosition = React.useMemo<[number, number, number]>(
      () => [-0.002, 0.023, 0], []);
    const screwPosition = React.useMemo<[number, number, number]>(
      () => [0.003, 0.013, 0.03], []);
    const screwRotation = React.useMemo<[number, number, number]>(
      () => [Math.PI / 2, Math.PI / 2, 0], []);
    // eslint-disable-next-line no-null/no-null
    return <Group {...props} dispose={null}>
      <MeshComponent
        geometry={nodes.Seed_Trough_Holder_Mount_Plate.geometry}
        material={materials[SeedTroughHolderMaterial.zero]}
        position={mountPosition} />
      <MeshComponent
        geometry={nodes.M5_x_10mm_Screw.geometry}
        material={materials[SeedTroughHolderMaterial.one]}
        position={screwPosition}
        rotation={screwRotation} />
    </Group>;
  });
