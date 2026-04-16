import React from "react";
import { Config, PositionConfig } from "../../config";
import { Box, Edges } from "@react-three/drei";
import { Group, MeshBasicMaterial } from "../../components";
import {
  get3DPositionNoMirrorFunc,
  threeSpace,
  zero as zeroFunc,
  zDir as zDirFunc,
} from "../../helpers";
import { DistanceIndicator } from "../../elements";
import { BackSide } from "three";

export interface BoundsProps {
  config: Config;
  configPosition: PositionConfig;
}

export const Bounds = (props: BoundsProps) => {
  const {
    bedLengthOuter, bedWidthOuter,
    zAxisLength, columnLength, beamLength, bounds,
    bedYOffset, botSizeX, botSizeY, botSizeZ,
  } = props.config;
  const { x, y, z } = props.configPosition;
  const zDir = zDirFunc(props.config);
  const zero = zeroFunc(props.config);
  const get3DPosition = get3DPositionNoMirrorFunc(props.config);
  return <Group name={"bounds-and-distances"}>
    <Box name={"bounds"}
      visible={bounds}
      position={[
        zero.x + botSizeX / 2,
        zero.y + botSizeY / 2,
        zero.z - botSizeZ / 2,
      ]}
      args={[
        botSizeX,
        botSizeY,
        botSizeZ,
      ]}>
      <MeshBasicMaterial
        side={BackSide}
        depthWrite={false}
        transparent={true}
        opacity={0} />
      <Edges
        lineWidth={1.1}
        color={"white"}
        threshold={1} />
    </Box>
    <Group visible={props.config.zDimension}>
      <DistanceIndicator
        start={{
          x: threeSpace(0, bedLengthOuter),
          y: threeSpace(bedWidthOuter, bedWidthOuter),
          z: 0,
        }}
        end={{
          x: threeSpace(0, bedLengthOuter),
          y: threeSpace(bedWidthOuter, bedWidthOuter),
          z: zero.z - z + zAxisLength,
        }} />
    </Group>
    <Group visible={props.config.distanceIndicator == "beamLength"}>
      <DistanceIndicator
        start={{
          x: get3DPosition({ x: x + 100,
            y: bedWidthOuter / 2 - beamLength / 2 - bedYOffset }).x,
          y: get3DPosition({ x: x + 100,
            y: bedWidthOuter / 2 - beamLength / 2 - bedYOffset }).y,
          z: columnLength + 200,
        }}
        end={{
          x: get3DPosition({ x: x + 100,
            y: bedWidthOuter / 2 + beamLength / 2 - bedYOffset }).x,
          y: get3DPosition({ x: x + 100,
            y: bedWidthOuter / 2 + beamLength / 2 - bedYOffset }).y,
          z: columnLength + 200,
        }} />
    </Group>
    <Group visible={props.config.distanceIndicator == "columnLength"}>
      <DistanceIndicator
        start={{
          x: get3DPosition({ x: x + 100,
            y: bedWidthOuter + 200 - bedYOffset }).x,
          y: get3DPosition({ x: x + 100,
            y: bedWidthOuter + 200 - bedYOffset }).y,
          z: 30,
        }}
        end={{
          x: get3DPosition({ x: x + 100,
            y: bedWidthOuter + 200 - bedYOffset }).x,
          y: get3DPosition({ x: x + 100,
            y: bedWidthOuter + 200 - bedYOffset }).y,
          z: 30 + columnLength,
        }} />
    </Group>
    <Group visible={props.config.distanceIndicator == "zAxisLength"}>
      <DistanceIndicator
        start={{
          x: get3DPosition({ x: x + 100, y }).x,
          y: get3DPosition({ x: x + 100, y }).y,
          z: zero.z - zDir * z,
        }}
        end={{
          x: get3DPosition({ x: x + 100, y }).x,
          y: get3DPosition({ x: x + 100, y }).y,
          z: zero.z - zDir * z + zAxisLength,
        }} />
    </Group>
  </Group>;
};
