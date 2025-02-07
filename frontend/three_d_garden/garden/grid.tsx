import React from "react";
import { Config } from "../config";
import { Group } from "../components";
import { Line } from "@react-three/drei";
import { zero as zeroFunc, extents as extentsFunc } from "../helpers";
import { range } from "lodash";

export interface GridProps {
  config: Config;
}

export const Grid = (props: GridProps) => {
  const { config } = props;
  const zero = zeroFunc(config);
  const gridZ = zero.z - config.soilHeight + 5;
  const extents = extentsFunc(config);
  return <Group name={"garden-grid"} visible={config.grid}>
    {range(0, config.botSizeX + 100, 100).map(x =>
      <Line key={x}
        color={"white"}
        points={[
          [zero.x + x, zero.y, gridZ],
          [zero.x + x, extents.y, gridZ],
        ]} />)}
    {range(0, config.botSizeY + 100, 100).map(y =>
      <Line key={y}
        color={"white"}
        points={[
          [zero.x, zero.y + y, gridZ],
          [extents.x, zero.y + y, gridZ],
        ]} />)}
  </Group>;
};
