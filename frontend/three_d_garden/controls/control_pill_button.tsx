import React from "react";
import { Extrude } from "@react-three/drei";
import { animated, useSpring } from "@react-spring/three";
import { ExtrudeGeometryOptions, Shape } from "three";
import { Group, MeshPhongMaterial } from "../components";
import { ControlHandle } from "./control_handle";
import { ControlLabel } from "./control_label";
import { noControlRaycast } from "./events";
import { CONTROL_COLORS } from "./theme";
import { ControlPoint } from "./types";

const AnimatedGroup = animated(Group);

export interface ControlPillButtonProps {
  name: string;
  position: ControlPoint;
  rotation?: [number, number, number];
  label?: React.ReactNode;
  icon?: React.ReactNode;
  length: number;
  width: number;
  thickness?: number;
  labelSize?: number;
  color?: string;
  hoverColor?: string;
  activeColor?: string;
  activeHoverColor?: string;
  textColor?: string;
  activeTextColor?: string;
  active?: boolean;
  enabled?: boolean;
  opacity?: number;
  transparent?: boolean;
  depthTest?: boolean;
  depthWrite?: boolean;
  renderOrder?: number;
  pressDepth?: number;
  animate?: boolean;
  onClick(): void;
}

export const ControlPillButton = (props: ControlPillButtonProps) => {
  const thickness = props.thickness ?? 10;
  const enabled = props.enabled !== false;
  return <ControlHandle
    name={props.name}
    enabled={enabled}
    position={props.position}
    rotation={props.rotation}
    onActivate={props.onClick}>
    {state => {
      let color = props.color || CONTROL_COLORS.neutral;
      if (props.active) {
        color = state.hovered
          ? props.activeHoverColor || CONTROL_COLORS.activeHover
          : props.activeColor || CONTROL_COLORS.active;
      } else if (state.hovered) {
        color = props.hoverColor || CONTROL_COLORS.neutralHover;
      }
      return <PillVisual
        {...props}
        color={color}
        enabled={enabled}
        pressed={state.pressed}
        thickness={thickness} />;
    }}
  </ControlHandle>;
};

interface PillVisualProps extends ControlPillButtonProps {
  color: string;
  enabled: boolean;
  pressed: boolean;
  thickness: number;
}

const PillVisual = (props: PillVisualProps) => {
  const bodyLength = Math.max(1, props.length - props.width);
  const pressDepth = props.pressDepth ?? Math.min(10, props.thickness);
  const shape = React.useMemo(() => {
    const radius = props.width / 2;
    const halfBodyLength = bodyLength / 2;
    const pill = new Shape();
    pill.moveTo(-halfBodyLength, -radius);
    pill.lineTo(halfBodyLength, -radius);
    pill.absarc(
      halfBodyLength, 0, radius, -Math.PI / 2, Math.PI / 2, false);
    pill.lineTo(-halfBodyLength, radius);
    pill.absarc(
      -halfBodyLength, 0, radius, Math.PI / 2, 3 * Math.PI / 2, false);
    pill.closePath();
    return pill;
  }, [bodyLength, props.width]);
  const geometryArgs = React.useMemo(() => [
    shape,
    {
      depth: props.thickness,
      steps: 1,
      bevelEnabled: false,
      curveSegments: 32,
    },
  ] as [Shape, ExtrudeGeometryOptions], [props.thickness, shape]);
  const [{ z }] = useSpring(() => ({
    z: props.pressed ? -pressDepth : 0,
    immediate: props.animate === false,
    config: { tension: 500, friction: 24 },
  }), [pressDepth, props.animate, props.pressed]);
  const material = <MeshPhongMaterial
    color={props.color}
    transparent={props.transparent
      ?? (props.opacity !== undefined && props.opacity < 1)}
    opacity={props.opacity}
    depthTest={props.depthTest ?? true}
    depthWrite={props.depthWrite ?? true}
    toneMapped={!!props.active} />;
  const raycast = props.enabled ? undefined : noControlRaycast;
  return <AnimatedGroup
    name={`${props.name}-visual`}
    position-z={z}
    renderOrder={props.renderOrder}>
    <Extrude
      name={`${props.name}-body`}
      args={geometryArgs}
      position={[0, 0, -props.thickness / 2]}
      raycast={raycast}
      renderOrder={props.renderOrder}
      userData={{
        length: props.length,
        width: props.width,
        thickness: props.thickness,
      }}>
      {material}
    </Extrude>
    {props.icon}
    {props.label !== undefined &&
      <ControlLabel
        name={`${props.name}-label`}
        position={[0, 0, props.thickness / 2 + 1]}
        billboard={false}
        fontSize={props.labelSize}
        color={props.active
          ? props.activeTextColor || CONTROL_COLORS.neutral
          : props.textColor || "white"}
        opacity={props.opacity}
        transparent={props.transparent}
        depthTest={props.depthTest ?? true}
        depthWrite={props.depthWrite ?? true}
        enabled={false}
        renderOrder={(props.renderOrder || 0) + 1}>
        {props.label}
      </ControlLabel>}
  </AnimatedGroup>;
};
