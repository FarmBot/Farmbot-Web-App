import React from "react";
import { GridProps } from "../interfaces";
import { transformXY, transformForQuadrant } from "../util";
import { Color } from "../../../ui";
import { range, round } from "lodash";
import { trim } from "../../../util";

export function Grid(props: GridProps) {
  const { mapTransformProps, zoomLvl } = props;
  const { gridSize, xySwap, quadrant } = mapTransformProps;
  const gridSizeW = xySwap ? gridSize.y : gridSize.x;
  const gridSizeH = xySwap ? gridSize.x : gridSize.y;
  const origin = transformXY(0, 0, mapTransformProps);
  const arrowEnd = transformXY(20, 20, mapTransformProps);
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

  /** Determine if an axis is displayed vertically on the page. */
  const isVertical = (axis: "x" | "y" | undefined) => axis == (xySwap ? "x" : "y");

  /** Determine transform origin based on axis and quadrant. */
  const calcTransformOrigin = (axis: "x" | "y" | undefined) => {
    if (!axis) { return "center"; }
    switch (quadrant) {
      case 1: return isVertical(axis) ? "top" : "bottom";
      case 2: return "bottom";
      case 3: return isVertical(axis) ? "bottom" : "top";
      case 4: return "top";
    }
  };

  /** Determine final translation transformation based on axis and quadrant. */
  const calcTransformTranslation = (axis: "x" | "y" | undefined) => {
    if (!axis) { return ""; }
    if (isVertical(axis)) {
      return [2, 3].includes(quadrant)
        ? "translate(-5px, -50%)"
        : "translate(5px, 50%)";
    }
    return [1, 2].includes(quadrant)
      ? "translate(0, -15px)"
      : "translate(0, 15px)";
  };

  /** Use quadrant and rotation to keep items the same through zoom levels. */
  const transformStyle = (axis?: "x" | "y"): React.CSSProperties => {
    const inverseScale = `scale(${round(1 / zoomLvl, 2)})`;
    return {
      transformOrigin: calcTransformOrigin(axis),
      transformBox: "fill-box",
      transform: [
        calcTransformTranslation(axis),
        isVertical(axis) ? "rotate(-90deg)" : "",
        inverseScale,
      ].filter(x => x).join(" "),
      transition: "transform 0.2s",
    };
  };

  const gridLabels = (axis: "x" | "y") => {
    const axisStep = calcAxisStep(zoomLvl);
    return range(axisStep, gridSize[axis], axisStep)
      .map(position => {
        const location = axis == "y"
          ? transformXY(0, position, mapTransformProps)
          : transformXY(position, 0, mapTransformProps);
        return (
          <g key={`${axis}-label-${position}`}
            id={`${axis}-label`}
            style={transformStyle(axis)}>
            <RoundedSvgBox position={location} width={40} height={16} />
            <text x={location.qx} y={location.qy}>
              {position}
            </text>
          </g>
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
        <path d={"M0,0 L0,4 L5,2 z"} fill={Color.darkGray} />
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

    <g id="origin-marker" style={transformStyle()}>
      <circle cx={origin.qx} cy={origin.qy} r={4} fill={Color.darkGray} />
      <g id={"axis-labels"} fontFamily={"Arial"} fontSize={14} fill={Color.darkGray}
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

    <g id="axis-values" fontFamily={"Arial"} fontSize={14} textAnchor={"middle"}
      dominantBaseline={"central"} fill={Color.offWhite} fontWeight={"bold"}>
      {gridLabels("x")}
      {gridLabels("y")}
    </g>
  </g>;
}

interface RoundedBoxProps {
  position: { qx: number, qy: number };
  width: number;
  height: number;
}

const RoundedSvgBox = (props: RoundedBoxProps) => {
  const { position, width, height } = props;
  const r = 4;
  const fill = Color.mediumGray;
  return <path fill={fill}
    d={trim(`M${position.qx - width / 2 + r},${position.qy - height / 2 - 1}
             h${width - r * 2} a${r},${r} 0 0 1 ${r},${r}
             v${height - r} a${r},${r} 0 0 1 -${r},${r}
             h${-(width - r * 2)} a${r},${r} 0 0 1 -${r},-${r}
             v${-(height - r)} a${r},${r} 0 0 1 ${r},-${r} z`)} />;
};
