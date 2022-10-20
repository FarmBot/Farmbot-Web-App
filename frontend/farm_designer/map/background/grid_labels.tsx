import React from "react";
import { MapTransformProps } from "../interfaces";
import { transformXY } from "../util";
import { Color } from "../../../ui";
import { round } from "lodash";
import { trim } from "../../../util";

/** Map grid axis label step size according to zoom level. */
export const calcAxisLabelStepSize = (zoomLvl: number) => {
  if (zoomLvl <= 0.2) { return 500; }
  if (zoomLvl <= 0.5) { return 200; }
  return 100;
};

interface RoundedBoxProps {
  position: { qx: number, qy: number };
  width: number;
  height: number;
  fill: Color;
}

/** For label text background. */
const RoundedSvgBox = (props: RoundedBoxProps) => {
  const { position, width, height, fill } = props;
  const r = 4;
  return <path fill={fill}
    d={trim(`M${position.qx - width / 2 + r},${position.qy - height / 2 - 1}
             h${width - r * 2} a${r},${r} 0 0 1 ${r},${r}
             v${height - r} a${r},${r} 0 0 1 -${r},${r}
             h${-(width - r * 2)} a${r},${r} 0 0 1 -${r},-${r}
             v${-(height - r)} a${r},${r} 0 0 1 ${r},-${r} z`)} />;
};

export interface GenerateTransformStyleProps {
  axis?: "x" | "y";
  zoomLvl: number;
  mapTransformProps: MapTransformProps;
}

/** Keep items the same size and in the same position throughout zoom levels. */
export const generateTransformStyle = (props: GenerateTransformStyleProps) => {
  const { zoomLvl, mapTransformProps } = props;
  const { quadrant, xySwap } = mapTransformProps;

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

  return transformStyle(props.axis);
};

export interface GridLabelsProps {
  zoomLvl: number;
  mapTransformProps: MapTransformProps;
  axis: "x" | "y",
  positions: number[];
  fill: Color;
}

/** Map grid axis labels. */
export const gridLabels = (props: GridLabelsProps) => {
  const { positions, zoomLvl, mapTransformProps, axis, fill } = props;
  return positions.map(position => {
    const location = axis == "y"
      ? transformXY(0, position, mapTransformProps)
      : transformXY(position, 0, mapTransformProps);
    return <g key={`${axis}-label-${position}`}
      id={`${axis}-label`}
      fontFamily={"Arial"} fontSize={14} textAnchor={"middle"}
      dominantBaseline={"central"} fill={Color.white} fontWeight={"bold"}
      opacity={0.9}
      style={generateTransformStyle({ zoomLvl, mapTransformProps, axis })}>
      <RoundedSvgBox position={location} width={36} height={14} fill={fill} />
      <text x={location.qx} y={location.qy}>
        {position}
      </text>
    </g>;
  });
};
