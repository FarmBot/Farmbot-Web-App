import React from "react";
import { trim } from "../../../util";
import { Color } from "../../../ui";
import { ToolColor } from "./all_tools";
import { SpecificToolProfileProps, ToolGraphicProps } from "./interfaces";
import { ToolDimensions } from "./tool";

enum WeederDimensions {
  width = 16,
  thickness = 8,
  thicknessAtToolBottom = 6.5,
  length = 38,
}

export const Weeder = (props: ToolGraphicProps) => {
  const { x, y, hovered } = props;
  const width = WeederDimensions.width;
  const height = WeederDimensions.thickness;
  return <g id={"weeder"}>
    <defs id="weeder-gradients">
      <radialGradient id="WeederGradient">
        <stop offset="5%" stopColor={Color.black} stopOpacity={0.4} />
        <stop offset="95%" stopColor={Color.black} stopOpacity={0.2} />
      </radialGradient>
      <linearGradient id="WeederImplementGradient"
        x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor={Color.black} stopOpacity={0.5} />
        <stop offset="50%" stopColor={Color.black} stopOpacity={0.1} />
        <stop offset="100%" stopColor={Color.black} stopOpacity={0.5} />
      </linearGradient>
    </defs>

    <circle cx={x} cy={y} r={ToolDimensions.radius}
      fill={ToolColor.weeder} fillOpacity={0.8} />
    <circle cx={x} cy={y} r={ToolDimensions.radius - 5}
      fill="url(#WeederGradient)" />

    <rect x={x - width / 2} y={y - height / 2} width={width} height={height}
      fill="url(#WeederImplementGradient)" />

    {hovered &&
      <circle cx={x} cy={y} r={ToolDimensions.radius}
        fill={Color.black} fillOpacity={0.1} />}
  </g>;
};

/** Weeder tool implement profile (base not included). */
export const WeederImplementProfile = (props: SpecificToolProfileProps) => {
  const { x, y, sideView } = props;
  const width = WeederDimensions.thickness;
  const length = WeederDimensions.length;
  return <g id={"weeder-implement-profile"}>
    {sideView
      ? <path id={"weeder-side-view"}
        d={trim(`M${x + width / 2} ${y}
          h -${width}
          l ${width / 2} ${length}
          l ${width / 2} -${length}`)}
        fill={Color.darkGray} opacity={0.25} />
      : <line id={"weeder-front-view"} opacity={0.25}
        x1={x} y1={y} x2={x} y2={y + WeederDimensions.length}
        stroke={Color.darkGray} strokeWidth={WeederDimensions.width} />}
  </g>;
};
