/* eslint-disable max-len */
import React from "react";
import * as THREE from "three";
import type { GLTF } from "three-stdlib";
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

type PartGroupProps = Omit<ThreeElements["group"], "ref" | "scale">;

interface SeedTroughAssemblyProps extends PartGroupProps {
  model: SeedTroughAssemblyFull;
}

export const SeedTroughAssemblyModel = (props: SeedTroughAssemblyProps) => {
  const { model, ...groupProps } = props;
  const { nodes, materials } = model;
  // eslint-disable-next-line no-null/no-null
  return <Group {...groupProps} dispose={null}>
    <Group position={[-3, -20, 27]}>
      <MeshComponent
        geometry={nodes.mesh0_mesh.geometry}
        material={materials[SeedTroughAssemblyMaterial.one]}
        scale={1000} />
      <MeshComponent
        geometry={nodes.mesh0_mesh_1.geometry}
        material={materials[SeedTroughAssemblyMaterial.one]}
        scale={1000} />
    </Group>
    <MeshComponent
      geometry={nodes.Seed_Trough.geometry}
      material={materials[SeedTroughAssemblyMaterial.two]}
      position={[11, 0, 0]}
      scale={1000} />
  </Group>;
};

export const SeedTroughAssembly = (model: SeedTroughAssemblyFull) =>
  (props: PartGroupProps) =>
    <SeedTroughAssemblyModel {...props} model={model} />;
