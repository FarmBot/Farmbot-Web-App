import React from "react";
import * as THREE from "three";
import type { GLTF } from "three-stdlib";
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

type PartGroupProps = Omit<ThreeElements["group"], "ref" | "scale">;

interface VacuumPumpCoverProps extends PartGroupProps {
  model: VacuumPumpCoverFull;
}

export const VacuumPumpCoverModel = (props: VacuumPumpCoverProps) => {
  const { model, ...groupProps } = props;
  const { nodes, materials } = model;
  // eslint-disable-next-line no-null/no-null
  return <Group {...groupProps} dispose={null}>
    <MeshComponent geometry={nodes.M5_x_10mm_Screw.geometry}
      material={materials[VacuumPumpCoverMaterial.zero]}
      position={[-10, -13, -145]}
      scale={1000}
      rotation={[Math.PI / 2, 0, 0]} />
    <MeshComponent geometry={nodes.Vacuum_Pump_Cover.geometry}
      material={materials[VacuumPumpCoverMaterial.one]}
      position={[57, -8, -255]}
      scale={1000}
      rotation={[0, 0, Math.PI]} />
  </Group>;
};

export const VacuumPumpCover = (model: VacuumPumpCoverFull) =>
  (props: PartGroupProps) =>
    <VacuumPumpCoverModel {...props} model={model} />;
