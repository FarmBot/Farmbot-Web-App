import * as React from "react";
import { MapTransformProps } from "../interfaces";
import { transformXY } from "../util";
import { DrawnWeedPayl } from "../../interfaces";

export interface DrawnWeedProps {
  mapTransformProps: MapTransformProps;
  data: DrawnWeedPayl | undefined;
}

export function DrawnWeed(props: DrawnWeedProps) {
  const ID = "current-weed";
  const { data, mapTransformProps } = props;
  if (!data) { return <g id={ID} />; }
  const { cx, cy, r } = data;
  const color = data.color || "red";
  const { qx, qy } = transformXY(cx, cy, mapTransformProps);
  const stopOpacity = ["gray", "pink", "orange"].includes(color) ? 0.5 : 0.25;
  return <g id={ID}>
    <defs>
      <radialGradient id={"DrawnWeedGradient"}>
        <stop offset="90%" stopColor={color} stopOpacity={stopOpacity} />
        <stop offset="100%" stopColor={color} stopOpacity={0} />
      </radialGradient>
    </defs>

    <circle
      id={"weed-radius"}
      cx={qx}
      cy={qy}
      r={r}
      fill={"url(#DrawnWeedGradient)"} />
  </g>;
}
