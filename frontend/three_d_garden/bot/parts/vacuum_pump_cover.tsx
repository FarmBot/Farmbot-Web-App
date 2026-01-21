import React from "react";
import * as THREE from "three";
import { GLTF } from "three-stdlib";
import { Group, Mesh as MeshComponent } from "../../components";
import { VacuumPumpCoverMaterial } from "../../constants";
import { ThreeElements } from "@react-three/fiber";

export type VacuumPumpCoverFull = GLTF & {
  nodes: {
    M5_x_10mm_Screw: THREE.Mesh;
    Vacuum_Pump_Cover: THREE.Mesh;
  };
  materials: {
    [VacuumPumpCoverMaterial.zero]: THREE.MeshStandardMaterial;
    [VacuumPumpCoverMaterial.one]: THREE.MeshStandardMaterial;
  };
}

export const VacuumPumpCover = (model: VacuumPumpCoverFull) =>
  React.memo((props: ThreeElements["group"]) => {
    const { nodes, materials } = model;
    const screwPosition = React.useMemo<[number, number, number]>(
      () => [-0.01, -0.013, -0.145], []);
    const screwRotation = React.useMemo<[number, number, number]>(
      () => [Math.PI / 2, 0, 0], []);
    const coverPosition = React.useMemo<[number, number, number]>(
      () => [0.057, -0.008, -0.255], []);
    const coverRotation = React.useMemo<[number, number, number]>(
      () => [0, 0, Math.PI], []);
    // eslint-disable-next-line no-null/no-null
    return <Group {...props} dispose={null}>
      <MeshComponent geometry={nodes.M5_x_10mm_Screw.geometry}
        material={materials[VacuumPumpCoverMaterial.zero]}
        position={screwPosition}
        rotation={screwRotation} />
      <MeshComponent geometry={nodes.Vacuum_Pump_Cover.geometry}
        material={materials[VacuumPumpCoverMaterial.one]}
        position={coverPosition}
        rotation={coverRotation} />
    </Group>;
  });
