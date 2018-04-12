import { BotOriginQuadrant, isBotOriginQuadrant } from "../interfaces";
import { McuParams } from "farmbot";
import { StepsPerMmXY } from "../../devices/interfaces";
import { CheckedAxisLength, AxisNumberProperty, BotSize } from "./interfaces";
import { trim } from "../../util";

const SNAP = 10;

/**
 * Used for snapping.
 * Rounds units to nearest 10 (or whatever SNAP is set to).
 */
export function round(num: number) {
  return (Math.round(num / SNAP) * SNAP);
}

export interface ScreenToGardenParams {
  quadrant: BotOriginQuadrant;
  pageX: number;
  pageY: number;
  zoomLvl: number;
  gridSize: AxisNumberProperty;
}

export function translateScreenToGarden(params: ScreenToGardenParams) {
  const { pageX, pageY, zoomLvl, quadrant, gridSize } = params;

  const rawX = round((pageX - 320) / zoomLvl);
  const rawY = round((pageY - 110) / zoomLvl);

  const x = calculateXBasedOnQuadrant({ value: rawX, quadrant, gridAxisLength: gridSize.x });
  const y = calculateYBasedOnQuadrant({ value: rawY, quadrant, gridAxisLength: gridSize.y });

  return { x, y };
}

interface CalculateQuadrantParams {
  value: number;
  quadrant: BotOriginQuadrant;
  gridAxisLength: number;
}

function calculateXBasedOnQuadrant(params: CalculateQuadrantParams) {
  const { value, quadrant, gridAxisLength } = params;
  if (isBotOriginQuadrant(quadrant)) {
    switch (quadrant) {
      case 1:
      case 4:
        return gridAxisLength - value;
      case 2:
      case 3:
        return value;
      default:
        throw new Error("Something went wrong calculating the X origin.");
    }
  } else {
    throw new Error("Invalid bot origin quadrant.");
  }
}

function calculateYBasedOnQuadrant(params: CalculateQuadrantParams) {
  const { value, quadrant, gridAxisLength } = params;
  if (isBotOriginQuadrant(quadrant)) {
    switch (quadrant) {
      case 3:
      case 4:
        return gridAxisLength - value;
      case 1:
      case 2:
        return value;
      default:
        throw new Error("Something went wrong calculating the Y origin.");
    }
  } else {
    throw new Error("Invalid bot origin quadrant.");
  }
}

export function getXYFromQuadrant(
  x: number,
  y: number,
  q: BotOriginQuadrant,
  gridSize: AxisNumberProperty
): { qx: number, qy: number } {
  return {
    qx: calculateXBasedOnQuadrant({ value: x, quadrant: q, gridAxisLength: gridSize.x }),
    qy: calculateYBasedOnQuadrant({ value: y, quadrant: q, gridAxisLength: gridSize.y })
  };
}

export function getBotSize(
  botMcuParams: McuParams,
  stepsPerMmXY: StepsPerMmXY,
  defaultLength: AxisNumberProperty
): BotSize {
  const stopAtMaxXY = {
    x: !!botMcuParams.movement_stop_at_max_x,
    y: !!botMcuParams.movement_stop_at_max_y
  };
  const axisLengthXY = {
    x: botMcuParams.movement_axis_nr_steps_x || 0,
    y: botMcuParams.movement_axis_nr_steps_y || 0
  };

  const getAxisLength = (axis: "x" | "y"): CheckedAxisLength => {
    const axisStepsPerMm = stepsPerMmXY[axis];
    if (axisStepsPerMm && axisLengthXY[axis] !== 0 && stopAtMaxXY[axis]) {
      return { value: axisLengthXY[axis] / axisStepsPerMm, isDefault: false };
    } else {
      return { value: defaultLength[axis], isDefault: true };
    }
  };

  return { x: getAxisLength("x"), y: getAxisLength("y") };
}

export function getMapSize(
  gridSize: AxisNumberProperty,
  gridOffset: AxisNumberProperty
): AxisNumberProperty {
  return {
    x: gridSize.x + gridOffset.x * 2,
    y: gridSize.y + gridOffset.y * 2
  };
}

/* Transform object based on selected map quadrant and grid size. */
export const transformForQuadrant =
  (quadrant: BotOriginQuadrant, gridSize: AxisNumberProperty) => {
    const quadrantFlips = () => {
      switch (quadrant) {
        case 1: return { x: -1, y: 1 };
        case 2: return { x: 1, y: 1 };
        case 3: return { x: 1, y: -1 };
        case 4: return { x: -1, y: -1 };
        default: return { x: 1, y: 1 };
      }
    };
    const origin = getXYFromQuadrant(0, 0, quadrant, gridSize);
    const flip = quadrantFlips();
    const translate = { x: flip.x * origin.qx, y: flip.y * origin.qy };
    return trim(
      `scale(${flip.x}, ${flip.y})
       translate(${translate.x}, ${translate.y})`
    );
  };
