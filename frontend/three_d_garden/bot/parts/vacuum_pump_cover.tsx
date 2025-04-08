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
  (props: ThreeElements["group"]) => {
    const { nodes, materials } = model;
    // eslint-disable-next-line no-null/no-null
    return <Group {...props} dispose={null}>
      <MeshComponent geometry={nodes.M5_x_10mm_Screw.geometry}
        material={materials[VacuumPumpCoverMaterial.zero]}
        position={[-0.01, -0.013, -0.145]}
        rotation={[Math.PI / 2, 0, 0]} />
      <MeshComponent geometry={nodes.Vacuum_Pump_Cover.geometry}
        material={materials[VacuumPumpCoverMaterial.one]}
        position={[0.057, -0.008, -0.255]}
        rotation={[0, 0, Math.PI]} />
    </Group>;
  };
