import React from "react";
import { Cone, Cylinder } from "@react-three/drei";
import { Quaternion, Vector3 } from "three";
import { Group, MeshPhongMaterial } from "../components";
import { noControlRaycast } from "./events";
import { ControlLabel } from "./control_label";
import { ControlPoint } from "./types";
import {
  ControlColorType, ControlRenderOptions, CONTROL_HOVER_SCALE,
  resolveControlColors, resolveControlRenderOptions,
} from "./theme";

export interface ControlArrowProps extends ControlRenderOptions {
  name: string;
  start: ControlPoint;
  end: ControlPoint;
  width: number;
  color?: string;
  colorType?: ControlColorType;
  hoverColor?: string;
  hovered?: boolean;
  enabled?: boolean;
  heads?: "none" | "start" | "end" | "both";
  headLength?: number;
  headWidthScale?: number;
  hoverScale?: number;
  opacity?: number;
  transparent?: boolean;
  label?: React.ReactNode;
  labelName?: string;
  labelOffset?: ControlPoint;
  labelSize?: number;
  labelVisible?: boolean;
  labelDepthTest?: boolean;
  labelDepthWrite?: boolean;
  labelRenderOrder?: number;
}

const hasStartHead = (heads: ControlArrowProps["heads"]) =>
  heads == "start" || heads == "both";

const hasEndHead = (heads: ControlArrowProps["heads"]) =>
  heads == "end" || heads == "both";

// eslint-disable-next-line complexity
export const ControlArrow = (props: ControlArrowProps) => {
  const start = new Vector3(...props.start);
  const end = new Vector3(...props.end);
  const direction = end.clone().sub(start);
  const distance = direction.length();
  if (distance < 1) { return <></>; }
  const enabled = props.enabled !== false;
  const hovered = enabled && !!props.hovered;
  const scale = hovered
    ? props.hoverScale || CONTROL_HOVER_SCALE
    : 1;
  const width = props.width * scale;
  const colors = resolveControlColors(
    props.colorType, props.color, props.hoverColor);
  const renderOptions = resolveControlRenderOptions(props);
  const color = hovered
    ? colors.hoverColor
    : colors.color;
  const transparent = props.transparent
    ?? (props.opacity !== undefined && props.opacity < 1);
  const heads = props.heads || "end";
  const headLength = Math.min(
    distance / (heads == "both" ? 2 : 1),
    props.headLength || props.width * 3,
  );
  const shaftStart = hasStartHead(heads) ? headLength : 0;
  const shaftEnd = distance - (hasEndHead(heads) ? headLength : 0);
  const shaftLength = Math.max(0.001, shaftEnd - shaftStart);
  const quaternion = new Quaternion().setFromUnitVectors(
    new Vector3(1, 0, 0),
    direction.normalize(),
  );
  const material = <MeshPhongMaterial
    color={color}
    transparent={transparent}
    opacity={props.opacity}
    depthTest={renderOptions.depthTest}
    depthWrite={renderOptions.depthWrite}
    toneMapped={false} />;
  const midpoint = start.clone().lerp(end, 0.5);
  const labelOffset = props.labelOffset || [0, 0, width * 2];
  return <Group name={props.name} renderOrder={renderOptions.renderOrder}>
    <Group
      name={`${props.name}-shape`}
      position={props.start}
      quaternion={quaternion}
      renderOrder={renderOptions.renderOrder}>
      <Cylinder
        args={[width / 2, width / 2, shaftLength, 16]}
        position={[shaftStart + shaftLength / 2, 0, 0]}
        renderOrder={renderOptions.renderOrder}
        raycast={enabled ? undefined : noControlRaycast}
        rotation={[0, 0, -Math.PI / 2]}>
        {material}
      </Cylinder>
      {hasEndHead(heads) &&
        <Cone
          args={[
            width * (props.headWidthScale || 1),
            headLength,
            16,
          ]}
          position={[distance - headLength / 2, 0, 0]}
          renderOrder={renderOptions.renderOrder}
          raycast={enabled ? undefined : noControlRaycast}
          rotation={[0, 0, -Math.PI / 2]}>
          {material}
        </Cone>}
      {hasStartHead(heads) &&
        <Cone
          args={[
            width * (props.headWidthScale || 1),
            headLength,
            16,
          ]}
          position={[headLength / 2, 0, 0]}
          renderOrder={props.renderOrder}
          raycast={enabled ? undefined : noControlRaycast}
          rotation={[0, 0, Math.PI / 2]}>
          {material}
        </Cone>}
    </Group>
    {props.label !== undefined &&
      <ControlLabel
        name={props.labelName || `${props.name}-label`}
        position={[
          midpoint.x + labelOffset[0],
          midpoint.y + labelOffset[1],
          midpoint.z + labelOffset[2],
        ]}
        fontSize={props.labelSize}
        color={color}
        opacity={props.opacity}
        transparent={transparent}
        renderOnTop={props.renderOnTop}
        depthTest={props.labelDepthTest ?? renderOptions.depthTest}
        depthWrite={props.labelDepthWrite ?? renderOptions.depthWrite}
        renderOrder={props.labelRenderOrder ?? renderOptions.renderOrder}
        enabled={enabled}
        visible={props.labelVisible}>
        {props.label}
      </ControlLabel>}
  </Group>;
};
