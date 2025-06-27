import React from "react";
import { Config } from "../config";
import { Group } from "../components";
import { Line, LineProps } from "@react-three/drei";
import {
  zero as zeroFunc, extents as extentsFunc, getGardenPositionFunc,
} from "../helpers";
import { chain, floor, range } from "lodash";
import { Vector3 } from "three";

export const gridLineOffsets = (botDimension: number): number[] => {
  const lastRegularOffset = floor(botDimension, -2);
  return chain(range(0, lastRegularOffset + 100, 100))
    .concat(botDimension)
    .uniq()
    .value();
};

interface SurfaceLineProps extends Omit<LineProps, "points"> {
  getZ(x: number, y: number): number;
  start: { x: number, y: number };
  end: { x: number, y: number };
  config: Config;
}

const SurfaceLine = (props: SurfaceLineProps) => {
  const { getZ, start, end, config } = props;
  const points = React.useMemo(() =>
    range(101).map(i => {
      const t = i / 100;
      const x = start.x + (end.x - start.x) * t;
      const y = start.y + (end.y - start.y) * t;
      const gardenPosition = getGardenPositionFunc(config, false)({ x, y });
      const z = getZ(gardenPosition.x, gardenPosition.y);
      return new Vector3(x, y, z);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }), [getZ]);
  return <Line {...props} points={points} />;
};

export interface GridProps {
  config: Config;
  getZ(x: number, y: number): number;
  activeFocus: string;
}

export const Grid = (props: GridProps) => {
  const { config } = props;
  const zero = zeroFunc(config);
  const extents = extentsFunc(config);
  return <Group name={"garden-grid"}
    visible={config.grid && props.activeFocus != "Planter bed"}
    position={[0, 0, zero.z]}>
    {gridLineOffsets(config.botSizeX).map(xOffset => {
      const isOuterLine = xOffset === 0 || xOffset === config.botSizeX;
      return <SurfaceLine key={xOffset}
        color={"white"}
        transparent={true}
        opacity={isOuterLine ? 0.75 : 0.5}
        lineWidth={2 * (isOuterLine ? 1.5 : 1)}
        config={config}
        getZ={props.getZ}
        start={{
          x: zero.x + xOffset,
          y: zero.y,
        }}
        end={{
          x: zero.x + xOffset,
          y: extents.y,
        }} />;
    })}
    {gridLineOffsets(config.botSizeY).map(yOffset => {
      const isOuterLine = yOffset === 0 || yOffset === config.botSizeY;
      return <SurfaceLine key={yOffset}
        color={"white"}
        transparent={true}
        opacity={isOuterLine ? 0.75 : 0.5}
        lineWidth={isOuterLine ? 1.5 : 1}
        config={config}
        getZ={props.getZ}
        start={{
          x: zero.x,
          y: zero.y + yOffset,
        }}
        end={{
          x: extents.x,
          y: zero.y + yOffset,
        }} />;
    })}
  </Group>;
};
