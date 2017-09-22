import * as React from "react";
import { MapTransformProps } from "./interfaces";
import { getXYFromQuadrant, round } from "./util";

export type SelectionBoxData =
  Record<"x0" | "y0" | "x1" | "y1", number | undefined>;

export interface SelectionBoxProps {
  selectionBox: SelectionBoxData;
  mapTransformProps: MapTransformProps;
}

export function SelectionBox(props: SelectionBoxProps) {
  const { x0, y0, x1, y1 } = props.selectionBox;
  const { quadrant, gridSize } = props.mapTransformProps;
  if (x0 && y0 && x1 && y1) {
    const initial = getXYFromQuadrant(round(x0), round(y0), quadrant, gridSize);
    const drag = getXYFromQuadrant(round(x1), round(y1), quadrant, gridSize);
    const x = Math.min(initial.qx, drag.qx);
    const y = Math.min(initial.qy, drag.qy);
    const width = Math.max(initial.qx, drag.qx) - x;
    const height = Math.max(initial.qy, drag.qy) - y;
    return <g id="selection-box">
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        fill="rgba(256,256,256,0.1)"
        stroke="rgba(256,256,256,0.6)"
        strokeWidth={2} />
    </g>;
  } else {
    return <g id="selection-box" />;
  }
}
