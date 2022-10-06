import React from "react";
import { GridProps } from "../interfaces";
import { transformXY, transformForQuadrant } from "../util";
import { Color } from "../../../ui";
import { range, round } from "lodash";

export function Grid(props: GridProps) {
  const { mapTransformProps, zoomLvl } = props;
  const { gridSize, xySwap } = mapTransformProps;
  const gridSizeW = xySwap ? gridSize.y : gridSize.x;
  const gridSizeH = xySwap ? gridSize.x : gridSize.y;
  const origin = transformXY(0, 0, mapTransformProps);
  const arrowEnd = transformXY(25, 25, mapTransformProps);
  const xLabel = transformXY(15, -10, mapTransformProps);
  const yLabel = transformXY(-11, 18, mapTransformProps);
  const strokeWidth = zoomLvl <= 0.5
    ? { minor: 0, major: 3, superior: 6 }
    : { minor: 1, major: 2, superior: 4 };

  /** Map grid axis label step size according to zoom level. */
  const calcAxisStep = (zoomLvl: number) => {
    if (zoomLvl <= 0.2) { return 500; }
    if (zoomLvl <= 0.5) { return 200; }
    return 100;
  };

  /** Distance from map grid extents to label. */
  const calcLabelOffset = (zoomLvl: number) => {
    if (zoomLvl <= 0.2) { return -100; }
    if (zoomLvl >= 1) { return -10; }
    return -20;
  };

  const inverseScale = `scale(${round(1 / zoomLvl, 2)})`;

  const gridLabels = (axis: "x" | "y") => {
    const axisStep = calcAxisStep(zoomLvl);
    const vertical = axis == (xySwap ? "x" : "y");
    const offset = calcLabelOffset(zoomLvl);
    return range(axisStep, gridSize[axis], axisStep)
      .map(position => {
        const location = axis == "y"
          ? transformXY(offset, position, mapTransformProps)
          : transformXY(position, offset, mapTransformProps);
        return (
          <text key={`${axis}-label-${position}`}
            id={`${axis}-label`}
            x={location.qx}
            y={location.qy}
            style={{
              transformOrigin: "center",
              transformBox: "fill-box",
              transform: [
                inverseScale,
                vertical ? "rotate(-90deg)" : "",
              ].join(" "),
            }}>
            {position}
          </text>
        );
      });
  };

  return <g className="drop-area-background" onClick={props.onClick}
    onMouseDown={props.onMouseDown}>
    <defs>
      <pattern id="minor_grid"
        width={10} height={10} patternUnits={"userSpaceOnUse"}>
        <path d={"M10,0 L0,0 L0,10"} strokeWidth={strokeWidth.minor}
          fill={"none"} stroke={"rgba(0, 0, 0, 0.15)"} />
      </pattern>

      <pattern id={"major_grid"}
        width={100} height={100} patternUnits={"userSpaceOnUse"}>
        <path d={"M100,0 L0,0 0,100"} strokeWidth={strokeWidth.major}
          fill={"none"} stroke={"rgba(0, 0, 0, 0.3)"} />
      </pattern>

      <pattern id="superior_grid" width={1000} height={1000}
        patternUnits={"userSpaceOnUse"}>
        <path d={"M1000,0 L0,0 0,1000"} strokeWidth={strokeWidth.superior}
          fill={"none"} stroke={"rgba(0, 0, 0, 0.4)"} />
      </pattern>

      <marker id="arrow"
        markerWidth={10} markerHeight={10} refX={0} refY={2} orient={"auto"}
        markerUnits={"strokeWidth"}>
        <path d={"M0,0 L0,4 L5,2 z"} fill={Color.gridGray} />
      </marker>
    </defs>

    <g id="grid">
      <rect id="minor-grid"
        width={gridSizeW} height={gridSizeH} fill={"url(#minor_grid)"} />
      <rect id="major-grid" transform={transformForQuadrant(mapTransformProps)}
        width={gridSizeW} height={gridSizeH} fill={"url(#major_grid)"} />
      <rect id="superior-grid" transform={transformForQuadrant(mapTransformProps)}
        width={gridSizeW} height={gridSizeH} fill={"url(#superior_grid)"} />
      <rect id="border" width={gridSizeW} height={gridSizeH} fill={"none"}
        stroke={"rgba(0,0,0,0.3)"} strokeWidth={2} />
    </g>

    <g id="origin-marker" transform={inverseScale}>
      <circle cx={origin.qx} cy={origin.qy} r={4} fill={Color.gridGray} />
      <g id={"axis-labels"} fontFamily={"Arial"} fontSize={14}
        textAnchor={"middle"} dominantBaseline={"central"}>
        <text x={xLabel.qx} y={xLabel.qy}>X</text>
        <text x={yLabel.qx} y={yLabel.qy}>Y</text>
      </g>
      <g id="axis-arrows"
        stroke={Color.gridGray} strokeWidth={3} markerEnd={"url(#arrow)"}>
        <line x1={origin.qx} y1={origin.qy} x2={arrowEnd.qx} y2={origin.qy} />
        <line x1={origin.qx} y1={origin.qy} x2={origin.qx} y2={arrowEnd.qy} />
      </g>
    </g>

    <g id="axis-values" fontFamily={"Arial"} fontSize={14} textAnchor={"middle"}
      dominantBaseline={"central"} fill={"rgba(0, 0, 0, 0.3)"} fontWeight={"bold"}
      color={"rgba(0, 0, 0, 0.4)"}>
      {gridLabels("x")}
      {gridLabels("y")}
    </g>
  </g>;
}
