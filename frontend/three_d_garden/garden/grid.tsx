import React from "react";
import { Config } from "../config";
import { Primitive } from "../components";
import {
  get3DPositionFunc, zero as zeroFunc,
} from "../helpers";
import { useThree } from "@react-three/fiber";
import {
  LineSegments2,
} from "three/examples/jsm/lines/LineSegments2.js";
import {
  LineSegmentsGeometry,
} from "three/examples/jsm/lines/LineSegmentsGeometry.js";
import { LineMaterial } from "three/examples/jsm/lines/LineMaterial.js";
import { FocusVisibilityGroup } from "../focus_transition";

export const gridLineOffsets = (botDimension: number): number[] => {
  const offsets = [0];
  const lastRegularOffset = Math.floor(botDimension / 100) * 100;
  for (let offset = 100; offset <= lastRegularOffset; offset += 100) {
    offsets.push(offset);
  }
  if (offsets[offsets.length - 1] != botDimension) {
    offsets.push(botDimension);
  }
  return offsets;
};

const pushLineSegmentsFor = (
  positions: number[],
  start: { x: number, y: number },
  end: { x: number, y: number },
  getZ: (x: number, y: number) => number,
  config: Config,
) => {
  const get3DPosition = get3DPositionFunc(config);
  let hasPrev = false;
  let prevX = 0;
  let prevY = 0;
  let prevZ = 0;
  for (let i = 0; i <= 100; i++) {
    const t = i / 100;
    const gardenX = start.x + (end.x - start.x) * t;
    const gardenY = start.y + (end.y - start.y) * t;
    const { x, y } = get3DPosition({ x: gardenX, y: gardenY });
    const z = getZ(gardenX, gardenY);
    if (hasPrev) {
      positions.push(prevX, prevY, prevZ, x, y, z);
    }
    prevX = x;
    prevY = y;
    prevZ = z;
    hasPrev = true;
  }
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

export const gridLinePositions = (
  config: Config,
  getZ: (x: number, y: number) => number,
) => {
  const result = {
    outerPositions: [] as number[],
    innerPositions: [] as number[],
  };
  gridLineOffsets(config.botSizeX).forEach(xOffset => {
    const positions = xOffset === 0 || xOffset === config.botSizeX
      ? result.outerPositions
      : result.innerPositions;
    pushLineSegmentsFor(positions, {
      x: xOffset,
      y: 0,
    }, {
      x: xOffset,
      y: config.botSizeY,
    }, getZ, config);
  });
  gridLineOffsets(config.botSizeY).forEach(yOffset => {
    const positions = yOffset === 0 || yOffset === config.botSizeY
      ? result.outerPositions
      : result.innerPositions;
    pushLineSegmentsFor(positions, {
      x: 0,
      y: yOffset,
    }, {
      x: config.botSizeX,
      y: yOffset,
    }, getZ, config);
  });
  return result;
};

export interface GridProps {
  config: Config;
  getZ(x: number, y: number): number;
  activeFocus: string;
}

export const Grid = (props: GridProps) => {
  const visible = props.config.grid && props.activeFocus != "Planter bed";
  if (!visible) { return <></>; }
  return <VisibleGrid {...props} />;
};

const VisibleGrid = (props: GridProps) => {
  const { config } = props;
  const zero = zeroFunc(config);
  const { outerPositions, innerPositions } = React.useMemo(() =>
    gridLinePositions(config, props.getZ), [config, props.getZ]);
  const materialBindingKey = [
    config.botSizeX,
    config.botSizeY,
    zero.z,
    outerPositions.length,
    innerPositions.length,
  ].join(":");
  return <FocusVisibilityGroup name={"garden-grid"}
    visible={true}
    keepMounted={true}
    materialBindingKey={materialBindingKey}
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
  </FocusVisibilityGroup>;
};
