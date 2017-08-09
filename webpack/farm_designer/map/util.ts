import { BotOriginQuadrant, isBotOriginQuadrant } from "../interfaces";

const SNAP = 10;
const SCALE_FACTOR = 9.8;
const FARMBOT_DEFAULT_LENGTH = 3002;
const FARMBOT_DEFAULT_WIDTH = 1502;
const LEFT_MENU_WIDTH = 320;
const TOP_NAV_HEIGHT = 110;

export function scale(radius = 0) {
  return (radius * SCALE_FACTOR / 2);
}

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
}

interface GetMouseXYPayl {
  mx: number;
  my: number;
}

/**
 * NOTE: This is the mouse position *CONSIDERING* the offset of the surrounding
 * elements that are also on the farm designer page.
 */
export function getMouseXY(e: MouseEvent): GetMouseXYPayl {

  let { clientX, clientY } = e;
  let { scrollLeft, scrollTop, clientLeft, clientTop } = document.body;

  let mx = (clientX + scrollLeft - clientLeft) - LEFT_MENU_WIDTH;
  let my = (clientY + scrollTop - clientTop) - TOP_NAV_HEIGHT;

  return { mx, my }

}

export function translateScreenToGarden(params: ScreenToGardenParams) {
  let { pageX, pageY, zoomLvl, quadrant } = params;

  let rawX = round((pageX - 320) / zoomLvl);
  let rawY = round((pageY - 110) / zoomLvl);

  let x = calculateXBasedOnQuadrant({ value: rawX, quadrant });
  let y = calculateYBasedOnQuadrant({ value: rawY, quadrant });

  return { x, y };
}

interface CalculateQuadrantParams {
  value: number;
  quadrant: BotOriginQuadrant;
}

function calculateXBasedOnQuadrant(params: CalculateQuadrantParams) {
  let { value, quadrant } = params;
  if (isBotOriginQuadrant(quadrant)) {
    switch (quadrant) {
      case 1:
      case 4:
        return FARMBOT_DEFAULT_LENGTH - value;
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
  let { value, quadrant } = params;
  if (isBotOriginQuadrant(quadrant)) {
    switch (quadrant) {
      case 3:
      case 4:
        return FARMBOT_DEFAULT_WIDTH - value;
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
  q: BotOriginQuadrant
): { qx: number, qy: number } {
  return {
    qx: calculateXBasedOnQuadrant({ value: x, quadrant: q }),
    qy: calculateYBasedOnQuadrant({ value: y, quadrant: q })
  }
}
