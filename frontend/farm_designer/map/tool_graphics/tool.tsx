import React from "react";
import { CustomToolTop } from "../../../tools/custom_tool_graphics";
import { Color } from "../../../ui";
import { ToolGraphicProps } from "./interfaces";

export enum ToolDimensions {
  thickness = 15,
  diameter = 70,
  radius = 35,
}

export const StandardTool = (props: ToolGraphicProps) => {
  const { x, y, hovered } = props;
  return <g id={"tool"}>
    <circle
      cx={x}
      cy={y}
      r={ToolDimensions.radius}
      fillOpacity={0.5}
      fill={hovered ? Color.darkGray : Color.mediumGray} />
    <CustomToolTop x={x} y={y} toolName={props.toolName} />
  </g>;
};

export const EmptySlot = (props: ToolGraphicProps) => {
  const { x, y, hovered } = props;
  return <g id={"empty-tool-slot"}>
    <circle
      cx={x}
      cy={y}
      r={ToolDimensions.radius}
      fillOpacity={0.2}
      fill={hovered ? Color.darkGray : Color.mediumGray} />
    <circle
      cx={x}
      cy={y}
      r={ToolDimensions.radius - 1}
      fill={"none"}
      stroke={Color.mediumGray}
      opacity={0.5}
      strokeWidth={2}
      strokeDasharray={"10 5"} />
  </g>;
};
