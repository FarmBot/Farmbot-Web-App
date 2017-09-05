import * as React from "react";

interface CircleProps {
  x: number;
  y: number;
  r: number;
  /** Should it be shown or not? */
  selected: boolean;
  className?: string;
}

export function Circle(props: CircleProps) {
  const { x, y, r, selected } = props;
  const cn = props.className;
  return <circle
    className={"is-chosen-" + !!selected + " " + (cn ? cn : "")}
    cx={x}
    cy={y}
    r={selected ? r*1.2 : 0}
    stroke="rgba(256,256,256,0.75)"
    strokeWidth={selected ? 2 : 0}
    strokeDasharray={selected ? 5 : 0}
    fill="rgba(256,256,256,0.25)"
  />;
}
