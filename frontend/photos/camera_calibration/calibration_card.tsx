import React from "react";
import { range } from "lodash";
import { Color } from "../../ui";

export const CALIBRATION_CARD_WIDTH = 177;
export const CALIBRATION_CARD_HEIGHT = 127;
const CALIBRATION_CARD_SCALE = 3;

export interface CalibrationCardCircleData {
  x: number;
  y: number;
  radius: number;
  color: string;
}

export interface CalibrationCardLineData {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  width: number;
  color: string;
}

export const CALIBRATION_CARD_FRONT_CIRCLES: CalibrationCardCircleData[] = [
  { x: 17, y: 64, radius: 5, color: Color.red },
  { x: 117, y: 64, radius: 5, color: Color.red },
  { x: 66, y: 64, radius: 4, color: Color.offWhite },
  { x: 117, y: 14, radius: 4, color: Color.offWhite },
];

export const CALIBRATION_CARD_FRONT_LINES: CalibrationCardLineData[] = [
  { x1: 66, y1: 23, x2: 66, y2: 49, width: 1, color: Color.white },
  { x1: 66, y1: 79, x2: 66, y2: 105, width: 1, color: Color.white },
  { x1: 26, y1: 64, x2: 52, y2: 64, width: 1, color: Color.white },
  { x1: 81, y1: 64, x2: 108, y2: 64, width: 1, color: Color.white },
  { x1: 163, y1: 8, x2: 163, y2: 118, width: 6, color: Color.lightGray },
  { x1: 136, y1: 8, x2: 136, y2: 118, width: 3, color: Color.lightGray },
  { x1: 146, y1: 17, x2: 146, y2: 111, width: 3, color: Color.lightGray },
];

const GRID_DOT_RADIUS = 6;
const GRID_DOT_SPACING = 30;

export const CALIBRATION_CARD_GRID_DOTS: CalibrationCardCircleData[] = [
  ...range(4).flatMap(row => range(5).map(column => ({
    x: 21 + column * GRID_DOT_SPACING,
    y: 18 + row * GRID_DOT_SPACING,
    radius: GRID_DOT_RADIUS,
    color: Color.white,
  }))),
  ...range(3).flatMap(row => range(5).map(column => ({
    x: 36 + column * GRID_DOT_SPACING,
    y: 33 + row * GRID_DOT_SPACING,
    radius: GRID_DOT_RADIUS,
    color: Color.white,
  }))),
];

export const CalibrationCardSVG = (props: { grid: boolean }) =>
  <svg viewBox={`0 0 ${CALIBRATION_CARD_WIDTH} ${CALIBRATION_CARD_HEIGHT}`}
    width={`${CALIBRATION_CARD_WIDTH / CALIBRATION_CARD_SCALE}px`}
    height={`${CALIBRATION_CARD_HEIGHT / CALIBRATION_CARD_SCALE}px`}>
    {props.grid ? <CardBack /> : <CardFront />}
  </svg>;

const CardFront = () =>
  <g id={"front"}>
    {CALIBRATION_CARD_FRONT_CIRCLES.map((circle, index) =>
      <circle key={index}
        cx={circle.x}
        cy={circle.y}
        r={circle.radius}
        fill={circle.color} />)}
    <circle cx={66} cy={64} r={9}
      fill={"none"} stroke={"cyan"} strokeWidth={2} />
    {CALIBRATION_CARD_FRONT_LINES.map((line, index) =>
      <line key={index}
        x1={line.x1}
        y1={line.y1}
        x2={line.x2}
        y2={line.y2}
        stroke={line.color}
        strokeWidth={line.width} />)}
  </g>;

const CardBack = () =>
  <g id={"back"}>
    {CALIBRATION_CARD_GRID_DOTS.map((circle, index) =>
      <circle key={index}
        cx={circle.x}
        cy={circle.y}
        r={circle.radius}
        fill={circle.color} />)}
  </g>;
