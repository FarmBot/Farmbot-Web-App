import React from "react";
import { Color } from "../../../ui";
import { trim } from "../../../util";
import { toolbaySlotAngle } from "../layers/tool_slots/tool_graphics";
import { SlotAxisProfileProps, ToolSlotGraphicProps } from "./interfaces";
import { ToolDimensions } from "./tool";

export enum SlotDimensions {
  slotWidth = 65,
  prongWidth = 18,
  toolOverlap = 1.5,
  filletRadius = 2.5,
  toolToTopBend = 15,
  bendToBend = 55,
  backHeight = 78,
  thickness = 5,
  topViewLength = 150,
  width = 100,
  height = 137,
}

export const ToolbaySlot = (props: ToolSlotGraphicProps) => {
  const { id, x, y, pulloutDirection, quadrant, xySwap } = props;
  const angle = toolbaySlotAngle(pulloutDirection, quadrant, xySwap);
  const width = SlotDimensions.width;
  const length = SlotDimensions.topViewLength;
  const frontLine = SlotDimensions.prongWidth - SlotDimensions.filletRadius;
  const slotRadius = ToolDimensions.radius;
  return <g id={"toolbay-slot"}>
    <defs id="unrotated-tool-slot-source">
      <g id={"toolbay-slot-" + id}
        fillOpacity={0.25}
        fill={Color.mediumGray}>
        <path d={trim(`M${x + 50} ${y + 50}
          h -${length} v -${width} h ${length} v ${frontLine}
          a 5 5 0 0 1 -2.5 2.5
          h -61.5
          a ${slotRadius} ${slotRadius} 0 0 0 0 64
          h 61.5
          a 5 5 0 0 1 2.5 2.5
          z`)} />
      </g>
    </defs>

    <use style={props.occupied ? { pointerEvents: "none" } : {}}
      xlinkHref={"#toolbay-slot-" + id}
      transform={
        `rotate(${angle}, ${x}, ${y})`} />
  </g>;
};

/** Toolbay slot as viewed from the front (or back). */
export const SlotFrontProfile = (props: SlotAxisProfileProps) => {
  const { x, y } = props;
  const toolHeight = props.height;
  const toolWidth = props.width;
  const toolbayY = y + toolHeight / 2;
  const toolbayTop = toolbayY - 5 / 2;
  const thick = SlotDimensions.thickness;
  const toToolBottom = (thick + toolHeight) / 2;
  const slotHeight = SlotDimensions.height;
  const bendHeight = SlotDimensions.bendToBend;
  const slotWidth = SlotDimensions.width;
  const prong = SlotDimensions.prongWidth - SlotDimensions.toolOverlap * 2;
  return <g id={"slot-front-profile"} fill={Color.darkGray} fillOpacity={0.25}>
    {[bendHeight, slotHeight].map(height =>
      <path key={height} d={trim(`M${x - prong} ${toolbayTop}
      h ${prong}
      v ${toToolBottom}
      h ${toolWidth}
      v -${toToolBottom}
      h ${prong}
      v ${height + toToolBottom}
      h -${slotWidth}
      v -${height + toToolBottom}`)} />)}
    <rect x={x - prong} y={toolbayTop} width={prong} height={thick} />
    <rect x={x + toolWidth} y={toolbayTop} width={prong} height={thick} />
  </g>;
};

/** Toolbay slot as viewed from the side. */
export const SlotSideProfile = (props: SlotAxisProfileProps) => {
  const { x, y, mirror } = props;
  const toolHeight = props.height;
  const toolWidth = props.width;
  const toolbayY = y + toolHeight / 2;
  const prong = SlotDimensions.prongWidth - SlotDimensions.toolOverlap * 2;
  const toBend = SlotDimensions.toolToTopBend;
  const bendToBend = SlotDimensions.bendToBend;
  const frontX = x + (mirror ? -prong : toolWidth);
  const pathStartX = mirror ? x + toolWidth : x;
  const sign = mirror ? 1 : -1;
  return <g id={"slot-side-profile"} stroke={Color.darkGray} fill={"none"}
    strokeOpacity={0.25} strokeWidth={5}>
    <line x1={frontX} y1={toolbayY} x2={frontX + prong} y2={toolbayY} />
    <path d={trim(`M${pathStartX} ${toolbayY}
      h ${sign * toBend}
      l ${sign * bendToBend} ${bendToBend}
      v ${SlotDimensions.backHeight}`)} />
  </g>;
};
