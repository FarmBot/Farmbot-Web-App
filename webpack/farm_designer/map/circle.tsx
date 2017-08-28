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
    r={selected ? r : 0}
    stroke="green"
    strokeWidth={selected ? 4 : 0}
    strokeDasharray={selected ? 8 : 0}
    fill="none"
  />;
}
