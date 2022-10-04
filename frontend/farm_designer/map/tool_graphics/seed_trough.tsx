import React from "react";
import { Color } from "../../../ui";
import { trim } from "../../../util";
import { GantryToolSlotGraphicProps, ToolGraphicProps } from "./interfaces";

enum Trough {
  width = 19.5,
  length = 44.5,
  wall = 3,
  tabWidth = 9.5,
  tabLength = 15,
  tabRadius = 2.5,
  bottomPosition = 14,
  height = 15,
  thickness = 2.5,
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

const seedTroughGradient =
  <linearGradient id="SeedTroughGradient" gradientTransform="rotate(90)">
    <stop offset="0%" stopColor={Color.black} stopOpacity={0.1} />
    <stop offset="66%" stopColor={Color.black} stopOpacity={0.75} />
    <stop offset="100%" stopColor={Color.black} stopOpacity={0.1} />
  </linearGradient>;

export const SeedTrough = (props: ToolGraphicProps) => {
  const { x, y, hovered } = props;
  return <g id={"seed-trough"}>
    <path fillOpacity={0.5}
      fill={hovered ? Color.darkGray : Color.mediumGray}
      d={trim(`M${x - Trough.width / 2} ${y - Trough.length / 2}
        h ${Trough.width}
        v ${Trough.length}
        h -5
        v ${Trough.tabLength - 1}
        q 0 1, -1 1
        h -${Trough.tabWidth - 2}
        q -1 0, -1 -1
        v -${Trough.tabLength - 1}
        h -5
        v -${Trough.length}`)} />

    <defs id="seed-trough-gradient">
      {seedTroughGradient}
    </defs>

    <rect
      x={x - Trough.width / 2 + Trough.wall}
      y={y - Trough.length / 2 + Trough.wall}
      width={Trough.width - Trough.wall * 2}
      height={Trough.length - Trough.wall * 2}
      strokeWidth={0.25} stroke={Color.mediumGray}
      fillOpacity={0.5} fill={"url(#SeedTroughGradient)"} />
  </g>;
};
