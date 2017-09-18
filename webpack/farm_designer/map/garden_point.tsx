import * as React from "react";
import { GardenPointProps } from "./interfaces";
import { defensiveClone } from "../../util";
import { getXYFromQuadrant } from "./util";

const POINT_STYLES = {
  stroke: "green",
  strokeOpacity: 0.3,
  strokeWidth: "2",
  fill: "none",
};

export function GardenPoint(props: GardenPointProps) {
  const { point, mapTransformProps } = props;
  const { quadrant, gridSize } = mapTransformProps;
  const { id, x, y } = point.body;
  const styles = defensiveClone(POINT_STYLES);
  styles.stroke = point.body.meta.color || "green";
  const { qx, qy } = getXYFromQuadrant(x, y, quadrant, gridSize);
  return <g id={"point-" + id}>
    <circle id="point-radius" cx={qx} cy={qy} r={point.body.radius} {...styles} />
    <circle id="point-center" cx={qx} cy={qy} r={2} {...styles} />
  </g>;
}
