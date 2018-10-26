import { BotOriginQuadrant, isBotOriginQuadrant } from "../interfaces";
import { McuParams } from "farmbot";
import { StepsPerMmXY } from "../../devices/interfaces";
import {
  CheckedAxisLength, AxisNumberProperty, BotSize, MapTransformProps, Mode
} from "./interfaces";
import { trim } from "../../util";
import { getPathArray } from "../../history";
import { savedGardenOpen } from "../saved_gardens/saved_gardens";
import { last } from "lodash";

/*
 * Farm Designer Map Utilities
 *
 * Terms and Definitions:
 *   GARDEN coordinates: real coordinates (could be sent to bot)
 *   MAP coordinates: displayed locations (transformed according to map)
 *
 * Example:
 *   garden coordinate of {x: 100, y: 100}
 *   would be displayed at {x: 300, y: 300}
 *   if the bot axis sizes are {x: 400, y: 400}
 *   and the origin is in the lower right (map quadrant)
 */

/** multiple to round to for round() */
const SNAP = 10;

/**
 * Used for snapping.
 * Rounds units to nearest 10 (or whatever SNAP is set to).
 */
export function round(num: number) {
  return (Math.round(num / SNAP) * SNAP);
}

/*
 * Map coordinate calculations
 *
 * Constant:
 *   left and top map padding
 *   Map grid offset (for now)
 *
 * Dynamic:
 *   mouse position
 *   left and top scroll
 *   zoom level
 *   quadrant
 *   grid size
 *   XY swap
 *
 */

/** Controlled by .farm-designer-map padding x10 */
const paddingWhen = {
  panelClosed: { left: 20, top: 160 },
  panelOpen: { left: 318, top: 110 }
};

/** "x" => "left" and "y" => "top" */
const leftOrTop: Record<"x" | "y", "top" | "left"> = { x: "left", y: "top" };

type XYCoordinate = { x: number, y: number };

export interface ScreenToGardenParams {
  page: XYCoordinate;
  scroll: { left: number, top: number };
  zoomLvl: number;
  mapTransformProps: MapTransformProps;
  gridOffset: AxisNumberProperty;
  mapOnly: boolean;
}

/** Transform screen coordinates into garden coordinates  */
export function translateScreenToGarden(
  params: ScreenToGardenParams
): XYCoordinate {
  const {
    page, scroll, zoomLvl, mapTransformProps, gridOffset, mapOnly
  } = params;
  const { xySwap } = mapTransformProps;
  const mapPadding = mapOnly ? paddingWhen.panelClosed : paddingWhen.panelOpen;
  const screenXY = page;
  const mapXY = ["x", "y"].reduce<XYCoordinate>(
    (result: XYCoordinate, axis: "x" | "y") => {
      const unscrolled = screenXY[axis] + scroll[leftOrTop[axis]];
      const map = unscrolled - mapPadding[leftOrTop[axis]];
      const grid = map - gridOffset[axis] * zoomLvl;
      const unscaled = round(grid / zoomLvl);
      result[axis] = unscaled;
      return result;
    }, { x: 0, y: 0 });
  const coordinate = xySwap ? { x: mapXY.y, y: mapXY.x } : mapXY;
  const gardenXY = transformXY(coordinate.x, coordinate.y, mapTransformProps);
  return xySwap
    ? { x: gardenXY.qy, y: gardenXY.qx }
    : { x: gardenXY.qx, y: gardenXY.qy };
}

/* BotOriginQuadrant diagram

2 --- 1
|     |
3 --- 4

*/

const NORMAL_QUADRANTS: Record<"x" | "y", BotOriginQuadrant[]> = {
  // `2` is shared, i.e. no change needed for either axis when it is selected
  x: [3, 2],
  y: [2, 1]
};
const MIRRORED_QUADRANTS: Record<"x" | "y", BotOriginQuadrant[]> = {
  // `4` is shared, i.e. change needed for both axes when it is selected
  x: [1, 4],
  y: [4, 3]
};

interface QuadTransformParams {
  /** garden or map coordinates */
  coordinate: XYCoordinate;
  /** props necessary for coordinate transformation */
  mapTransformProps: MapTransformProps;
}

/** Quadrant coordinate transformation */
function quadTransform(params: QuadTransformParams): XYCoordinate {
  const { coordinate, mapTransformProps } = params;
  const { gridSize, quadrant } = mapTransformProps;
  if (isBotOriginQuadrant(quadrant)) {
    return ["x", "y"].reduce<XYCoordinate>(
      (result: XYCoordinate, axis: "x" | "y") => {
        switch (quadrant) {
          case MIRRORED_QUADRANTS[axis][0]:
          case MIRRORED_QUADRANTS[axis][1]:
            result[axis] = gridSize[axis] - coordinate[axis];
            return result;
          case NORMAL_QUADRANTS[axis][0]:
          case NORMAL_QUADRANTS[axis][1]:
            result[axis] = coordinate[axis];
            return result;
          default:
            throw new Error(
              `Something went wrong calculating the ${axis} origin.`);
        }
      }, { x: 0, y: 0 });
  } else {
    throw new Error("Invalid bot origin quadrant.");
  }
}

/**
 * Transform between garden and map coordinates
 *
 * Used for placing things in the Farm Designer map
 * or getting the real coordinates of things in the map.
 *
 * @param coordinate: garden or map coordinate
 * @param mapTransformProps: props necessary for coordinate transformation
 */
export function transformXY(
  x: number,
  y: number,
  rawMapTransformProps: MapTransformProps
): { qx: number, qy: number } {
  const { quadrant, gridSize, xySwap } = rawMapTransformProps;
  const coordinate = {
    x: xySwap ? y : x,
    y: xySwap ? x : y,
  };
  const transformed = quadTransform({
    coordinate,
    mapTransformProps: {
      quadrant,
      gridSize: {
        x: xySwap ? gridSize.y : gridSize.x,
        y: xySwap ? gridSize.x : gridSize.y,
      },
      xySwap
    }
  });
  return {
    qx: transformed.x,
    qy: transformed.y
  };
}

/** Determine bot axis lengths according to firmware settings */
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

/** Calculate map dimensions */
export function getMapSize(
  mapTransformProps: MapTransformProps,
  gridOffset: AxisNumberProperty
): { w: number, h: number } {
  const { gridSize, xySwap } = mapTransformProps;
  const mapSize = {
    x: gridSize.x + gridOffset.x * 2,
    y: gridSize.y + gridOffset.y * 2
  };
  return {
    w: xySwap ? mapSize.y : mapSize.x,
    h: xySwap ? mapSize.x : mapSize.y
  };
}

/** Transform object based on selected map quadrant and grid size. */
export const transformForQuadrant =
  (mapTransformProps: MapTransformProps): string => {
    const quadrantFlips = () => {
      switch (mapTransformProps.quadrant) {
        case 1: return { x: -1, y: 1 };
        case 2: return { x: 1, y: 1 };
        case 3: return { x: 1, y: -1 };
        case 4: return { x: -1, y: -1 };
        default: return { x: 1, y: 1 };
      }
    };
    const origin = transformXY(0, 0, mapTransformProps);
    const flip = quadrantFlips();
    const translate = { x: flip.x * origin.qx, y: flip.y * origin.qy };
    return trim(
      `scale(${flip.x}, ${flip.y})
       translate(${translate.x}, ${translate.y})`
    );
  };

/** Determine the current map mode based on path. */
export const getMode = (): Mode => {
  const pathArray = getPathArray();
  if (pathArray) {
    if (pathArray[6] === "add") { return Mode.clickToAdd; }
    if (pathArray[5] === "edit") { return Mode.editPlant; }
    if (pathArray[6] === "edit") { return Mode.editPlant; }
    if (pathArray[4] === "select") { return Mode.boxSelect; }
    if (pathArray[4] === "crop_search") { return Mode.addPlant; }
    if (pathArray[4] === "move_to") { return Mode.moveTo; }
    if (pathArray[4] === "create_point") { return Mode.createPoint; }
    if (savedGardenOpen(pathArray)) { return Mode.templateView; }
  }
  return Mode.none;
};

/** Get the garden map coordinate of a cursor or screen interaction. */
export const getGardenCoordinates = (props: {
  mapTransformProps: MapTransformProps,
  gridOffset: AxisNumberProperty,
  pageX: number,
  pageY: number,
}): AxisNumberProperty | undefined => {
  const el = document.querySelector(".drop-area-svg");
  const map = document.querySelector(".farm-designer-map");
  const page = document.querySelector(".farm-designer");
  if (el && map && page) {
    const zoomLvl = parseFloat(window.getComputedStyle(map).zoom || "1");
    const params: ScreenToGardenParams = {
      page: { x: props.pageX, y: props.pageY },
      scroll: { left: page.scrollLeft, top: map.scrollTop * zoomLvl },
      mapTransformProps: props.mapTransformProps,
      gridOffset: props.gridOffset,
      zoomLvl,
      mapOnly: last(getPathArray()) === "designer",
    };
    return translateScreenToGarden(params);
  } else {
    return undefined;
  }
};

export const maybeNoPointer =
  (defaultStyle: React.CSSProperties): React.SVGProps<SVGGElement>["style"] => {
    switch (getMode()) {
      case Mode.boxSelect:
      case Mode.clickToAdd:
      case Mode.moveTo:
      case Mode.createPoint:
        return { "pointerEvents": "none" };
      default:
        return defaultStyle;
    }
  };
