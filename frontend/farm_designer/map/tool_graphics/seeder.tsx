import React from "react";
import { trim } from "../../../util";
import { Color } from "../../../ui";
import { ToolColor } from "./all_tools";
import { SpecificToolProfileProps, ToolGraphicProps } from "./interfaces";
import { ToolDimensions } from "./tool";

enum SeederDimensions {
  adapterRadius = 5.5,
  adapterLength = 8,
  needleBaseLength = 16,
  needleRadius = 2,
  needleLength = 38,
  offset = 17.5,
}

export const Seeder = (props: ToolGraphicProps) => {
  const { x, y, hovered } = props;
  return <g id={"seeder"}>
    <defs id="seeder-gradient">
      <radialGradient id="SeederGradient">
        <stop offset="5%" stopColor={Color.black} stopOpacity={0.25} />
        <stop offset="95%" stopColor={Color.black} stopOpacity={0.15} />
      </radialGradient>
    </defs>

    <circle cx={x} cy={y} r={ToolDimensions.radius}
      fill={ToolColor.seeder} fillOpacity={0.7} />
    <circle cx={x} cy={y} r={ToolDimensions.radius - 5}
      fill="url(#SeederGradient)" />
    <circle cx={x} cy={y + SeederDimensions.offset}
      r={SeederDimensions.adapterRadius}
      fill={Color.black} fillOpacity={0.25} />
    <circle cx={x} cy={y + SeederDimensions.offset}
      r={SeederDimensions.needleRadius}
      fill={Color.black} fillOpacity={0.3} />

    {hovered &&
      <circle cx={x} cy={y} r={ToolDimensions.radius}
        fill={Color.black} fillOpacity={0.1} />}
  </g>;
};

/** Seeder tool implement profile (base not included). */
export const SeederImplementProfile = (props: SpecificToolProfileProps) => {
  const { x, y, sideView } = props;
  const offsetDistance = sideView ? SeederDimensions.offset : 0;
  const offset = (props.toolFlipped ? -1 : 1) * offsetDistance;
  const adapterR = SeederDimensions.adapterRadius;
  const needleBaseY = y + SeederDimensions.adapterLength;
  const baseLength = SeederDimensions.needleBaseLength;
  const needleY = needleBaseY + baseLength;
  const needleR = SeederDimensions.needleRadius;
  return <g id={"seeder-implement-profile"}>
    <line id={"adapter"} x1={x + offset} y1={y} x2={x + offset} y2={needleBaseY}
      stroke={Color.darkGray} strokeWidth={adapterR * 2} opacity={0.5} />
    <path id={"needle-base"} fill={Color.darkGray} opacity={0.5}
      d={trim(`M${x + offset - adapterR} ${needleBaseY}
      h ${adapterR * 2}
      l -${adapterR - needleR} ${baseLength}
      h -${needleR * 2}
      l -${adapterR - needleR} -${baseLength}`)} />
    <line id={"needle"} x1={x + offset} y1={needleY} x2={x + offset}
      y2={needleY + SeederDimensions.needleLength}
      stroke={Color.darkGray} strokeWidth={needleR} opacity={0.5} />
  </g>;
};
