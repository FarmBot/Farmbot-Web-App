import { BotOriginQuadrant, DesignerState } from "../interfaces";
import { McuParams, Xyz } from "farmbot";
import { StepsPerMm } from "../../devices/interfaces";
import {
  CheckedAxisLength, AxisNumberProperty, BotSize, MapTransformProps, Mode,
  TaggedPlant,
} from "./interfaces";
import { trim } from "../../util";
import { store } from "../../redux/store";
import { Path } from "../../internal_urls";
import { isMobile } from "../../screen_size";

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

/**
 * Calculate the distance between two points.
 */
export function xyDistance(
  a: { x: number, y: number },
  b: { x: number, y: number },
): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  const dx2 = Math.pow(dx, 2);
  const dy2 = Math.pow(dy, 2);
  return Math.sqrt(dx2 + dy2);
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
  mobileClosed = "mobileClosed",
  closed = "closed",
  short = "short",
}

/** Get farm designer side panel status. */
export const getPanelStatus = (designer: DesignerState): MapPanelStatus => {
  if (!designer.panelOpen) {
    return isMobile() ? MapPanelStatus.mobileClosed : MapPanelStatus.closed;
  }
  const mode = getMode();
  if (isMobile() &&
    (mode === Mode.locationInfo ||
      mode === Mode.clickToAdd)) {
    return MapPanelStatus.short;
  }
  return MapPanelStatus.open;
};

/** Get panel status class name for farm designer. */
export const mapPanelClassName = (designer: DesignerState) => {
  switch (getPanelStatus(designer)) {
    case MapPanelStatus.short: return "short-panel";
    case MapPanelStatus.mobileClosed: return "panel-closed-mobile";
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
      case MapPanelStatus.short: return { left: 10, top: 350 };
      case MapPanelStatus.mobileClosed: return { left: 10, top: 160 };
      case MapPanelStatus.closed: return { left: 10, top: 90 };
      case MapPanelStatus.open:
      default:
        return { left: 475, top: 90 };
    }
  };

/** "x" => "left" and "y" => "top" */
const leftOrTop: Record<"x" | "y", "top" | "left"> = { x: "left", y: "top" };

type XYCoordinate = { x: number, y: number };

interface ScreenToGardenParams {
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
  return ["x", "y"].reduce<XYCoordinate>(
    (result: XYCoordinate, axis: "x" | "y") => {
      switch (quadrant) {
        case MIRRORED_QUADRANTS[axis][0]:
        case MIRRORED_QUADRANTS[axis][1]:
          result[axis] = gridSize[axis] - coordinate[axis];
          return result;
        default:
        case NORMAL_QUADRANTS[axis][0]:
        case NORMAL_QUADRANTS[axis][1]:
          result[axis] = coordinate[axis];
          return result;
      }
    }, { x: 0, y: 0 });
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
  stepsPerMm: StepsPerMm,
  defaultLength: Record<Xyz, number>,
): BotSize {
  const stopAtMaxXY = {
    x: !!botMcuParams.movement_stop_at_max_x,
    y: !!botMcuParams.movement_stop_at_max_y,
    z: !!botMcuParams.movement_stop_at_max_z,
  };
  const axisLengthXY = {
    x: botMcuParams.movement_axis_nr_steps_x || 0,
    y: botMcuParams.movement_axis_nr_steps_y || 0,
    z: botMcuParams.movement_axis_nr_steps_z || 0,
  };

  const getAxisLength = (axis: "x" | "y" | "z"): CheckedAxisLength => {
    const axisStepsPerMm = stepsPerMm[axis];
    if (axisStepsPerMm && axisLengthXY[axis] !== 0 && stopAtMaxXY[axis]) {
      return { value: axisLengthXY[axis] / axisStepsPerMm, isDefault: false };
    } else {
      return { value: defaultLength[axis], isDefault: true };
    }
  };

  return { x: getAxisLength("x"), y: getAxisLength("y"), z: getAxisLength("z") };
}

/** Calculate map dimensions */
export function getMapSize(
  mapTransformProps: MapTransformProps,
  gridOffset?: AxisNumberProperty,
): { w: number, h: number } {
  const { gridSize, xySwap } = mapTransformProps;
  const mapSize = {
    x: gridSize.x + (gridOffset?.x || 0) * 2,
    y: gridSize.y + (gridOffset?.y || 0) * 2
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
        case BotOriginQuadrant.ONE: return { x: -1, y: 1 };
        case BotOriginQuadrant.TWO: return { x: 1, y: 1 };
        case BotOriginQuadrant.THREE: return { x: 1, y: -1 };
        case BotOriginQuadrant.FOUR: return { x: -1, y: -1 };
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
// eslint-disable-next-line complexity
export const getMode = (): Mode => {
  if (store.getState().resources.consumers.farm_designer.profileOpen) {
    return Mode.profile;
  }
  const panelSlug = Path.getSlug(Path.designer());
  if ((panelSlug === "groups" || panelSlug === "zones")
    && Path.getSlug(Path.groups())) { return Mode.editGroup; }
  if (Path.getSlug(Path.cropSearch("plant")) === "add") {
    return Mode.clickToAdd;
  }
  if (savedGardenOpen()) { return Mode.templateView; }
  if (Path.lastChunkIsNum()) { return Mode.editPlant; }
  if (Path.getSlug(Path.plants()) === "select") {
    return Mode.boxSelect;
  }
  if (Path.getSlug(Path.plants()) === "crop_search" &&
    Path.getSlug(Path.cropSearch())) { return Mode.clickToAdd; }
  if (panelSlug === "location") { return Mode.locationInfo; }
  if (panelSlug === "points") {
    if (Path.getSlug(Path.points()) === "add") {
      return Mode.createPoint;
    }
    return Mode.points;
  }
  if (Path.getSlug(Path.designer()) === "weeds") {
    if (Path.getSlug(Path.weeds()) === "add") {
      return Mode.createWeed;
    }
    return Mode.weeds;
  }
  return Mode.none;
};

/** Check if a SavedGarden is currently open (URL approach). */
export const savedGardenOpen = () =>
  Path.getSlug(Path.designer()) === "gardens" &&
    parseInt(Path.getSlug(Path.savedGardens())) > 0
    ? parseInt(Path.getSlug(Path.savedGardens()))
    : false;

const getZoomLevelFromMap = (map: Element) =>
  parseFloat((window.getComputedStyle(map).transform || "(1").split("(")[1]);

export interface GetGardenCoordinatesProps {
  mapTransformProps: MapTransformProps;
  gridOffset: AxisNumberProperty;
  pageX: number;
  pageY: number;
  designer: DesignerState;
}

/** Get the garden map coordinate of a cursor or screen interaction. */
export const getGardenCoordinates = (
  props: GetGardenCoordinatesProps,
): AxisNumberProperty | undefined => {
  const el = document.querySelector(".drop-area-svg");
  const map = document.querySelector(".farm-designer-map");
  const page = document.querySelector(".farm-designer");
  if (el && map && page) {
    const zoomLvl = getZoomLevelFromMap(map);
    const params: ScreenToGardenParams = {
      page: { x: props.pageX, y: props.pageY },
      scroll: { left: page.scrollLeft, top: page.scrollTop },
      mapTransformProps: props.mapTransformProps,
      gridOffset: props.gridOffset,
      zoomLvl,
      panelStatus: getPanelStatus(props.designer),
    };
    return translateScreenToGarden(params);
  } else {
    return undefined;
  }
};

export const allowInteraction = () => {
  switch (getMode()) {
    case Mode.clickToAdd:
    case Mode.locationInfo:
    case Mode.createPoint:
    case Mode.createWeed:
    case Mode.profile:
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

/** Scale icon within radius circle.
 *
 *     |                  _/
 *     |               _/ UPPER_FACTOR * radius (20% shown)
 * MID |       ______/
 *     |      /
 *     |     / LOWER_FACTOR * radius (80% shown)
 *     |    /
 * MIN |---'
 *     |____________________
 *     0   ^   ^     ^
 *         |   |     LARGE
 *         |   |
 *         |   MID / LOWER_FACTOR
 *         |
 *         MIN / LOWER_FACTOR
 */
export const scaleIcon = (radius: number): number => {
  const MIN = 10;
  const MID = 30;
  const LARGE = 150;
  const LOWER_FACTOR = 0.8;
  const UPPER_FACTOR = 0.2;
  if (radius > LARGE) { return round(UPPER_FACTOR * radius); }
  if (radius < MIN / LOWER_FACTOR) { return MIN; }
  if (radius < MID / LOWER_FACTOR) { return round(LOWER_FACTOR * radius); }
  return MID;
};

/** Calculate default plant spread value (diameter in centimeters). */
export const defaultSpreadCmDia = (radius: number) =>
  Math.max(25, round(0.2 * radius));
