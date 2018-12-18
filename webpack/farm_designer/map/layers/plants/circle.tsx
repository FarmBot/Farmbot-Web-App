import * as React from "react";
import { Color } from "../../../../ui";

export interface CircleProps {
  x: number;
  y: number;
  r: number;
  /** Should it be shown or not? */
  selected: boolean;
  className?: string;
}

export function Circle(props: CircleProps) {
  const { x, y, r, selected, className } = props;
  return <circle
    className={`is-chosen-${selected} ${className || ""}`}
    cx={x}
    cy={y}
    r={selected ? r * 1.2 : 0}
    stroke={Color.white}
    strokeOpacity={0.7}
    strokeWidth={selected ? 2 : 0}
    strokeDasharray={selected ? 5 : 0}
    fill={Color.white}
    fillOpacity={0.25}
  />;
}
