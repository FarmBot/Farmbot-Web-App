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
  x: number;
  y: number;
  width: number;
  height: number;
  fill: Color;
  children: string;
  radius?: number;
  caret?: boolean;
  position?: "left" | "right" | "center";
  fontSize?: number;
}

/** For label text background. */
export const TextInRoundedSvgBox = (props: RoundedBoxProps) => {
  const { x, y, width, height, fill, radius } = props;
  const r = radius || 4;
  const upperRightCorner = `a${r},${r} 0 0 1 ${r},${r}`;
  const lowerRightCorner = `a${r},${r} 0 0 1 -${r},${r}`;
  const lowerLeftCorner = `a${r},${r} 0 0 1 -${r},-${r}`;
  const upperLeftCorner = `a${r},${r} 0 0 1 ${r},-${r}`;
  const caretSize = props.caret ? 2 : 0;
  const yOffset = props.caret ? caretSize + 3 : 0;
  const halfWidth = (width - r * 2) / 2 - caretSize;
  const bottomLength = () => {
    switch (props.position || "center") {
      case "left":
        return {
          xOffset: -caretSize,
          textOffset: width / 2 - caretSize - r,
          left: 0,
          right: halfWidth * 2,
        };
      case "right":
        return {
          xOffset: -width + r * 2 + caretSize,
          textOffset: -width / 2 + caretSize + r,
          left: halfWidth * 2,
          right: 0,
        };
      case "center":
        return {
          xOffset: -width / 2 + r,
          textOffset: 0,
          left: halfWidth,
          right: halfWidth,
        };
    }
  };
  const dimensions = bottomLength();
  const caretPath = props.caret
    ? `l-${caretSize},${caretSize} l-${caretSize},-${caretSize}`
    : "";
  return <g id={"label"}>
    <path fill={fill}
      d={trim(`M${x + dimensions.xOffset},${y - yOffset - height / 2 - r / 2}
             h${width - r * 2} ${upperRightCorner}
             v${height - r} ${lowerRightCorner}
             h${-dimensions.right}
             ${caretPath}
             h${-dimensions.left} ${lowerLeftCorner}
             v${-(height - r)} ${upperLeftCorner} z`)} />
    <text fontFamily={"Arial"} fontSize={props.fontSize || 14}
      textAnchor={"middle"} dominantBaseline={"central"}
      fill={Color.white}
      fontWeight={"bold"}
      x={x + dimensions.textOffset} y={y - yOffset}>
      {props.children}
    </text>
  </g>;
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
      opacity={0.9}
      style={generateTransformStyle({ zoomLvl, mapTransformProps, axis })}>
      <TextInRoundedSvgBox x={location.qx} y={location.qy} width={36} height={14}
        fill={fill}>
        {"" + position}
      </TextInRoundedSvgBox>
    </g>;
  });
};
