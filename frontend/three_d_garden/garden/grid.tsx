import React from "react";
import { Config } from "../config";
import { Group } from "../components";
import { Line } from "@react-three/drei";
import { zero as zeroFunc, extents as extentsFunc } from "../helpers";
import { chain, floor, range } from "lodash";

export const gridLineOffsets = (botDimension: number): number[] => {
  const lastRegularOffset = floor(botDimension, -2);
  return chain(range(0, lastRegularOffset + 100, 100))
    .concat(botDimension)
    .uniq()
    .value();
};

export interface GridProps {
  config: Config;
}

export const Grid = (props: GridProps) => {
  const { config } = props;
  const zero = zeroFunc(config);
  const gridZ = zero.z - config.soilHeight + 1;
  const extents = extentsFunc(config);
  return <Group name={"garden-grid"} visible={config.grid}>
    {gridLineOffsets(config.botSizeX).map(xOffset => {
      const isOuterLine = xOffset === 0 || xOffset === config.botSizeX;
      return <Line key={xOffset}
        color={"white"}
        transparent={true}
        opacity={isOuterLine ? 0.75 : 0.5}
        lineWidth={isOuterLine ? 1.5 : 1}
        points={[
          [zero.x + xOffset, zero.y, gridZ],
          [zero.x + xOffset, extents.y, gridZ],
        ]} />;
    })}
    {gridLineOffsets(config.botSizeY).map(yOffset => {
      const isOuterLine = yOffset === 0 || yOffset === config.botSizeY;
      return <Line key={yOffset}
        color={"white"}
        transparent={true}
        opacity={isOuterLine ? 0.75 : 0.5}
        lineWidth={isOuterLine ? 1.5 : 1}
        points={[
          [zero.x, zero.y + yOffset, gridZ],
          [extents.x, zero.y + yOffset, gridZ],
        ]} />;
    })}
  </Group>;
};
