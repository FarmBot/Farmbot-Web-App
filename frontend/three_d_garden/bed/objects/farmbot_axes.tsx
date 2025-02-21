import React from "react";
import { Config } from "../../config";
import { Arrow } from "../../elements";
import { threeSpace, zZero } from "../../helpers";
import { Group } from "../../components";

export interface FarmbotAxesProps {
  config: Config;
}

export const FarmbotAxes = (props: FarmbotAxesProps) => {
  const {
    bedLengthOuter, bedXOffset, bedWidthOuter, bedYOffset,
  } = props.config;
  const length = 150;
  const width = 15;
  const x = threeSpace(0, bedLengthOuter) + bedXOffset;
  const y = threeSpace(0, bedWidthOuter) + bedYOffset;
  const z = zZero(props.config);
  return <Group position={[x, y, z]}>
    <Arrow length={length} width={width} />
    <Arrow length={length} width={width} rotation={[0, 0, Math.PI / 2]} />
    <Arrow length={length} width={width} rotation={[0, -Math.PI / 2, 0]} />
  </Group>;
};
