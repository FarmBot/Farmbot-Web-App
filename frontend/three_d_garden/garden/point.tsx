import React from "react";
import { SpecialStatus, TaggedGenericPointer, Xyz } from "farmbot";
import { Config } from "../config";
import { Group, MeshPhongMaterial } from "../components";
import { Cylinder, Sphere } from "@react-three/drei";
import { DoubleSide, Mesh, Group as GroupType } from "three";
import { zero as zeroFunc, threeSpace } from "../helpers";
import { useNavigate } from "react-router";
import { Path } from "../../internal_urls";
import { isUndefined } from "lodash";
import { setPanelOpen } from "../../farm_designer/panel_header";
import { DesignerState } from "../../farm_designer/interfaces";
import { getMode } from "../../farm_designer/map/util";
import { Mode } from "../../farm_designer/map/interfaces";
import { WeedBase } from ".";
import { HOVER_OBJECT_MODES } from "../constants";

const POINT_CYLINDER_HEIGHT = 50;
const POINT_PIN_RADIUS = 25;
const POINT_PIN_HEIGHT = 100;

export interface PointProps {
  point: TaggedGenericPointer;
  config: Config;
  dispatch?: Function;
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
      z: -config.soilHeight,
    }}
    onClick={() => {
      if (point.body.id && !isUndefined(props.dispatch) &&
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
  radiusRef?: React.RefObject<Mesh | null>;
  billboardRef?: React.RefObject<GroupType | null>;
  imageRef?: React.RefObject<Mesh | null>;
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
  radiusRef?: React.RefObject<Mesh | null>;
  billboardRef?: React.RefObject<GroupType | null>;
  imageRef?: React.RefObject<Mesh | null>;
}

const PointBase = (props: PointBaseProps) => {
  const { config, radius } = props;
  return <Group
    name={"point-" + props.pointName}
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
        args={[POINT_PIN_RADIUS, 0, POINT_PIN_HEIGHT, 32, 32, true]}
        position={[0, POINT_PIN_HEIGHT / 2, 0]}>
        <MeshPhongMaterial
          color={props.color}
          side={DoubleSide}
          transparent={true}
          opacity={1 * props.alpha} />
      </Cylinder>
      <Sphere
        args={[POINT_PIN_RADIUS, 32, 32]}
        position={[0, POINT_PIN_HEIGHT, 0]}>
        <MeshPhongMaterial
          color={props.color}
          side={DoubleSide}
          transparent={true}
          opacity={1 * props.alpha} />
      </Sphere>
    </Group>
    <Cylinder
      ref={props.radiusRef}
      scale={[radius, 1, radius]}
      args={[1, 1, POINT_CYLINDER_HEIGHT, 32, 32, true]}>
      <MeshPhongMaterial
        color={props.color}
        side={DoubleSide}
        transparent={true}
        opacity={0.5 * props.alpha} />
    </Cylinder>
  </Group>;
};
