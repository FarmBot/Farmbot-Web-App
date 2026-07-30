import React from "react";
import { Config } from "../../config";
import { threeSpace, zZero } from "../../helpers";
import { Group } from "../../components";
import { ControlArrow } from "../../controls";

export interface FarmbotAxesProps {
  config: Config;
}

const AXES_CONFIG_FIELDS: (keyof Config)[] = [
  "axes",
  "bedLengthOuter",
  "bedWidthOuter",
  "bedXOffset",
  "bedYOffset",
  "columnLength",
  "zGantryOffset",
];

export const farmbotAxesPropsEqual = (
  prev: FarmbotAxesProps,
  next: FarmbotAxesProps,
) =>
  AXES_CONFIG_FIELDS.every(field => prev.config[field] === next.config[field]);

const FarmbotAxesBase = (props: FarmbotAxesProps) => {
  if (!props.config.axes) { return <></>; }
  const {
    bedLengthOuter, bedXOffset, bedWidthOuter, bedYOffset,
  } = props.config;
  const length = 150;
  const width = 15;
  const x = threeSpace(0, bedLengthOuter) + bedXOffset;
  const y = threeSpace(0, bedWidthOuter) + bedYOffset;
  const z = zZero(props.config);
  return <Group position={[x, y, z]}>
    <ControlArrow name={"x-axis"} start={[0, 0, 0]} end={[length, 0, 0]}
      width={width} color={"#ccc"} enabled={false}
      depthTest={true} depthWrite={true} />
    <ControlArrow name={"y-axis"} start={[0, 0, 0]} end={[0, length, 0]}
      width={width} color={"#ccc"} enabled={false}
      depthTest={true} depthWrite={true} />
    <ControlArrow name={"z-axis"} start={[0, 0, 0]} end={[0, 0, length]}
      width={width} color={"#ccc"} enabled={false}
      depthTest={true} depthWrite={true} />
  </Group>;
};

export const FarmbotAxes = React.memo(FarmbotAxesBase, farmbotAxesPropsEqual);
