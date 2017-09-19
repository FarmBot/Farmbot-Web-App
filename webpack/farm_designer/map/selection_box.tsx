import * as React from "react";

export type SelectionBoxData =
  Record<"x0" | "y0" | "x1" | "y1", number | undefined>;

export interface SelectionBoxProps {
  selectionBox: SelectionBoxData
}

export function SelectionBox(props: SelectionBoxProps) {
  const { x0, y0, x1, y1 } = props.selectionBox;
  if (x0 && y0 && x1 && y1) {
    const x = Math.min(x0, x1);
    const y = Math.min(y0, y1);
    const width = Math.max(x0, x1) - x;
    const height = Math.max(y0, y1) - y;
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
