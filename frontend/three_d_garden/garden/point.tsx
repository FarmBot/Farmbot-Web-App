import React from "react";
import { TaggedGenericPointer } from "farmbot";
import { Config } from "../config";
import { Group, MeshPhongMaterial } from "../components";
import { Cylinder, Sphere } from "@react-three/drei";
import { DoubleSide } from "three";
import { zero as zeroFunc, threeSpace } from "../helpers";
import { useNavigate } from "react-router";
import { Path } from "../../internal_urls";

export interface PointProps {
  point: TaggedGenericPointer;
  config: Config;
}

export const Point = (props: PointProps) => {
  const { point, config } = props;
  const RADIUS = 25;
  const HEIGHT = 100;
  const navigate = useNavigate();
  return <Group
    name={"point"}
    rotation={[Math.PI / 2, 0, 0]}
    position={[
      threeSpace(point.body.x, config.bedLengthOuter) + config.bedXOffset,
      threeSpace(point.body.y, config.bedWidthOuter) + config.bedYOffset,
      zeroFunc(config).z - config.soilHeight,
    ]}>
    <Group name={"marker"}
      onClick={() => {
        point.body.id && navigate(Path.points(point.body.id));
      }}>
      <Cylinder
        args={[RADIUS, 0, HEIGHT, 32, 32, true]}
        position={[0, HEIGHT / 2, 0]}>
        <MeshPhongMaterial
          color={point.body.meta.color}
          side={DoubleSide}
          transparent={true}
          opacity={1} />
      </Cylinder>
      <Sphere
        args={[RADIUS, 32, 32]}
        position={[0, HEIGHT, 0]}>
        <MeshPhongMaterial
          color={point.body.meta.color}
          side={DoubleSide}
          transparent={true}
          opacity={1} />
      </Sphere>
    </Group>
    <Cylinder
      args={[point.body.radius, point.body.radius, 100, 32, 32, true]}>
      <MeshPhongMaterial
        color={point.body.meta.color}
        side={DoubleSide}
        transparent={true}
        opacity={0.5} />
    </Cylinder>
  </Group>;
};
