import * as React from "react";
import { MapTransformProps } from "./interfaces";
import { getXYFromQuadrant } from "./util";
import { CurrentPointPayl } from "../interfaces";

export interface DrawnPointProps {
  mapTransformProps: MapTransformProps;
  data: CurrentPointPayl;
}

export function DrawnPoint(props: DrawnPointProps) {
  const { data, mapTransformProps } = props;
  const { quadrant, gridSize } = mapTransformProps;
  const { cx, cy, r, color } = data;
  const { qx, qy } = getXYFromQuadrant(cx, cy, quadrant, gridSize);
  return <g
    id="current-point"
    stroke={color ? color : "green"}
    strokeOpacity={0.75}
    strokeWidth="3"
    fill="none">
    <circle id="point-radius" cx={qx} cy={qy} r={r} strokeDasharray="4 5" />
    <circle id="point-center" cx={qx} cy={qy} r={2} />
  </g>;
}
