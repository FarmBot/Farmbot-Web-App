import React from "react";
import { Center, Text3D } from "@react-three/drei";
import { ASSETS, RenderOrder } from "../constants";
import { MeshPhongMaterial } from "../components";

export interface TextProps {
  children: React.ReactNode;
  position: [number, number, number];
  rotation: [number, number, number];
  fontSize: number;
  color: string;
  name?: string;
  visible?: boolean;
  renderOrder?: RenderOrder;
}

export const Text = (props: TextProps) => {
  return <Center
    name={props.name}
    visible={props.visible}
    renderOrder={props.renderOrder}
    position={props.position}>
    <Text3D
      font={ASSETS.fonts.cabinBold}
      size={props.fontSize}
      height={0.01}
      rotation={props.rotation}>
      {props.children}
      <MeshPhongMaterial color={props.color} />
    </Text3D>
  </Center>;
};
