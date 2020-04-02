import { BotOriginQuadrant, isBotOriginQuadrant } from "../interfaces";
import { McuParams } from "farmbot";
import { StepsPerMmXY } from "../../devices/interfaces";
import {
  CheckedAxisLength, AxisNumberProperty, BotSize, MapTransformProps, Mode,
  TaggedPlant,
} from "./interfaces";
import { trim } from "../../util";
import { history, getPathArray } from "../../history";
import { savedGardenOpen } from "../saved_gardens/saved_gardens";

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

/** Status of farm designer side panel. */
export enum MapPanelStatus {
  open = "open",
  closed = "closed",
  short = "short",
}

/** Get farm designer side panel status. */
export const getPanelStatus = (): MapPanelStatus => {
  if (history.getCurrentLocation().pathname === "/app/designer") {
    return MapPanelStatus.closed;
  }
  const mode = getMode();
  if (window.innerWidth <= 450 &&
    (mode === Mode.moveTo || mode === Mode.clickToAdd)) {
    return MapPanelStatus.short;
  }
  return MapPanelStatus.open;
};

/** Get panel status class name for farm designer. */
export const mapPanelClassName = () => {
  switch (getPanelStatus()) {
    case MapPanelStatus.short: return "short-panel";
    case MapPanelStatus.closed: return "panel-closed";
    case MapPanelStatus.open:
    default:
      return "panel-open";
  }
};

/** Controlled by .farm-designer-map padding x10 */
export const getMapPadding =
  (panelStatus: MapPanelStatus): { left: number, top: number } => {
    switch (panelStatus) {
      case MapPanelStatus.short: return { left: 20, top: 350 };
      case MapPanelStatus.closed: return { left: 20, top: 160 };
      case MapPanelStatus.open:
      default:
        return { left: 318, top: 110 };
    }
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
  panelStatus: MapPanelStatus;
}

/** Transform screen coordinates into garden coordinates  */
export function translateScreenToGarden(
  params: ScreenToGardenParams,
): XYCoordinate {
  const {
    page, scroll, zoomLvl, mapTransformProps, gridOffset, panelStatus
  } = params;
  const { xySwap } = mapTransformProps;
  const mapPadding = getMapPadding(panelStatus);
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
  rawMapTransformProps: MapTransformProps,
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
  defaultLength: AxisNumberProperty,
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
  gridOffset: AxisNumberProperty,
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
       translate(${translate.x}, ${translate.y})`);
  };

/** Determine the current map mode based on path. */
// tslint:disable-next-line:cyclomatic-complexity
export const getMode = (): Mode => {
  const pathArray = getPathArray();
  if (pathArray) {
    if ((pathArray[3] === "groups" || pathArray[3] === "zones")
      && pathArray[4]) { return Mode.editGroup; }
    if (pathArray[6] === "add") { return Mode.clickToAdd; }
    if (!isNaN(parseInt(pathArray.slice(-1)[0]))) { return Mode.editPlant; }
    if (pathArray[5] === "edit") { return Mode.editPlant; }
    if (pathArray[6] === "edit") { return Mode.editPlant; }
    if (pathArray[4] === "select") { return Mode.boxSelect; }
    if (pathArray[4] === "crop_search") { return Mode.addPlant; }
    if (pathArray[3] === "move_to") { return Mode.moveTo; }
    if (pathArray[3] === "points") {
      if (pathArray[4] === "add") { return Mode.createPoint; }
      return Mode.points;
    }
    if (pathArray[3] === "weeds") {
      if (pathArray[4] === "add") { return Mode.createWeed; }
      return Mode.weeds;
    }
    if (savedGardenOpen(pathArray)) { return Mode.templateView; }
  }
  return Mode.none;
};

export const getZoomLevelFromMap = (map: Element) =>
  parseFloat((window.getComputedStyle(map).transform || "(1").split("(")[1]);

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
    const zoomLvl = getZoomLevelFromMap(map);
    const params: ScreenToGardenParams = {
      page: { x: props.pageX, y: props.pageY },
      scroll: { left: page.scrollLeft, top: map.scrollTop * zoomLvl },
      mapTransformProps: props.mapTransformProps,
      gridOffset: props.gridOffset,
      zoomLvl,
      panelStatus: getPanelStatus(),
    };
    return translateScreenToGarden(params);
  } else {
    return undefined;
  }
};

export const allowInteraction = () => {
  switch (getMode()) {
    case Mode.clickToAdd:
    case Mode.moveTo:
    case Mode.createPoint:
    case Mode.createWeed:
      return false;
    default:
      return true;
  }
};

export const allowGroupAreaInteraction = () => {
  if (!allowInteraction()) { return false; }
  switch (getMode()) {
    case Mode.boxSelect:
    case Mode.editGroup:
      return false;
    default:
      return true;
  }
};

/** Check if the cursor is within the selected plant indicator area. */
export const cursorAtPlant =
  (plant: TaggedPlant | undefined, cursor: AxisNumberProperty | undefined) =>
    plant && cursor
    && (cursor.x > plant.body.x - plant.body.radius * 1.2)
    && (cursor.y > plant.body.y - plant.body.radius * 1.2)
    && (cursor.x < plant.body.x + plant.body.radius * 1.2)
    && (cursor.y < plant.body.y + plant.body.radius * 1.2);
