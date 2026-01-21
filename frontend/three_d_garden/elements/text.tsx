import React from "react";
import { Center, Text3D } from "@react-three/drei";
import { ASSETS, RenderOrder } from "../constants";
import { MeshPhongMaterial } from "../components";
import { Mesh } from "three";

export interface TextProps {
  children: React.ReactNode;
  position: [number, number, number];
  rotation: [number, number, number];
  fontSize: number;
  color: string;
  name?: string;
  visible?: boolean;
  renderOrder?: RenderOrder;
  thickness?: number;
  disableRaycast?: boolean;
}

export const Text = React.memo((props: TextProps) => {
  const raycast =
    props.disableRaycast ? () => null : Mesh.prototype.raycast;
  return <Center
    name={props.name}
    visible={props.visible}
    renderOrder={props.renderOrder}
    position={props.position}>
    <Text3D
      font={ASSETS.fonts.cabinBold}
      size={props.fontSize}
      height={props.thickness || 0.01}
      rotation={props.rotation}
      raycast={raycast}>
      {props.children}
      <MeshPhongMaterial color={props.color} />
    </Text3D>
  </Center>;
});
