import React from "react";
import { MapTransformProps } from "../interfaces";
import { transformXY } from "../util";
import { DrawnPointPayl } from "../../interfaces";
import { isUndefined } from "lodash";

export interface DrawnPointProps {
  mapTransformProps: MapTransformProps;
  data: DrawnPointPayl | undefined;
}

export function DrawnPoint(props: DrawnPointProps) {
  const ID = "current-point";
  const { data, mapTransformProps } = props;
  if (!data || isUndefined(data.cx) || isUndefined(data.cy)) {
    return <g id={ID} />;
  }
  const { cx, cy, r, color } = data;
  const { qx, qy } = transformXY(cx, cy, mapTransformProps);
  return <g id={ID}
    stroke={color}
    strokeOpacity={0.75}
    strokeWidth={3}
    fill={"none"}>
    <circle id="point-radius" cx={qx} cy={qy} r={r} strokeDasharray="4 5" />
    <circle id="point-center" cx={qx} cy={qy} r={2} />
  </g>;
}
