import React from "react";
import { SpecialStatus, TaggedGenericPointer, Xyz } from "farmbot";
import { Config } from "../config";
import { Group, MeshPhongMaterial } from "../components";
import { Cylinder, Sphere, Torus } from "@react-three/drei";
import { DoubleSide } from "three";
import { zero as zeroFunc, threeSpace } from "../helpers";
import { useNavigate } from "react-router";
import { Path } from "../../internal_urls";
import { isUndefined, round } from "lodash";
import { setPanelOpen } from "../../farm_designer/panel_header";
import { DesignerState } from "../../farm_designer/interfaces";
import { getMode } from "../../farm_designer/map/util";
import { Mode } from "../../farm_designer/map/interfaces";
import { WeedBase } from ".";
import { HOVER_OBJECT_MODES, RenderOrder } from "../constants";
import {
  BillboardRef, ImageRef, RadiusRef, TorusRef,
} from "../bed/objects/pointer_objects";

const POINT_PIN_RADIUS = 12.5;
const POINT_PIN_HEIGHT = 50;
const POINT_CYLINDER_HEIGHT = 25;
const POINT_CYLINDER_INNER_R_FRACTION = 0.95;
const POINT_CYLINDER_TUBE_SIZE = 1 - POINT_CYLINDER_INNER_R_FRACTION;
export const POINT_CYLINDER_SCALE_FACTOR =
  round(1 / POINT_CYLINDER_TUBE_SIZE ** 2);
const SEGMENTS = 64;

export interface PointProps {
  point: TaggedGenericPointer;
  config: Config;
  dispatch?: Function;
  visible: boolean;
  getZ(x: number, y: number): number;
}

export const Point = (props: PointProps) => {
  const { point, config } = props;
  const navigate = useNavigate();
  const unsaved = point.specialStatus !== SpecialStatus.SAVED;
  return <PointBase
    pointName={"" + point.body.id}
    alpha={unsaved ? 0.5 : 1}
    position={{
      x: point.body.x,
      y: point.body.y,
      z: props.getZ(point.body.x, point.body.y),
    }}
    onClick={() => {
      if (point.body.id && !isUndefined(props.dispatch) && props.visible &&
        !HOVER_OBJECT_MODES.includes(getMode())) {
        props.dispatch(setPanelOpen(true));
        navigate(Path.points(point.body.id));
      }
    }}
    config={config}
    color={point.body.meta.color}
    radius={point.body.radius}
  />;
};

export interface DrawnPointProps {
  designer: DesignerState;
  usePosition: boolean;
  config: Config;
  radiusRef?: RadiusRef;
  torusRef?: TorusRef;
  billboardRef?: BillboardRef;
  imageRef?: ImageRef;
}

export const DrawnPoint = (props: DrawnPointProps) => {
  const { config } = props;
  const { drawnPoint } = props.designer;
  const drawnPointPosition =
    drawnPoint && !isUndefined(drawnPoint.cx) && !isUndefined(drawnPoint.cy)
      ? { x: drawnPoint.cx, y: drawnPoint.cy, z: drawnPoint.z }
      : undefined;
  if (props.usePosition && isUndefined(drawnPointPosition)) { return <></>; }
  const Base = getMode() == Mode.createWeed ? WeedBase : PointBase;
  return <Base
    pointName={"drawn-point"}
    alpha={0.5}
    position={props.usePosition ? drawnPointPosition : undefined}
    color={drawnPoint?.color}
    config={config}
    radius={drawnPoint?.r || 0}
    radiusRef={props.radiusRef}
    torusRef={props.torusRef}
    billboardRef={props.billboardRef}
    imageRef={props.imageRef} />;
};

interface PointBaseProps {
  pointName: string;
  position?: Record<Xyz, number>;
  onClick?: () => void;
  color: string | undefined;
  radius: number;
  alpha: number;
  config: Config;
  torusRef?: TorusRef;
  billboardRef?: BillboardRef;
  imageRef?: ImageRef;
}

const PointBase = (props: PointBaseProps) => {
  const { config, radius } = props;
  return <Group
    name={"point-" + props.pointName}
    renderOrder={RenderOrder.default}
    rotation={[Math.PI / 2, 0, 0]}
    position={props.position
      ? [
        threeSpace(props.position.x, config.bedLengthOuter) + config.bedXOffset,
        threeSpace(props.position.y, config.bedWidthOuter) + config.bedYOffset,
        zeroFunc(config).z + props.position.z,
      ]
      : [0, 0, 0]}>
    <Group name={"marker"}
      onClick={props.onClick}>
      <Cylinder
        args={[POINT_PIN_RADIUS, 0, POINT_PIN_HEIGHT, 16, 2, true]}
        position={[0, POINT_PIN_HEIGHT / 2, 0]}>
        <MeshPhongMaterial
          color={props.color}
          side={DoubleSide}
          transparent={true}
          opacity={1 * props.alpha} />
      </Cylinder>
      <Sphere
        args={[POINT_PIN_RADIUS, 16, 16]}
        position={[0, POINT_PIN_HEIGHT, 0]}>
        <MeshPhongMaterial
          color={props.color}
          side={DoubleSide}
          transparent={true}
          opacity={1 * props.alpha} />
      </Sphere>
    </Group>
    {radius > 0 &&
      <HollowCylinder
        torusRef={props.torusRef}
        radius={radius}
        thickness={10}
        color={props.color}
        alpha={0.5 * props.alpha} />}
  </Group>;
};

interface HollowCylinderProps {
  radius: number;
  thickness: number;
  color?: string;
  alpha: number;
  torusRef?: TorusRef;
}

const HollowCylinder = (props: HollowCylinderProps) => {
  return props.torusRef
    ? <Torus
      ref={props.torusRef}
      scale={[props.radius, props.radius, POINT_CYLINDER_SCALE_FACTOR]}
      rotation={[-Math.PI / 2, 0, 0]}
      args={[1, POINT_CYLINDER_TUBE_SIZE, SEGMENTS, SEGMENTS]}>
      <MeshPhongMaterial
        color={props.color}
        transparent={true}
        opacity={props.alpha} />
    </Torus>
    : <Torus
      rotation={[-Math.PI / 2, 0, 0]}
      scale={[1, 1, POINT_CYLINDER_HEIGHT / 5]}
      args={[props.radius, 5, SEGMENTS, SEGMENTS]}>
      <MeshPhongMaterial
        color={props.color}
        transparent={true}
        opacity={props.alpha} />
    </Torus>;
};
