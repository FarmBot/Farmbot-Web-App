import React from "react";
import { Color } from "../../../ui";
import { ToolColor } from "./all_tools";
import { ToolGraphicProps } from "./interfaces";
import { ToolDimensions } from "./tool";

export const WateringNozzle = (props: ToolGraphicProps) => {
  const { x, y, hovered, uuid } = props;
  const r = 2;
  const ySpacing = 10;
  const xSpacing = 14;
  return <g id={"watering-nozzle"}>

    <defs id="watering-nozzle-patterns">
      <pattern id={`WateringNozzlePattern1-${uuid}`} patternUnits="userSpaceOnUse"
        x={x - r} y={y - r} width={xSpacing} height={ySpacing}>
        <circle cx={r} cy={r} r={r} fill={Color.black} fillOpacity={0.4} />
      </pattern>
      <pattern id={`WateringNozzlePattern2-${uuid}`} patternUnits="userSpaceOnUse"
        x={x - (xSpacing / 2 + r)} y={y - (ySpacing / 2 + r)}
        width={xSpacing} height={ySpacing}>
        <circle cx={r} cy={r} r={r} fill={Color.black} fillOpacity={0.4} />
      </pattern>
      <pattern id={`WateringNozzlePattern3-${uuid}`} patternUnits="userSpaceOnUse"
        x={x} y={y} width={3 * xSpacing} height={ySpacing}>
        <circle cx={1.5 * xSpacing} cy={ySpacing / 2} r={r}
          fill={Color.black} fillOpacity={0.4} />
      </pattern>
    </defs>

    <circle cx={x} cy={y} r={ToolDimensions.radius} fill={ToolColor.wateringNozzle}
      fillOpacity={0.8} />
    <circle cx={x} cy={y} r={ToolDimensions.radius - 5} fill={Color.black}
      fillOpacity={0.2} />

    <rect
      x={x - (xSpacing + r)} y={y - (2 * ySpacing + r)}
      width={2 * (xSpacing + r)} height={2 * (2 * ySpacing + r)}
      fill={`url(#WateringNozzlePattern1-${uuid})`} />
    <rect
      x={x - (xSpacing / 2 + r)} y={y - (1.5 * ySpacing + r)}
      width={2 * (xSpacing / 2 + r)} height={2 * (1.5 * ySpacing + r)}
      fill={`url(#WateringNozzlePattern2-${uuid})`} />
    <rect
      x={x - (1.5 * xSpacing + r)} y={y - (ySpacing / 2 + r)}
      width={2 * (1.5 * xSpacing + r)} height={2 * (ySpacing / 2 + r)}
      fill={`url(#WateringNozzlePattern3-${uuid})`} />

    {hovered &&
      <circle cx={x} cy={y} r={ToolDimensions.radius}
        fill={Color.black} fillOpacity={0.1} />}

  </g>;
};
