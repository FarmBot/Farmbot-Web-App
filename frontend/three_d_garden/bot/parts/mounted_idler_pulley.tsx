import React from "react";
import * as THREE from "three";
import type { GLTF } from "three-stdlib";
import { Group, Mesh as MeshComponent } from "../../components";
import { MountedIdlerPulleyMaterial, PartName } from "../../constants";
import { ThreeElements } from "@react-three/fiber";

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

export const MountedIdlerPulleyModel = (props: MountedIdlerPulleyProps) => {
  const { lower, model, ...groupProps } = props;
  const { nodes, materials } = model;
  const lowerPosition: [number, number, number] | undefined =
    lower ? [0, 0, -15] : undefined;
  return <Group {...groupProps}>
    <Group
      position={lowerPosition}
      rotation={lower ? [0, Math.PI, 0] : undefined}>
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
    </Group>
  </Group>;
};
