import React from "react";
import { Config } from "../config";
import { Group, Primitive } from "../components";
import {
  zero as zeroFunc, extents as extentsFunc, getGardenPositionFunc,
} from "../helpers";
import { chain, floor, range } from "lodash";
import { useThree } from "@react-three/fiber";
import {
  LineSegments2,
} from "three/examples/jsm/lines/LineSegments2";
import {
  LineSegmentsGeometry,
} from "three/examples/jsm/lines/LineSegmentsGeometry";
import { LineMaterial } from "three/examples/jsm/lines/LineMaterial";

export const gridLineOffsets = (botDimension: number): number[] => {
  const lastRegularOffset = floor(botDimension, -2);
  return chain(range(0, lastRegularOffset + 100, 100))
    .concat(botDimension)
    .uniq()
    .value();
};

const lineSegmentsFor = (
  start: { x: number, y: number },
  end: { x: number, y: number },
  getZ: (x: number, y: number) => number,
  config: Config,
) => {
  const positions: number[] = [];
  const getGardenPosition = getGardenPositionFunc(config, false);
  let prev: { x: number, y: number, z: number } | undefined;
  range(101).forEach(i => {
    const t = i / 100;
    const x = start.x + (end.x - start.x) * t;
    const y = start.y + (end.y - start.y) * t;
    const gardenPosition = getGardenPosition({ x, y });
    const z = getZ(gardenPosition.x, gardenPosition.y);
    if (prev) {
      positions.push(prev.x, prev.y, prev.z, x, y, z);
    }
    prev = { x, y, z };
  });
  return positions;
};

interface LineSegmentsProps {
  name: string;
  positions: number[];
  color: string;
  opacity: number;
  linewidth: number;
}

const LineSegments = (props: LineSegmentsProps) => {
  const { size } = useThree();
  const geometry = React.useMemo(() => {
    const geom = new LineSegmentsGeometry();
    geom.setPositions(props.positions);
    return geom;
  }, [props.positions]);
  const material = React.useMemo(() => new LineMaterial({
    color: props.color,
    linewidth: props.linewidth,
    transparent: true,
    opacity: props.opacity,
  }), [props.color, props.linewidth, props.opacity]);
  const line = React.useMemo(() => {
    const lineSegments = new LineSegments2(geometry, material);
    lineSegments.name = props.name;
    return lineSegments;
  }, [geometry, material, props.name]);

  React.useEffect(() => {
    material.resolution.set(size.width, size.height);
  }, [material, size.height, size.width]);

  React.useEffect(() => () => {
    geometry.dispose();
    material.dispose();
  }, [geometry, material]);

  return <Primitive object={line} />;
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
  const { outerPositions, innerPositions } = React.useMemo(() => {
    const result = {
      outerPositions: [] as number[],
      innerPositions: [] as number[],
    };
    gridLineOffsets(config.botSizeX).forEach(xOffset => {
      const isOuterLine = xOffset === 0 || xOffset === config.botSizeX;
      const positions = lineSegmentsFor({
        x: zero.x + xOffset,
        y: zero.y,
      }, {
        x: zero.x + xOffset,
        y: extents.y,
      }, props.getZ, config);
      if (isOuterLine) {
        result.outerPositions.push(...positions);
      } else {
        result.innerPositions.push(...positions);
      }
    });
    gridLineOffsets(config.botSizeY).forEach(yOffset => {
      const isOuterLine = yOffset === 0 || yOffset === config.botSizeY;
      const positions = lineSegmentsFor({
        x: zero.x,
        y: zero.y + yOffset,
      }, {
        x: extents.x,
        y: zero.y + yOffset,
      }, props.getZ, config);
      if (isOuterLine) {
        result.outerPositions.push(...positions);
      } else {
        result.innerPositions.push(...positions);
      }
    });
    return result;
  }, [config, extents.x, extents.y, props.getZ, zero.x, zero.y]);
  return <Group name={"garden-grid"}
    visible={config.grid && props.activeFocus != "Planter bed"}
    position={[0, 0, zero.z]}>
    <LineSegments
      name={"grid-outer"}
      positions={outerPositions}
      color={"white"}
      opacity={0.75}
      linewidth={3} />
    <LineSegments
      name={"grid-inner"}
      positions={innerPositions}
      color={"white"}
      opacity={0.5}
      linewidth={2} />
  </Group>;
};
