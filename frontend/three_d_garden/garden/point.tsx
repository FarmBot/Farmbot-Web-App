import React from "react";
import { TaggedGenericPointer } from "farmbot";
import { Config } from "../config";
import { Group, MeshPhongMaterial } from "../components";
import { Cylinder, Sphere } from "@react-three/drei";
import { DoubleSide } from "three";
import { zero as zeroFunc, threeSpace } from "../helpers";

export interface PointProps {
  point: TaggedGenericPointer;
  config: Config;
}

export const Point = (props: PointProps) => {
  const { point, config } = props;
  const RADIUS = 25;
  const HEIGHT = 100;
  return <Group
    name={"point"}
    rotation={[Math.PI / 2, 0, 0]}
    position={[
      threeSpace(point.body.x, config.bedLengthOuter),
      threeSpace(point.body.y, config.bedWidthOuter),
      zeroFunc(config).z - config.soilHeight,
    ]}>
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
