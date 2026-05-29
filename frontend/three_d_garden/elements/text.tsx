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
  thickness?: number;
}

const sameVector = (
  prev: [number, number, number],
  next: [number, number, number],
) =>
  prev[0] === next[0] &&
  prev[1] === next[1] &&
  prev[2] === next[2];

export const textPropsEqual = (prev: TextProps, next: TextProps) =>
  prev.children === next.children &&
  prev.fontSize === next.fontSize &&
  prev.color === next.color &&
  prev.name === next.name &&
  prev.visible === next.visible &&
  prev.renderOrder === next.renderOrder &&
  prev.thickness === next.thickness &&
  sameVector(prev.position, next.position) &&
  sameVector(prev.rotation, next.rotation);

const TextBase = (props: TextProps) => {
  return <Center
    name={props.name}
    visible={props.visible}
    renderOrder={props.renderOrder}
    position={props.position}>
    <Text3D
      font={ASSETS.fonts.cabinBold}
      size={props.fontSize}
      height={props.thickness || 0.01}
      rotation={props.rotation}>
      {props.children}
      <MeshPhongMaterial color={props.color} />
    </Text3D>
  </Center>;
};

export const Text = React.memo(TextBase, textPropsEqual);
