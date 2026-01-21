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

export const Bounds = React.memo((props: BoundsProps) => {
  const {
    bedLengthOuter, bedWidthOuter, x, y, z,
    zAxisLength, columnLength, beamLength, bounds,
    bedXOffset, bedYOffset,
  } = props.config;
  const zZero = React.useMemo(
    () => zZeroFunc(props.config),
    [props.config.columnLength, props.config.zGantryOffset],
  );
  const zDir = React.useMemo(
    () => zDirFunc(props.config),
    [props.config.negativeZ],
  );
  const boundsConfig = React.useMemo(() => ({
    bedXOffset,
    bedYOffset,
    bedLengthOuter,
    bedWidthOuter,
    botSizeX: props.config.botSizeX,
    botSizeY: props.config.botSizeY,
    botSizeZ: props.config.botSizeZ,
    columnLength: props.config.columnLength,
    zGantryOffset: props.config.zGantryOffset,
  } as Config), [
    bedXOffset,
    bedYOffset,
    bedLengthOuter,
    bedWidthOuter,
    props.config.botSizeX,
    props.config.botSizeY,
    props.config.botSizeZ,
    props.config.columnLength,
    props.config.zGantryOffset,
  ]);
  const zero = React.useMemo(() => zeroFunc(boundsConfig), [boundsConfig]);
  const extents = React.useMemo(() => extentsFunc(boundsConfig), [boundsConfig]);
  const boundsPoints = React.useMemo(() => {
    const zDip = (pX: number, pY: number): [number, number, number][] => [
      [pX, pY, extents.z],
      [pX, pY, zero.z],
      [pX, pY, extents.z],
    ];
    return [
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
    ] as [number, number, number][];
  }, [extents, zero]);
  const toX = React.useCallback(
    (value: number) => threeSpace(value, bedLengthOuter) + bedXOffset,
    [bedLengthOuter, bedXOffset],
  );
  const toY = React.useCallback(
    (value: number) => threeSpace(value, bedWidthOuter) + bedYOffset,
    [bedWidthOuter, bedYOffset],
  );
  const toYNoOffset = React.useCallback(
    (value: number) => threeSpace(value, bedWidthOuter),
    [bedWidthOuter],
  );
  const zDimensionStart = React.useMemo(() => ({
    x: toX(0),
    y: toYNoOffset(bedWidthOuter),
    z: 0,
  }), [toX, toYNoOffset, bedWidthOuter]);
  const zDimensionEnd = React.useMemo(() => ({
    x: toX(0),
    y: toYNoOffset(bedWidthOuter),
    z: zZero - z + zAxisLength,
  }), [
    toX,
    toYNoOffset,
    bedWidthOuter,
    zZero,
    z,
    zAxisLength,
  ]);
  const beamStart = React.useMemo(() => ({
    x: toX(x + 100),
    y: toYNoOffset(bedWidthOuter / 2 - beamLength / 2),
    z: columnLength + 200,
  }), [
    toX,
    toYNoOffset,
    x,
    bedWidthOuter,
    beamLength,
    columnLength,
  ]);
  const beamEnd = React.useMemo(() => ({
    x: toX(x + 100),
    y: toYNoOffset(bedWidthOuter / 2 + beamLength / 2),
    z: columnLength + 200,
  }), [
    toX,
    toYNoOffset,
    x,
    bedWidthOuter,
    beamLength,
    columnLength,
  ]);
  const columnStart = React.useMemo(() => ({
    x: toX(x + 100),
    y: toYNoOffset(bedWidthOuter + 200),
    z: 30,
  }), [
    toX,
    toYNoOffset,
    x,
    bedWidthOuter,
  ]);
  const columnEnd = React.useMemo(() => ({
    x: toX(x + 100),
    y: toYNoOffset(bedWidthOuter + 200),
    z: 30 + columnLength,
  }), [
    toX,
    toYNoOffset,
    x,
    bedWidthOuter,
    columnLength,
  ]);
  const zAxisStart = React.useMemo(() => ({
    x: toX(x + 100),
    y: toY(y),
    z: zZero - zDir * z,
  }), [
    toX,
    toY,
    x,
    y,
    zZero,
    zDir,
    z,
  ]);
  const zAxisEnd = React.useMemo(() => ({
    x: toX(x + 100),
    y: toY(y),
    z: zZero - zDir * z + zAxisLength,
  }), [
    toX,
    toY,
    x,
    y,
    zZero,
    zDir,
    z,
    zAxisLength,
  ]);
  return <Group name={"bounds-and-distances"}>
    <Line name={"bounds"}
      visible={bounds}
      color={"white"}
      points={boundsPoints} />
    <Group visible={props.config.zDimension}>
      <DistanceIndicator
        start={zDimensionStart}
        end={zDimensionEnd} />
    </Group>
    <Group visible={props.config.distanceIndicator == "beamLength"}>
      <DistanceIndicator
        start={beamStart}
        end={beamEnd} />
    </Group>
    <Group visible={props.config.distanceIndicator == "columnLength"}>
      <DistanceIndicator
        start={columnStart}
        end={columnEnd} />
    </Group>
    <Group visible={props.config.distanceIndicator == "zAxisLength"}>
      <DistanceIndicator
        start={zAxisStart}
        end={zAxisEnd} />
    </Group>
  </Group>;
});
