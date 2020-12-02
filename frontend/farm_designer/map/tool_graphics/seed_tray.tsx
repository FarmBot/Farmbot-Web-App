import React from "react";
import { Color } from "../../../ui";
import { ToolColor } from "./all_tools";
import { ToolGraphicProps } from "./interfaces";
import { seedBinGradient } from "./seed_bin";
import { ToolDimensions } from "./tool";

export const SeedTray = (props: ToolGraphicProps) => {
  const { x, y, hovered } = props;
  return <g id={"seed-tray"}>

    <defs id="seed-tray-gradient-and-pattern">
      {seedBinGradient}
      <pattern id="SeedTrayPattern"
        x={0} y={0} width={0.25} height={0.25}>
        <circle cx={6} cy={6} r={5} fill="url(#SeedBinGradient)" />
      </pattern>
    </defs>

    <circle
      cx={x} cy={y} r={ToolDimensions.radius}
      fill={ToolColor.seedTray} fillOpacity={0.8} />
    <rect
      x={x - 25} y={y - 25}
      width={50} height={50}
      fill="url(#SeedTrayPattern)" />
    {hovered &&
      <circle cx={x} cy={y} r={ToolDimensions.radius}
        fill={Color.black} fillOpacity={0.1} />}

  </g>;
};
