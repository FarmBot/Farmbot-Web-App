import * as React from "react";
import { GardenPointProps } from "../../interfaces";
import { defensiveClone } from "../../../../util";
import { transformXY } from "../../util";

const POINT_STYLES = {
  stroke: "green",
  strokeOpacity: 0.3,
  strokeWidth: "2",
  fill: "none",
};

export function GardenPoint(props: GardenPointProps) {
  const { point, mapTransformProps } = props;
  const { id, x, y } = point.body;
  const styles = defensiveClone(POINT_STYLES);
  styles.stroke = point.body.meta.color || "green";
  const { qx, qy } = transformXY(x, y, mapTransformProps);
  return <g id={"point-" + id}>
    <circle id="point-radius" cx={qx} cy={qy} r={point.body.radius} {...styles} />
    <circle id="point-center" cx={qx} cy={qy} r={2} {...styles} />
  </g>;
}
