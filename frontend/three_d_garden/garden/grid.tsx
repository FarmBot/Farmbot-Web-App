import React from "react";
import { Config } from "../config";
import { Group } from "../components";
import { Line } from "@react-three/drei";
import {
  zero as zeroFunc, extents as extentsFunc, getGardenPositionFunc,
} from "../helpers";
import { chain, floor, range } from "lodash";

export const gridLineOffsets = (botDimension: number): number[] => {
  const lastRegularOffset = floor(botDimension, -2);
  return chain(range(0, lastRegularOffset + 100, 100))
    .concat(botDimension)
    .uniq()
    .value();
};

type LinePoint = [number, number, number];
type LineColor = [number, number, number, number];

const lineColor = (alpha: number): LineColor => [1, 1, 1, alpha];

export interface GridProps {
  config: Config;
  getZ(x: number, y: number): number;
  activeFocus: string;
}

export const Grid = React.memo((props: GridProps) => {
  const { config } = props;
  const zero = React.useMemo(() => zeroFunc(config), [config]);
  const extents = React.useMemo(() => extentsFunc(config), [config]);
  const xOffsets = React.useMemo(
    () => gridLineOffsets(config.botSizeX),
    [config.botSizeX],
  );
  const yOffsets = React.useMemo(
    () => gridLineOffsets(config.botSizeY),
    [config.botSizeY],
  );
  const getGardenPosition = React.useMemo(
    () => getGardenPositionFunc(config, false),
    [config],
  );
  const buildLineSegments = React.useCallback((
    start: { x: number, y: number },
    end: { x: number, y: number },
  ) => {
    const segments: LinePoint[] = [];
    let prev: LinePoint | undefined;
    for (let i = 0; i <= 100; i++) {
      const t = i / 100;
      const x = start.x + (end.x - start.x) * t;
      const y = start.y + (end.y - start.y) * t;
      const gardenPosition = getGardenPosition({ x, y });
      const z = props.getZ(gardenPosition.x, gardenPosition.y);
      const point: LinePoint = [x, y, z];
      if (prev) {
        segments.push(prev, point);
      }
      prev = point;
    }
    return segments;
  }, [getGardenPosition, props.getZ]);
  const xSegmentData = React.useMemo(() => {
    const outer = { points: [] as LinePoint[], colors: [] as LineColor[] };
    const inner = { points: [] as LinePoint[], colors: [] as LineColor[] };
    const outerColor = lineColor(0.75);
    const innerColor = lineColor(0.5);
    xOffsets.forEach(xOffset => {
      const isOuterLine = xOffset === 0 || xOffset === config.botSizeX;
      const segments = buildLineSegments({
        x: zero.x + xOffset,
        y: zero.y,
      }, {
        x: zero.x + xOffset,
        y: extents.y,
      });
      const target = isOuterLine ? outer : inner;
      const color = isOuterLine ? outerColor : innerColor;
      segments.forEach(segment => {
        target.points.push(segment);
        target.colors.push(color);
      });
    });
    return { outer, inner };
  }, [
    buildLineSegments,
    config.botSizeX,
    extents.y,
    xOffsets,
    zero.x,
    zero.y,
  ]);
  const ySegmentData = React.useMemo(() => {
    const outer = { points: [] as LinePoint[], colors: [] as LineColor[] };
    const inner = { points: [] as LinePoint[], colors: [] as LineColor[] };
    const outerColor = lineColor(0.75);
    const innerColor = lineColor(0.5);
    yOffsets.forEach(yOffset => {
      const isOuterLine = yOffset === 0 || yOffset === config.botSizeY;
      const segments = buildLineSegments({
        x: zero.x,
        y: zero.y + yOffset,
      }, {
        x: extents.x,
        y: zero.y + yOffset,
      });
      const target = isOuterLine ? outer : inner;
      const color = isOuterLine ? outerColor : innerColor;
      segments.forEach(segment => {
        target.points.push(segment);
        target.colors.push(color);
      });
    });
    return { outer, inner };
  }, [
    buildLineSegments,
    config.botSizeY,
    extents.x,
    yOffsets,
    zero.x,
    zero.y,
  ]);
  const basePosition = React.useMemo<[number, number, number]>(
    () => [0, 0, zero.z], [zero.z]);
  const visible = React.useMemo(
    () => config.grid && props.activeFocus != "Planter bed",
    [config.grid, props.activeFocus],
  );
  return <Group name={"garden-grid"}
    visible={visible}
    position={basePosition}>
    {xSegmentData.outer.points.length > 0 &&
      <Line
        segments={true}
        points={xSegmentData.outer.points}
        vertexColors={xSegmentData.outer.colors}
        lineWidth={3} />}
    {xSegmentData.inner.points.length > 0 &&
      <Line
        segments={true}
        points={xSegmentData.inner.points}
        vertexColors={xSegmentData.inner.colors}
        lineWidth={2} />}
    {ySegmentData.outer.points.length > 0 &&
      <Line
        segments={true}
        points={ySegmentData.outer.points}
        vertexColors={ySegmentData.outer.colors}
        lineWidth={1.5} />}
    {ySegmentData.inner.points.length > 0 &&
      <Line
        segments={true}
        points={ySegmentData.inner.points}
        vertexColors={ySegmentData.inner.colors}
        lineWidth={1} />}
  </Group>;
});
