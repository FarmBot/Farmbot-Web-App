import React from "react";
import { Config } from "../../config";
import { Arrow } from "../../elements";
import { threeSpace, zZero } from "../../helpers";
import { Group } from "../../components";

export interface FarmbotAxesProps {
  config: Config;
}

export const FarmbotAxes = React.memo((props: FarmbotAxesProps) => {
  const {
    bedLengthOuter, bedXOffset, bedWidthOuter, bedYOffset,
  } = props.config;
  const length = 150;
  const width = 15;
  const position = React.useMemo<[number, number, number]>(() => ([
    threeSpace(0, bedLengthOuter) + bedXOffset,
    threeSpace(0, bedWidthOuter) + bedYOffset,
    zZero(props.config),
  ]), [
    bedLengthOuter,
    bedWidthOuter,
    bedXOffset,
    bedYOffset,
    props.config.columnLength,
    props.config.zGantryOffset,
  ]);
  const yRotation = React.useMemo<[number, number, number]>(
    () => [0, 0, Math.PI / 2], []);
  const zRotation = React.useMemo<[number, number, number]>(
    () => [0, -Math.PI / 2, 0], []);
  return <Group position={position}>
    <Arrow length={length} width={width} />
    <Arrow length={length} width={width} rotation={yRotation} />
    <Arrow length={length} width={width} rotation={zRotation} />
  </Group>;
});
