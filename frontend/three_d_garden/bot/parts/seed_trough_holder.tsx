/* eslint-disable max-len */
import React from "react";
import * as THREE from "three";
import type { GLTF } from "three-stdlib";
import { Group, Mesh as MeshComponent } from "../../components";
import { SeedTroughHolderMaterial } from "../../constants";
import { ThreeElements } from "@react-three/fiber";
import {
  frontSideMaterial,
  mergeSolidGeometries,
  solidVertexColorMaterial,
} from "../../geometry_batching";

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

const geometryCache = new WeakMap<
  SeedTroughHolderFull,
  THREE.BufferGeometry
>();

const seedTroughHolderGeometry = (model: SeedTroughHolderFull) => {
  const cached = geometryCache.get(model);
  if (cached) { return cached; }
  const { nodes, materials } = model;
  const geometry = mergeSolidGeometries([
    {
      geometry: nodes.Seed_Trough_Holder_Mount_Plate.geometry,
      color: materials[SeedTroughHolderMaterial.zero].color,
      position: [-2, 44, 0],
      scale: 1000,
    },
    {
      geometry: nodes.M5_x_10mm_Screw.geometry,
      color: materials[SeedTroughHolderMaterial.one].color,
      position: [3, 34, 30],
      rotation: [Math.PI / 2, Math.PI / 2, 0],
      scale: 1000,
    },
  ]);
  if (geometry) { geometryCache.set(model, geometry); }
  return geometry;
};

export const SeedTroughHolderModel = (props: SeedTroughHolderProps) => {
  const { model, ...groupProps } = props;
  const { nodes, materials } = model;
  const geometry = seedTroughHolderGeometry(model);
  // eslint-disable-next-line no-null/no-null
  return <Group {...groupProps} dispose={null}>
    {geometry
      ? <MeshComponent
        geometry={geometry}
        material={frontSideMaterial(solidVertexColorMaterial(
          materials[SeedTroughHolderMaterial.zero],
        ))} />
      : <>
        <MeshComponent
          geometry={nodes.Seed_Trough_Holder_Mount_Plate.geometry}
          material={frontSideMaterial(
            materials[SeedTroughHolderMaterial.zero],
          )}
          position={[-2, 44, 0]}
          scale={1000} />
        <MeshComponent
          geometry={nodes.M5_x_10mm_Screw.geometry}
          material={frontSideMaterial(
            materials[SeedTroughHolderMaterial.one],
          )}
          position={[3, 34, 30]}
          scale={1000}
          rotation={[Math.PI / 2, Math.PI / 2, 0]} />
      </>}
  </Group>;
};

export const SeedTroughHolder = (model: SeedTroughHolderFull) =>
  (props: PartGroupProps) =>
    <SeedTroughHolderModel {...props} model={model} />;
