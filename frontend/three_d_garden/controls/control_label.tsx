import React from "react";
import { Billboard } from "@react-three/drei";
import { Text } from "../elements/text";
import {
  ControlRenderOptions, resolveControlRenderOptions,
} from "./theme";
import { noControlRaycast } from "./events";
import { ControlPoint } from "./types";

export interface ControlLabelProps extends ControlRenderOptions {
  name?: string;
  children: React.ReactNode;
  position?: ControlPoint;
  fontSize?: number;
  color?: string;
  opacity?: number;
  transparent?: boolean;
  visible?: boolean;
  billboard?: boolean;
  enabled?: boolean;
}

const LabelText = (props: ControlLabelProps) => {
  const renderOptions = resolveControlRenderOptions(props);
  return <Text
    name={props.name}
    fontSize={props.fontSize || 28}
    color={props.color || "white"}
    opacity={props.opacity}
    transparent={props.transparent}
    depthTest={renderOptions.depthTest}
    depthWrite={renderOptions.depthWrite}
    renderOrder={renderOptions.renderOrder}
    raycast={props.enabled === false ? noControlRaycast : undefined}
    rotation={[0, 0, 0]}
    position={[0, 0, 0]}>
    {props.children}
  </Text>;
};

export const ControlLabel = (props: ControlLabelProps) => {
  if (props.visible === false) { return <></>; }
  const position = props.position || [0, 0, 0];
  return props.billboard === false
    ? <group position={position}><LabelText {...props} /></group>
    : <Billboard follow={true} position={position}>
      <LabelText {...props} />
    </Billboard>;
};
