import React from "react";

interface SpinnerProps {
  /** Radius of the spinner in pixels. */
  radius?: number;
  strokeWidth?: number;
  wobble?: number;
}

export function Spinner(props: SpinnerProps) {
  const radius = props.radius || 10;
  const strokeWidth = props.strokeWidth || 3;
  const wobble = props.wobble || 0.5;
  return <div className="spinner-container">
    <svg className="spinner"
      width={`${radius * 2}px`}
      height={`${radius * 2}px`}
      viewBox={`0 0 ${(radius * 2) + wobble} ${(radius * 2) + wobble}`}
      xmlns="http://www.w3.org/2000/svg">
      <circle
        className="spinner-path"
        fill="none"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        cx={radius}
        cy={radius}
        r={radius - (radius / 5)}>
      </circle>
    </svg>
  </div>;
}
