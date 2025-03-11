import React from "react";
import { TaggedGenericPointer } from "farmbot";
import { Config } from "../config";
import { Group, MeshPhongMaterial } from "../components";
import { Cylinder, Sphere } from "@react-three/drei";
import { DoubleSide, Vector3 } from "three";
import { zero as zeroFunc, threeSpace } from "../helpers";
import { useNavigate } from "react-router";
import { Path } from "../../internal_urls";
import { isUndefined } from "lodash";
import { setPanelOpen } from "../../farm_designer/panel_header";
import { DesignerState } from "../../farm_designer/interfaces";
import { getMode } from "../../farm_designer/map/util";
import { Mode } from "../../farm_designer/map/interfaces";
import { WeedBase } from ".";

export interface PointProps {
  point: TaggedGenericPointer;
  config: Config;
  dispatch?: Function;
}

export const Point = (props: PointProps) => {
  const { point, config } = props;
  const navigate = useNavigate();
  return <PointBase
    pointName={"" + point.body.id}
    alpha={1}
    position={new Vector3(
      threeSpace(point.body.x, config.bedLengthOuter) + config.bedXOffset,
      threeSpace(point.body.y, config.bedWidthOuter) + config.bedYOffset,
      zeroFunc(config).z - config.soilHeight,
    )}
    onClick={() => {
      if (point.body.id && !isUndefined(props.dispatch)) {
        props.dispatch(setPanelOpen(true));
        navigate(Path.points(point.body.id));
      }
    }}
    color={point.body.meta.color}
    radius={point.body.radius}
  />;
};

export const getDrawnPointData = (designer: DesignerState, config: Config) => {
  const { drawnPoint, drawnWeed } = designer;
  const point = getMode() == Mode.createWeed ? drawnWeed : drawnPoint;
  const xyz = {
    x: point?.cx || 0,
    y: point?.cy || 0,
    z: point?.z || -config.soilHeight,
  };
  const color = point?.color || "green";
  const radius = point?.r || 15;
  const position = new Vector3(
    threeSpace(xyz.x, config.bedLengthOuter) + config.bedXOffset,
    threeSpace(xyz.y, config.bedWidthOuter) + config.bedYOffset,
    zeroFunc(config).z + xyz.z,
  );
  const data = {
    position,
    color,
    radius,
  };
  return data;
};

export interface DrawnPointProps {
  designer: DesignerState;
  usePosition: boolean;
  config: Config;
}

export const DrawnPoint = (props: DrawnPointProps) => {
  const { config } = props;
  const data = getDrawnPointData(props.designer, config);
  const Base = getMode() == Mode.createWeed ? WeedBase : PointBase;
  return <Base
    pointName={"drawn-point"}
    alpha={0.5}
    position={props.usePosition ? data.position : undefined}
    color={data.color}
    radius={data.radius} />;
};

interface PointBaseProps {
  pointName: string;
  position?: Vector3;
  onClick?: () => void;
  color: string | undefined;
  radius: number;
  alpha: number;
}

const PointBase = (props: PointBaseProps) => {
  const RADIUS = 25;
  const HEIGHT = 100;

  return <Group
    name={"point-" + props.pointName}
    rotation={[Math.PI / 2, 0, 0]}
    position={props.position}>
    <Group name={"marker"}
      onClick={props.onClick}>
      <Cylinder
        args={[RADIUS, 0, HEIGHT, 32, 32, true]}
        position={[0, HEIGHT / 2, 0]}>
        <MeshPhongMaterial
          color={props.color}
          side={DoubleSide}
          transparent={true}
          opacity={1 * props.alpha} />
      </Cylinder>
      <Sphere
        args={[RADIUS, 32, 32]}
        position={[0, HEIGHT, 0]}>
        <MeshPhongMaterial
          color={props.color}
          side={DoubleSide}
          transparent={true}
          opacity={1 * props.alpha} />
      </Sphere>
    </Group>
    <Cylinder
      args={[props.radius, props.radius, 100, 32, 32, true]}>
      <MeshPhongMaterial
        color={props.color}
        side={DoubleSide}
        transparent={true}
        opacity={0.5 * props.alpha} />
    </Cylinder>
  </Group>;
};
