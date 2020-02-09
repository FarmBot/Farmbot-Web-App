import * as React from "react";
import { GridProps } from "../interfaces";
import { transformXY, transformForQuadrant } from "../util";
import { Color } from "../../../ui/index";
import { range } from "lodash";

export function Grid(props: GridProps) {
  const { mapTransformProps, zoomLvl } = props;
  const { gridSize, xySwap } = mapTransformProps;
  const gridSizeW = xySwap ? gridSize.y : gridSize.x;
  const gridSizeH = xySwap ? gridSize.x : gridSize.y;
  const origin = transformXY(0, 0, mapTransformProps);
  const arrowEnd = transformXY(25, 25, mapTransformProps);
  const xLabel = transformXY(15, -10, mapTransformProps);
  const yLabel = transformXY(-11, 18, mapTransformProps);
  const minorStrokeWidth = zoomLvl <= 0.5 ? "0" : "1";
  const majorStrokeWidth = zoomLvl <= 0.5 ? "3" : "2";
  const superiorStrokeWidth = zoomLvl <= 0.5 ? "6" : "4";

  // Start axis-values controls
  // TODO: Create helper to regroup code and clean grid.tsx
  // Text transform:scale value
  const axisTransformValue = zoomLvl <= 1 ? 2 - zoomLvl : 1;
  // Start and increment steps to visualize in grid
  let axisStep = 0;
  if (zoomLvl > 0.5) {
    axisStep = 100;
  } else if (zoomLvl <= 0.2) {
    axisStep = 500;
  } else if (zoomLvl <= 0.5) {
    axisStep = 200;
  }
  // End axis-values controls

  return <g className="drop-area-background" onClick={props.onClick}
    onMouseDown={props.onMouseDown}>
    <defs>
      <pattern id="minor_grid"
        width={10} height={10} patternUnits="userSpaceOnUse">
        <path d="M10,0 L0,0 L0,10" strokeWidth={minorStrokeWidth}
          fill="none" stroke="rgba(0, 0, 0, 0.15)" />
      </pattern>

      <pattern id={"major_grid"}
        width={100} height={100} patternUnits="userSpaceOnUse">
        <path d="M100,0 L0,0 0,100" strokeWidth={majorStrokeWidth}
          fill="none" stroke="rgba(0, 0, 0, 0.3)" />
      </pattern>

      <pattern id="superior_grid" width={1000} height={1000} patternUnits="userSpaceOnUse">
        <path d="M1000,0 L0,0 0,1000" strokeWidth={superiorStrokeWidth}
              fill="none" stroke="rgba(0, 0, 0, 0.4)" />
      </pattern>

      <marker id="arrow"
        markerWidth={10} markerHeight={10} refX={0} refY={2} orient="auto"
        markerUnits="strokeWidth">
        <path d="M0,0 L0,4 L5,2 z" fill={Color.gridGray} />
      </marker>
    </defs>

    <g id="grid">
      <rect id="minor-grid"
        width={gridSizeW} height={gridSizeH} fill="url(#minor_grid)" />
      <rect id="major-grid" transform={transformForQuadrant(mapTransformProps)}
        width={gridSizeW} height={gridSizeH} fill="url(#major_grid)" />
      <rect id="superior-grid" transform={transformForQuadrant(mapTransformProps)}
            width={gridSizeW} height={gridSizeH} fill="url(#superior_grid)" />
      <rect id="border" width={gridSizeW} height={gridSizeH} fill="none"
        stroke="rgba(0,0,0,0.3)" strokeWidth={2} />
    </g>

    <g id="origin-marker">
      <circle cx={origin.qx} cy={origin.qy} r={4} fill={Color.gridGray} />
      <g id="axis-labels" fontFamily="Arial" fontSize="10"
        textAnchor="middle" dominantBaseline="central">
        <text x={xLabel.qx} y={xLabel.qy}>X</text>
        <text x={yLabel.qx} y={yLabel.qy}>Y</text>
      </g>
      <g id="axis-arrows"
        stroke={Color.gridGray} strokeWidth="3" markerEnd="url(#arrow)">
        <line x1={origin.qx} y1={origin.qy} x2={arrowEnd.qx} y2={origin.qy} />
        <line x1={origin.qx} y1={origin.qy} x2={origin.qx} y2={arrowEnd.qy} />
      </g>
    </g>

    <g id="axis-values" fontFamily="Arial" fontSize="10"
      textAnchor="middle" dominantBaseline="central" fill="rgba(0, 0, 0, 0.3)">
      {range(axisStep, gridSize.x, axisStep).map((i) => {
        const location = transformXY(i, -10, mapTransformProps);
        return (
          <text key={"x-label-" + i}
                fontSize="16"
                fontWeight="bold"
                className="x-label"
                color="rgba(0, 0, 0, 0.4)"
                x={location.qx}
                y={location.qy}
                style={{transformOrigin: "center", transformBox: "fill-box", transform: `scale(${axisTransformValue})`}}>
            {i}
          </text>
        );

      })}
      {range(100, gridSize.y, 100).map((i) => {
        const location = transformXY(-15, i, mapTransformProps);
        return <text key={"y-label-" + i}
          x={location.qx} y={location.qy}>{i}</text>;
      })}
    </g>
  </g>;
}
