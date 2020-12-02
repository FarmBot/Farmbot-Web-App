import React from "react";
import { Color } from "../../../ui";
import { GantryToolSlotGraphicProps, ToolGraphicProps } from "./interfaces";

enum Trough {
  width = 20,
  length = 45,
  wall = 4,
}

export const troughSize = (yAxisView: boolean) => ({
  width: Trough.wall + (yAxisView ? Trough.width : Trough.length),
  height: Trough.wall + (yAxisView ? Trough.length : Trough.width),
});

export const GantryToolSlot = (props: GantryToolSlotGraphicProps) => {
  const { x, y, xySwap } = props;
  const slotLength = troughSize(xySwap);
  return <g id={"gantry-toolbay-slot"}>
    <rect
      x={x - slotLength.width / 2} y={y - slotLength.height / 2}
      width={slotLength.width} height={slotLength.height}
      stroke={Color.mediumGray} strokeWidth={Trough.wall} strokeOpacity={0.25}
      fill="transparent" />
  </g>;
};

export const SeedTrough = (props: ToolGraphicProps) => {
  const { x, y, hovered } = props;
  return <g id={"seed-trough"}>
    <rect
      x={x - Trough.width / 2} y={y - Trough.length / 2}
      width={Trough.width} height={Trough.length}
      fillOpacity={0.5}
      fill={hovered ? Color.darkGray : Color.mediumGray} />
  </g>;
};
