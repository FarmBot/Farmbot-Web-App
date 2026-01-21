/* eslint-disable max-len */
import React from "react";
import * as THREE from "three";
import { GLTF } from "three-stdlib";
import { Group, Mesh as MeshComponent } from "../../components";
import { SeedTroughAssemblyMaterial } from "../../constants";
import { ThreeElements } from "@react-three/fiber";

export type SeedTroughAssemblyFull = GLTF & {
  nodes: {
    mesh0_mesh: THREE.Mesh;
    mesh0_mesh_1: THREE.Mesh;
    Seed_Trough: THREE.Mesh;
  };
  materials: {
    [SeedTroughAssemblyMaterial.zero]: THREE.MeshStandardMaterial;
    [SeedTroughAssemblyMaterial.one]: THREE.MeshStandardMaterial;
    [SeedTroughAssemblyMaterial.two]: THREE.MeshStandardMaterial;
  };
}

export const SeedTroughAssembly = (model: SeedTroughAssemblyFull) =>
  React.memo((props: ThreeElements["group"]) => {
    const { nodes, materials } = model;
    const basePosition = React.useMemo<[number, number, number]>(
      () => [-0.003, -0.02, 0.027], []);
    const troughPosition = React.useMemo<[number, number, number]>(
      () => [0.011, 0, 0], []);
    // eslint-disable-next-line no-null/no-null
    return <Group {...props} dispose={null}>
      <Group position={basePosition}>
        <MeshComponent
          geometry={nodes.mesh0_mesh.geometry}
          material={materials[SeedTroughAssemblyMaterial.one]} />
        <MeshComponent
          geometry={nodes.mesh0_mesh_1.geometry}
          material={materials[SeedTroughAssemblyMaterial.one]} />
      </Group>
      <MeshComponent
        geometry={nodes.Seed_Trough.geometry}
        material={materials[SeedTroughAssemblyMaterial.two]}
        position={troughPosition} />
    </Group>;
  });
