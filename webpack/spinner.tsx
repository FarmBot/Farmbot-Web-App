import * as React from "react";

interface SpinnerProps {
  /** Radius of the spinner in pixels. */
  radius: number;
  strokeWidth: number;
}

// TODO: Keep accurate proportions when scaling up or down
export function Spinner(props: SpinnerProps) {
  let { radius, strokeWidth } = props;
  return <div className="spinner-container">
    <svg className="spinner"
      width={`${radius * 2}px`}
      height={`${radius * 2}px`}
      viewBox={`0 0 ${(radius * 2) + 1} ${(radius * 2) + 1}`}
      xmlns="http://www.w3.org/2000/svg">
      <circle
        className="spinner-path"
        fill="none"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        cx={radius}
        cy={radius}
        r={radius - (radius / 10)}>
      </circle>
    </svg>
  </div>;
}
