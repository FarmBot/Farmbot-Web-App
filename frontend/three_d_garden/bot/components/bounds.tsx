import React from "react";
import { Config } from "../../config";
import { Line } from "@react-three/drei";
import { Group } from "../../components";
import {
  threeSpace,
  zero as zeroFunc,
  extents as extentsFunc,
  zZero as zZeroFunc,
  zDir as zDirFunc,
} from "../../helpers";
import { DistanceIndicator } from "../../elements";

export interface BoundsProps {
  config: Config;
}

export const Bounds = (props: BoundsProps) => {
  const {
    bedLengthOuter, bedWidthOuter, x, y, z,
    zAxisLength, columnLength, beamLength, bounds,
    bedXOffset, bedYOffset,
  } = props.config;
  const zZero = zZeroFunc(props.config);
  const zDir = zDirFunc(props.config);
  const zero = zeroFunc(props.config);
  const extents = extentsFunc(props.config);
  const zDip = (x: number, y: number): [number, number, number][] => [
    [x, y, extents.z],
    [x, y, zero.z],
    [x, y, extents.z],
  ];
  return <Group name={"bounds-and-distances"}>
    <Line name={"bounds"}
      visible={bounds}
      color={"white"}
      points={[
        [zero.x, zero.y, zero.z],
        [zero.x, extents.y, zero.z],
        [extents.x, extents.y, zero.z],
        [extents.x, zero.y, zero.z],
        [zero.x, zero.y, zero.z],
        ...zDip(zero.x, zero.y),
        ...zDip(zero.x, extents.y),
        ...zDip(extents.x, extents.y),
        ...zDip(extents.x, zero.y),
        [zero.x, zero.y, extents.z],
      ]} />
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
          z: zZero - z + zAxisLength,
        }} />
    </Group>
    <Group visible={props.config.distanceIndicator == "beamLength"}>
      <DistanceIndicator
        start={{
          x: threeSpace(x + 100, bedLengthOuter) + bedXOffset,
          y: threeSpace(bedWidthOuter / 2 - beamLength / 2, bedWidthOuter),
          z: columnLength + 200,
        }}
        end={{
          x: threeSpace(x + 100, bedLengthOuter) + bedXOffset,
          y: threeSpace(bedWidthOuter / 2 + beamLength / 2, bedWidthOuter),
          z: columnLength + 200,
        }} />
    </Group>
    <Group visible={props.config.distanceIndicator == "columnLength"}>
      <DistanceIndicator
        start={{
          x: threeSpace(x + 100, bedLengthOuter) + bedXOffset,
          y: threeSpace(bedWidthOuter + 200, bedWidthOuter),
          z: 30,
        }}
        end={{
          x: threeSpace(x + 100, bedLengthOuter) + bedXOffset,
          y: threeSpace(bedWidthOuter + 200, bedWidthOuter),
          z: 30 + columnLength,
        }} />
    </Group>
    <Group visible={props.config.distanceIndicator == "zAxisLength"}>
      <DistanceIndicator
        start={{
          x: threeSpace(x + 100, bedLengthOuter) + bedXOffset,
          y: threeSpace(y, bedWidthOuter) + bedYOffset,
          z: zZero - zDir * z,
        }}
        end={{
          x: threeSpace(x + 100, bedLengthOuter) + bedXOffset,
          y: threeSpace(y, bedWidthOuter) + bedYOffset,
          z: zZero - zDir * z + zAxisLength,
        }} />
    </Group>
  </Group>;
};
