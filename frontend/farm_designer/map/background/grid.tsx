import React from "react";
import { GridProps } from "../interfaces";
import { transformXY, transformForQuadrant, getMapSize } from "../util";
import { Color } from "../../../ui";
import { range } from "lodash";
import {
  calcAxisLabelStepSize, generateTransformStyle, gridLabels,
} from "./grid_labels";

export const Grid = (props: GridProps) => {
  const { mapTransformProps, zoomLvl } = props;
  const gridSize = getMapSize(mapTransformProps);
  const origin = transformXY(0, 0, mapTransformProps);
  const arrowEnd = transformXY(20, 20, mapTransformProps);
  const xLabel = transformXY(15, -10, mapTransformProps);
  const yLabel = transformXY(-11, 18, mapTransformProps);
  const strokeWidth = zoomLvl <= 0.5
    ? { minor: 0, major: 3, superior: 6 }
    : { minor: 1, major: 2, superior: 4 };
  const gridTransform = transformForQuadrant(mapTransformProps);
  const labelStep = calcAxisLabelStepSize(zoomLvl);
  const commonProps = { zoomLvl, mapTransformProps };

  return <g className="drop-area-background"
    onClick={props.onClick}
    onMouseDown={props.onMouseDown}>

    <defs>
      <pattern id="minor_grid"
        width={10} height={10} patternUnits={"userSpaceOnUse"}>
        <path d={"M10,0 L0,0 L0,10"} strokeWidth={strokeWidth.minor}
          fill={"none"} stroke={"rgba(0, 0, 0, 0.15)"} />
      </pattern>

      <pattern id="major_grid"
        width={100} height={100} patternUnits={"userSpaceOnUse"}>
        <path d={"M100,0 L0,0 0,100"} strokeWidth={strokeWidth.major}
          fill={"none"} stroke={"rgba(0, 0, 0, 0.3)"} />
      </pattern>

      <pattern id="superior_grid"
        width={1000} height={1000} patternUnits={"userSpaceOnUse"}>
        <path d={"M1000,0 L0,0 0,1000"} strokeWidth={strokeWidth.superior}
          fill={"none"} stroke={"rgba(0, 0, 0, 0.4)"} />
      </pattern>

      <marker id="arrow"
        markerWidth={10} markerHeight={10} refX={0} refY={2} orient={"auto"}
        markerUnits={"strokeWidth"}>
        <path d={"M0,0 L0,4 L5,2 z"} fill={Color.darkGray} />
      </marker>
    </defs>

    <g id="grid">
      <rect id="minor-grid"
        width={gridSize.w} height={gridSize.h} fill={"url(#minor_grid)"} />
      <rect id="major-grid" transform={gridTransform}
        width={gridSize.w} height={gridSize.h} fill={"url(#major_grid)"} />
      <rect id="superior-grid" transform={gridTransform}
        width={gridSize.w} height={gridSize.h} fill={"url(#superior_grid)"} />
      <rect id="border" width={gridSize.w} height={gridSize.h} fill={"none"}
        stroke={"rgba(0,0,0,0.3)"} strokeWidth={2} />
    </g>

    <g id="origin-marker" style={generateTransformStyle(commonProps)}>
      <circle cx={origin.qx} cy={origin.qy} r={4} fill={Color.darkGray} />
      <g id={"axis-labels"}
        fontFamily={"Arial"} fontSize={14} fill={Color.darkGray}
        textAnchor={"middle"} dominantBaseline={"central"} fontWeight={"bold"}>
        <text x={xLabel.qx} y={xLabel.qy}>X</text>
        <text x={yLabel.qx} y={yLabel.qy}>Y</text>
      </g>
      <g id="axis-arrows"
        stroke={Color.darkGray} strokeWidth={3} markerEnd={"url(#arrow)"}>
        <line x1={origin.qx} y1={origin.qy} x2={arrowEnd.qx} y2={origin.qy} />
        <line x1={origin.qx} y1={origin.qy} x2={origin.qx} y2={arrowEnd.qy} />
      </g>
    </g>

    <g id="axis-values">
      {gridLabels({
        axis: "x",
        positions: range(labelStep, mapTransformProps.gridSize.x, labelStep),
        fill: props.templateView ? Color.mediumGray : Color.labelBackground,
        ...commonProps,
      })}
      {gridLabels({
        axis: "y",
        positions: range(labelStep, mapTransformProps.gridSize.y, labelStep),
        fill: props.templateView ? Color.mediumGray : Color.labelBackground,
        ...commonProps,
      })}
    </g>
  </g>;
};
