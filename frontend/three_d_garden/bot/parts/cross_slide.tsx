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
import { PartName } from "../../constants";

type Mesh = THREE.Mesh & { instanceMatrix: InstancedBufferAttribute | undefined };
type CrossSlideNodes = Record<string, Mesh> & {
  Cable_Carrier_Spacer_Block: THREE.Mesh;
};

export type CrossSlideFull = GLTF & {
  nodes: CrossSlideNodes;
  materials: {
    PaletteMaterial001: THREE.MeshStandardMaterial;
  };
}

export type CrossSlideV19Full = GLTF & {
  nodes: {
    [PartName.crossSlideV19]: THREE.Mesh;
  };
  materials: {
    PaletteMaterial001: THREE.MeshStandardMaterial;
  };
}

interface CrossSlideProps extends Omit<ThreeElements["group"], "ref"> {
  model: CrossSlideFull;
}

interface CrossSlideV19Props extends Omit<ThreeElements["group"], "ref"> {
  model: CrossSlideV19Full;
}

export const CrossSlideModel = (props: CrossSlideProps) => {
  const { model, ...groupProps } = props;
  const { nodes, materials } = model;
  const mergedGeometry = mergedInstancedGeometry(model, /^mesh/);
  return <Group {...groupProps}>
    <MeshComponent
      geometry={nodes.Cable_Carrier_Spacer_Block.geometry}
      material={materials.PaletteMaterial001}
      position={[0.03, 0.005, 0.061]}
      rotation={[-Math.PI / 2, 0, Math.PI]} />
    {mergedGeometry
      ? <MeshComponent
        geometry={mergedGeometry}
        material={materials.PaletteMaterial001} />
      : fallbackInstancedMeshes(model, /^mesh/, materials.PaletteMaterial001)}
  </Group>;
};

export const CrossSlideV19Model = (props: CrossSlideV19Props) => {
  const { model, ...groupProps } = props;
  const { nodes, materials } = model;
  return <Group {...groupProps}>
    <MeshComponent
      geometry={nodes[PartName.crossSlideV19].geometry}
      material={materials.PaletteMaterial001}
      position={[0.04, -0.002, 0.038]}
      rotation={[Math.PI / 2, 0, -Math.PI / 2]} />
  </Group>;
};

export const CrossSlide = (model: CrossSlideFull) =>
  (props: Omit<ThreeElements["group"], "ref">) =>
    <CrossSlideModel {...props} model={model} />;
