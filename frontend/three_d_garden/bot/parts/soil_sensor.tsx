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
type SoilSensorNodes = Record<string, Mesh> & {
  Soil_Sensor: Mesh;
};

export type SoilSensorFull = GLTF & {
  nodes: SoilSensorNodes;
  materials: {
    PaletteMaterial001: THREE.MeshStandardMaterial;
  };
}

type PartGroupProps = Omit<ThreeElements["group"], "ref" | "scale">;

interface SoilSensorProps extends PartGroupProps {
  model: SoilSensorFull;
}

export const SoilSensorModel = (props: SoilSensorProps) => {
  const { model, ...groupProps } = props;
  const { nodes, materials } = model;
  const mergedGeometry = mergedInstancedGeometry(model, /^mesh/);
  // eslint-disable-next-line no-null/no-null
  return <Group {...groupProps} dispose={null}>
    <MeshComponent
      geometry={nodes.Soil_Sensor.geometry}
      material={materials.PaletteMaterial001}
      position={[0, 0, -15]}
      scale={1000} />
    {mergedGeometry
      ? <MeshComponent
        geometry={mergedGeometry}
        material={materials.PaletteMaterial001} />
      : fallbackInstancedMeshes(model, /^mesh/, materials.PaletteMaterial001)}
  </Group>;
};

export const SoilSensor = (model: SoilSensorFull) =>
  (props: PartGroupProps) =>
    <SoilSensorModel {...props} model={model} />;
