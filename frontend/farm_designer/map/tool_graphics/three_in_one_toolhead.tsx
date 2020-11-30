import React from "react";
import { toolbaySlotAngle } from "../layers/tool_slots/tool_graphics";
import { ThreeInOneToolHeadProps } from "./interfaces";

export const ThreeInOneToolHead = (props: ThreeInOneToolHeadProps) => {
  const { pulloutDirection } = props;
  const { quadrant, xySwap } = props.toolTransformProps;
  const angle = toolbaySlotAngle(pulloutDirection, quadrant, xySwap);
  return <g id="three-in-one-tool-head">
    <defs id="tool-head-defs">
      <g id="unrotated-tool-head">
        <circle
          cx={props.x}
          cy={props.y}
          r={25}
          fillOpacity={0.5}
          fill={props.color} />
        <circle
          cx={props.x}
          cy={props.y + 10}
          r={8}
          fill={props.color}
          fillOpacity={0.25} />
        <circle
          cx={props.x}
          cy={props.y - 10}
          r={5}
          fill={props.color}
          fillOpacity={0.25} />
        <circle
          cx={props.x}
          cy={props.y - 10}
          r={2}
          fill={props.color}
          fillOpacity={0.3} />
      </g>
    </defs>

    <use xlinkHref={"#unrotated-tool-head"}
      transform={`rotate(${angle - 90}, ${props.x}, ${props.y})`} />
  </g>;
};
