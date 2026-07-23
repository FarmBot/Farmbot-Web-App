import React from "react";
import * as THREE from "three";
import { useGLTF } from "@react-three/drei";
import type { GLTF } from "three-stdlib";
import { ASSETS, LIB_DIR, PartName } from "../constants";
import { Group, Mesh } from "../components";
import { ControlPoint } from "../controls";
import { OpacityFilter } from "./components/tools";

type UTM = GLTF & {
  nodes: { [PartName.utm]: THREE.Mesh };
  materials: { PaletteMaterial001: THREE.MeshStandardMaterial };
}

export interface NativeJogGhostProps {
  children?: React.ReactNode;
  name: string;
  position: ControlPoint;
}

export const NativeJogGhost = (props: NativeJogGhostProps) => {
  const utm = useGLTF(ASSETS.models.utm, LIB_DIR) as unknown as UTM;
  return <Group
    name={`${props.name}-ghost`}
    position={props.position}>
    <OpacityFilter interactive={false} opacity={0.5}>
      <Group
        name={`${props.name}-ghost-utm`}
        rotation={[0, 0, Math.PI / 2]}>
        <Mesh
          geometry={utm.nodes.M5_Barb.geometry}
          material={utm.materials.PaletteMaterial001}
          position={[15, 9, 36]}
          scale={1000}
          rotation={[0, 0, 2.094]} />
      </Group>
      {props.children}
    </OpacityFilter>
  </Group>;
};
