import React from "react";
import { trim } from "../../../util";
import { Color } from "../../../ui";
import { ToolColor } from "./all_tools";
import { SpecificToolProfileProps, ToolGraphicProps } from "./interfaces";
import { ToolDimensions } from "./tool";
import { round } from "lodash";

enum SoilSensorDimensions {
  width = 24,
  thickness = 4,
  length = 64,
  spikeLength = 8,
  offset = 2,
  baseLength = 18,
  legWidth = 8,
  gap = 8,
  stripWidth = 8,
  filletRadius = 1.25,
}

export const SoilSensor = (props: ToolGraphicProps) => {
  const { x, y, hovered } = props;
  const width = SoilSensorDimensions.width;
  const pcbWidth = width / 3;
  const height = SoilSensorDimensions.thickness;
  const pcbHeight = height / 4;
  return <g id={"soil-sensor"}>
    <defs id="soil-sensor-gradient-and-pattern">
      <radialGradient id="SoilSensorGradient">
        <stop offset="5%" stopColor={Color.black} stopOpacity={0.4} />
        <stop offset="95%" stopColor={Color.black} stopOpacity={0.2} />
      </radialGradient>
      <pattern id="SoilSensorPattern"
        x={0} y={SoilSensorDimensions.offset} width={1 / 1.5} height={1}>
        <rect x={0} y={0}
          width={pcbWidth} height={pcbHeight}
          fill={ToolColor.soilSensorPCB} fillOpacity={0.9} />
        <rect x={0} y={pcbHeight}
          width={pcbWidth} height={2 * pcbHeight}
          fill={Color.black} fillOpacity={0.8} />
        <rect x={0} y={3 * pcbHeight}
          width={pcbWidth} height={pcbHeight}
          fill={ToolColor.soilSensorPCB} fillOpacity={0.9} />
      </pattern>
    </defs>

    <circle cx={x} cy={y} r={ToolDimensions.radius}
      fill={ToolColor.soilSensor} fillOpacity={0.8} />
    <circle cx={x} cy={y} r={ToolDimensions.radius - 5}
      fill={"url(#SoilSensorGradient)"} />

    <rect x={x - width / 2} y={y - height / 2 + SoilSensorDimensions.offset}
      width={width} height={height}
      fill={Color.black} fillOpacity={0.4} />

    <rect x={x - width / 2} y={y - height / 2 + SoilSensorDimensions.offset}
      width={width} height={height}
      fill="url(#SoilSensorPattern)" />

    {hovered &&
      <circle cx={x} cy={y} r={ToolDimensions.radius}
        fill={Color.black} fillOpacity={0.1} />}
  </g>;
};

/** Soil sensor tool implement profile (base not included). */
export const SoilSensorImplementProfile = (props: SpecificToolProfileProps) => {
  const { x, y, sideView } = props;
  const width = SoilSensorDimensions.width;
  const length = SoilSensorDimensions.length;
  const baseLength = SoilSensorDimensions.baseLength;
  const gap = SoilSensorDimensions.gap;
  const legWidth = SoilSensorDimensions.legWidth;
  const legH = round(legWidth / 3, 2);
  const legV = SoilSensorDimensions.spikeLength;
  const legOffset = (gap + legWidth) / 2;
  const offset = (props.toolFlipped ? -1 : 1) * SoilSensorDimensions.offset;
  const fillet = SoilSensorDimensions.filletRadius;
  return <g id={"soil-sensor-implement-profile"}>
    {sideView
      ? <line id={"soil-sensor-side-view"}
        x1={x + offset} y1={y} x2={x + offset} y2={y + length}
        stroke={Color.darkGray} opacity={0.5}
        strokeWidth={SoilSensorDimensions.thickness} />
      : <g id={"soil-sensor-front-view"}>
        <path
          d={trim(`M${x - width / 2} ${y}
          h ${width}
          v ${baseLength}
          h -${legWidth}
          a ${fillet * 2} ${fillet * 2} 0 0 1 -${fillet} -${fillet}
          h -${gap - fillet * 2}
          a ${fillet * 2} ${fillet * 2} 0 0 1 -${fillet} ${fillet}
          h -${legWidth}
          v -${baseLength}`)}
          fill={Color.darkGray} opacity={0.5} />
        {[x + legOffset, x - legOffset].map(legX =>
          <path key={legX}
            d={trim(`M${legX - legWidth / 2} ${y + baseLength}
          h ${legWidth}
          v ${length - legV - baseLength}
          l -${legH} ${legV}
          h -${legH}
          l -${legH} -${legV}
          v -${length - legV - baseLength}`)}
            fill={ToolColor.soilSensorPCB} opacity={0.9} />)}
      </g>}
  </g>;
};
