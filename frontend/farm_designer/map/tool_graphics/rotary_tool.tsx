import React from "react";
import { trim } from "../../../util";
import { Color } from "../../../ui";
import { ToolColor } from "./all_tools";
import { SpecificToolProfileProps, ToolGraphicProps } from "./interfaces";
import { ToolDimensions } from "./tool";

enum RotaryToolDimensions {
  motorRadius = 20,
  motorHeight = 30,
  spindleRadius = 5,
  spindleHeight = 15,
  cutterRadius = 30,
  cutterThickness = 5,
}

export const RotaryTool = (props: ToolGraphicProps) => {
  const { x, y, hovered } = props;
  return <g id={"rotary-tool"}>
    <circle cx={x} cy={y} r={ToolDimensions.radius}
      fill={ToolColor.rotaryTool} fillOpacity={0.8} />
    <circle cx={x} cy={y} r={RotaryToolDimensions.motorRadius}
      fill={Color.gray} fillOpacity={0.8} />
    <circle cx={x} cy={y} r={RotaryToolDimensions.spindleRadius}
      fill={Color.darkGray} fillOpacity={0.8} />
    <rect x={x - RotaryToolDimensions.cutterRadius}
      y={y - RotaryToolDimensions.cutterThickness / 2}
      width={RotaryToolDimensions.cutterRadius * 2}
      height={RotaryToolDimensions.cutterThickness}
      fill={Color.darkGray} />
    {hovered &&
      <circle cx={x} cy={y} r={ToolDimensions.radius}
        fill={Color.black} fillOpacity={0.1} />}
  </g>;
};

/** Rotary tool implement profile (base not included). */
export const RotaryToolImplementProfile = (props: SpecificToolProfileProps) => {
  const { x, y, sideView } = props;
  const motorR = RotaryToolDimensions.motorRadius;
  const motorV = RotaryToolDimensions.motorHeight;
  const spindleR = RotaryToolDimensions.spindleRadius;
  const spindleV = RotaryToolDimensions.spindleHeight;
  const cutterR = RotaryToolDimensions.cutterRadius;
  const cutterV = RotaryToolDimensions.cutterThickness;
  return <g id={"rotary-tool-implement-profile"}>
    {sideView
      ? <path id={"rotary-tool-side-view"}
        d={trim(`M${x + motorR} ${y}
                 v ${motorV} h -${motorR - spindleR}
                 v ${spindleV} h ${cutterR - spindleR} v ${cutterV}
                 h -${cutterR * 2}
                 v -${cutterV} h ${cutterR - spindleR} v -${spindleV}
                 h -${motorR - spindleR} v -${motorV}`)}
        fill={Color.darkGray} opacity={0.25} />
      : <path id={"rotary-tool-front-view"}
        d={trim(`M${x + motorR} ${y}
                 v ${motorV} h -${motorR - spindleR}
                 v ${spindleV} h ${cutterR - spindleR} v ${cutterV}
                 h -${cutterR * 2}
                 v -${cutterV} h ${cutterR - spindleR} v -${spindleV}
                 h -${motorR - spindleR} v -${motorV}`)}
        fill={Color.darkGray} opacity={0.25} />}
  </g>;
};
