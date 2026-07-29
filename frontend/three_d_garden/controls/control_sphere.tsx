import React from "react";
import { Sphere } from "@react-three/drei";
import { Group, MeshPhongMaterial } from "../components";
import { controlRaycast } from "./events";
import { ControlPulse, ControlPulseProps } from "./control_pulse";
import {
  ControlColorType, ControlRenderOptions, CONTROL_HOVER_SCALE,
  resolveControlColors, resolveControlRenderOptions,
} from "./theme";
import { ControlPoint } from "./types";

export interface ControlSphereProps extends ControlRenderOptions {
  name: string;
  position?: ControlPoint;
  radius: number;
  segments?: number;
  color?: string;
  colorType?: ControlColorType;
  hoverColor?: string;
  activeColor?: string;
  activeHoverColor?: string;
  disabledColor?: string;
  hovered?: boolean;
  active?: boolean;
  enabled?: boolean;
  hoverScale?: number;
  opacity?: number;
  transparent?: boolean;
  material?: React.ReactNode;
  pulse?: Omit<ControlPulseProps, "radius" | "color">;
  children?: React.ReactNode;
}

// eslint-disable-next-line complexity
export const ControlSphere = (props: ControlSphereProps) => {
  const enabled = props.enabled !== false;
  const hovered = enabled && !!props.hovered;
  const colors = resolveControlColors(
    props.colorType, props.color, props.hoverColor);
  let color = enabled
    ? colors.color
    : props.disabledColor || colors.color;
  if (props.active) {
    color = hovered
      ? props.activeHoverColor || props.activeColor || color
      : props.activeColor || color;
  } else if (hovered) {
    color = colors.hoverColor;
  }
  const scale = hovered
    ? props.hoverScale || CONTROL_HOVER_SCALE
    : 1;
  const renderOptions = resolveControlRenderOptions(props);
  const materialProps = {
    color,
    transparent: props.transparent
      ?? (props.opacity !== undefined && props.opacity < 1),
    opacity: props.opacity,
    depthTest: renderOptions.depthTest,
    depthWrite: renderOptions.depthWrite,
  };
  const material = props.material || <MeshPhongMaterial {...materialProps} />;
  return <Group
    name={`${props.name}-visual`}
    position={props.position}>
    <Sphere
      name={props.name}
      args={[
        props.radius * scale,
        props.segments || 16,
        props.segments || 16,
      ]}
      raycast={controlRaycast(enabled)}
      renderOrder={renderOptions.renderOrder}>
      {material}
    </Sphere>
    {props.pulse &&
      <ControlPulse
        {...props.pulse}
        radius={props.radius}
        color={color}
        renderOnTop={props.pulse.renderOnTop ?? props.renderOnTop}
        depthTest={props.pulse.depthTest ?? renderOptions.depthTest}
        depthWrite={props.pulse.depthWrite ?? renderOptions.depthWrite}
        renderOrder={props.pulse.renderOrder ?? renderOptions.renderOrder} />}
    {props.children}
  </Group>;
};
