import React from "react";
import * as THREE from "three";
import { useGLTF } from "@react-three/drei";
import type { GLTF } from "three-stdlib";
import { ASSETS, LIB_DIR, PartName } from "../constants";
import { Group, Mesh, MeshBasicMaterial } from "../components";
import { ControlPoint, noControlRaycast } from "../controls";
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

interface NativeJogUtmProps {
  name: string;
}

const NativeJogUtm = React.memo((props: NativeJogUtmProps) => {
  const utm = useGLTF(ASSETS.models.utm, LIB_DIR) as unknown as UTM;
  return <Group
    name={props.name}
    rotation={[0, 0, Math.PI / 2]}>
    <Mesh
      geometry={utm.nodes.M5_Barb.geometry}
      material={utm.materials.PaletteMaterial001}
      position={[15, 9, 36]}
      scale={1000}
      rotation={[0, 0, 2.094]} />
  </Group>;
});

export const NativeJogGhost = (props: NativeJogGhostProps) =>
  <Group name={`${props.name}-ghost`} position={props.position}>
    <OpacityFilter interactive={false} opacity={0.5}>
      <NativeJogUtm name={`${props.name}-ghost-utm`} />
      {props.children}
    </OpacityFilter>
  </Group>;

export interface NativeJogUtmShadowProps {
  name: string;
  position: ControlPoint;
}

export const NATIVE_JOG_UTM_SHADOW_RADIUS = 35;

export const NativeJogUtmShadow = (props: NativeJogUtmShadowProps) =>
  <Mesh
    name={`${props.name}-shadow`}
    position={props.position}
    raycast={noControlRaycast}>
    <circleGeometry args={[NATIVE_JOG_UTM_SHADOW_RADIUS, 64]} />
    <MeshBasicMaterial
      color={"white"}
      transparent={true}
      opacity={0.5}
      depthWrite={false}
      side={THREE.DoubleSide} />
  </Mesh>;
