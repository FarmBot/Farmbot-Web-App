import React from "react";
import { trim } from "../../../util";
import { Color } from "../../../ui";
import { ToolColor } from "./all_tools";
import { SpecificToolProfileProps, ToolGraphicProps } from "./interfaces";
import { ToolDimensions } from "./tool";

export const seedBinGradient =
  <radialGradient id="SeedBinGradient">
    <stop offset="5%" stopColor={Color.black} stopOpacity={0.3} />
    <stop offset="95%" stopColor={Color.black} stopOpacity={0.1} />
  </radialGradient>;

enum SeedBinDimensions {
  height = 27.5,
  /** fillet */
  bottomHeight = 5,
  /** at start of fillet */
  bottomDiameter = 22.5,
}

export const SeedBin = (props: ToolGraphicProps) => {
  const { x, y, hovered } = props;
  return <g id={"seed-bin"}>

    <defs id="seed-bin-gradient">
      {seedBinGradient}
    </defs>

    <circle
      cx={x} cy={y} r={ToolDimensions.radius}
      fill={ToolColor.seedBin} fillOpacity={0.8} />
    <circle
      cx={x} cy={y} r={ToolDimensions.radius - 5}
      fill="url(#SeedBinGradient)" />
    {hovered &&
      <circle cx={x} cy={y} r={ToolDimensions.radius}
        fill={Color.black} fillOpacity={0.1} />}

  </g>;
};

/** Seed bin implement profile (base not included). */
export const SeedBinImplementProfile = (props: SpecificToolProfileProps) => {
  const { x, y } = props;
  const toolWidth = ToolDimensions.diameter;
  const binHeight = SeedBinDimensions.height;
  const bottomHeight = SeedBinDimensions.bottomHeight;
  const bottomDia = SeedBinDimensions.bottomDiameter;
  const binSide = (toolWidth - bottomDia) / 2;
  return <g id={"seed-bin-implement-profile"}>
    <path id={"seed-bin-profile"} opacity={0.25}
      d={trim(`M${x - toolWidth / 2} ${y}
        h ${toolWidth}
        l -${binSide} ${binHeight - bottomHeight}
        a ${bottomDia} ${bottomDia} 0 0 1 -${bottomDia} 0
        l -${binSide} -${binHeight - bottomHeight}`)}
      fill={Color.darkGray} />
  </g>;
};
