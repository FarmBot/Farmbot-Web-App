import React from "react";
import * as THREE from "three";
import type { GLTF } from "three-stdlib";
import { Group, Mesh as MeshComponent } from "../../components";
import { MountedIdlerPulleyMaterial, PartName } from "../../constants";
import { ThreeElements } from "@react-three/fiber";
import {
  mergeSolidGeometries,
  solidVertexColorMaterial,
} from "../../geometry_batching";

export type MountedIdlerPulleyFull = GLTF & {
  nodes: {
    [PartName.mountedIdlerPulleyMount]: THREE.Mesh;
    [PartName.mountedIdlerPulleyLocknut]: THREE.Mesh;
    [PartName.mountedIdlerPulleyShim]: THREE.Mesh;
    [PartName.mountedIdlerPulleyBearing]: THREE.Mesh;
  };
  materials: {
    [MountedIdlerPulleyMaterial.mount]: THREE.MeshStandardMaterial;
    [MountedIdlerPulleyMaterial.locknut]: THREE.MeshStandardMaterial;
    [MountedIdlerPulleyMaterial.shim]: THREE.MeshStandardMaterial;
    [MountedIdlerPulleyMaterial.bearing]: THREE.MeshStandardMaterial;
  };
}

interface MountedIdlerPulleyProps
  extends Omit<ThreeElements["group"], "ref" | "scale"> {
  model: MountedIdlerPulleyFull;
  lower?: boolean;
}

const geometryCache = new WeakMap<
  MountedIdlerPulleyFull,
  THREE.BufferGeometry
>();

export const mountedIdlerPulleyGeometry = (
  model: MountedIdlerPulleyFull,
) => {
  const cached = geometryCache.get(model);
  if (cached) { return cached; }
  const { nodes, materials } = model;
  const geometry = mergeSolidGeometries([
    {
      geometry: nodes[PartName.mountedIdlerPulleyMount].geometry,
      color: materials[MountedIdlerPulleyMaterial.mount].color,
      position: [0, 5, -10],
      scale: 1000,
    },
    {
      geometry: nodes[PartName.mountedIdlerPulleyLocknut].geometry,
      color: materials[MountedIdlerPulleyMaterial.locknut].color,
      position: [0, -19, 30],
      rotation: [Math.PI / 2, 0, 0],
      scale: 1000,
    },
    {
      geometry: nodes[PartName.mountedIdlerPulleyShim].geometry,
      color: materials[MountedIdlerPulleyMaterial.shim].color,
      position: [0, -14, 30],
      rotation: [Math.PI / 2, -Math.PI / 2, 0],
      scale: 1000,
    },
    {
      geometry: nodes[PartName.mountedIdlerPulleyBearing].geometry,
      color: materials[MountedIdlerPulleyMaterial.bearing].color,
      position: [0, -16, 30],
      rotation: [-Math.PI / 2, 0, 0],
      scale: 1000,
    },
  ]);
  if (geometry) { geometryCache.set(model, geometry); }
  return geometry;
};

const MountedIdlerPulleyParts = (props: {
  model: MountedIdlerPulleyFull;
}) => {
  const { nodes, materials } = props.model;
  const geometry = mountedIdlerPulleyGeometry(props.model);
  if (geometry) {
    return <MeshComponent
      geometry={geometry}
      material={solidVertexColorMaterial(
        materials[MountedIdlerPulleyMaterial.mount],
      )} />;
  }
  return <>
    <MeshComponent
      geometry={nodes[PartName.mountedIdlerPulleyMount].geometry}
      material={materials[MountedIdlerPulleyMaterial.mount]}
      position={[0, 5, -10]}
      scale={1000} />
    <MeshComponent
      geometry={nodes[PartName.mountedIdlerPulleyLocknut].geometry}
      material={materials[MountedIdlerPulleyMaterial.locknut]}
      position={[0, -19, 30]}
      scale={1000}
      rotation={[Math.PI / 2, 0, 0]} />
    <MeshComponent
      geometry={nodes[PartName.mountedIdlerPulleyShim].geometry}
      material={materials[MountedIdlerPulleyMaterial.shim]}
      position={[0, -14, 30]}
      scale={1000}
      rotation={[Math.PI / 2, -Math.PI / 2, 0]} />
    <MeshComponent
      geometry={nodes[PartName.mountedIdlerPulleyBearing].geometry}
      material={materials[MountedIdlerPulleyMaterial.bearing]}
      position={[0, -16, 30]}
      scale={1000}
      rotation={[-Math.PI / 2, 0, 0]} />
  </>;
};

export const MountedIdlerPulleyModel = (props: MountedIdlerPulleyProps) => {
  const { lower, model, ...groupProps } = props;
  const lowerPosition: [number, number, number] | undefined =
    lower ? [0, 0, -15] : undefined;
  return <Group {...groupProps}>
    <Group
      position={lowerPosition}
      rotation={lower ? [0, Math.PI, 0] : undefined}>
      <MountedIdlerPulleyParts model={model} />
    </Group>
  </Group>;
};
