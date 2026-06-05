import {
  TaggedDevice, TaggedGenericPointer, TaggedWeedPointer, Vector3,
} from "farmbot";
import { round } from "lodash";
import { Config, PositionConfig } from "../config";
import {
  get3DPositionNoMirrorFunc, getWorldPositionFunc, zDir as zDirFunc,
  zZero as zZeroFunc,
} from "../helpers";
import {
  getToolRenderPosition, getToolSlotRenderPosition,
} from "../bot/components/tool_slot_position";
import {
  cameraMountOffset, getElectronicsBoxPosition,
} from "../bot/positioning";
import {
  ThreeDLocationSelection, ThreeDObjectSelection,
} from "../selection_types";
import { TaggedPlant } from "../../farm_designer/map/interfaces";
import { SlotWithTool } from "../../resources/interfaces";
import { BotPosition } from "../../devices/interfaces";
import { t } from "../../i18next_wrapper";

const MIN_RING_RADIUS = 35;
const POPUP_Z_PADDING = 25;
const FIXED_POPUP_Z_OFFSET = 75;
const SLOT_RING_RADIUS = 50;
const ELECTRONICS_RING_RADIUS = 120;

export interface ResolvedThreeDObjectBase {
  selection: ThreeDObjectSelection;
  name: string;
  worldPosition: [number, number, number];
  popupPosition: [number, number, number];
  ringRadius: number;
  locationCoordinate: Vector3;
}

interface ResolvedPlantObject extends ResolvedThreeDObjectBase {
  kind: "plant";
  plant: TaggedPlant;
}

interface ResolvedPointObject extends ResolvedThreeDObjectBase {
  kind: "point";
  point: TaggedGenericPointer;
}

interface ResolvedWeedObject extends ResolvedThreeDObjectBase {
  kind: "weed";
  weed: TaggedWeedPointer;
}

interface ResolvedSlotObject extends ResolvedThreeDObjectBase {
  kind: "slot";
  slot: SlotWithTool;
}

interface ResolvedUtmObject extends ResolvedThreeDObjectBase {
  kind: "utm";
}

interface ResolvedElectronicsObject extends ResolvedThreeDObjectBase {
  kind: "electronics";
}

interface ResolvedCameraObject extends ResolvedThreeDObjectBase {
  kind: "camera";
}

export type ResolvedThreeDObject =
  | ResolvedPlantObject
  | ResolvedPointObject
  | ResolvedWeedObject
  | ResolvedSlotObject
  | ResolvedUtmObject
  | ResolvedElectronicsObject
  | ResolvedCameraObject;

export interface ResolvedLocationObject {
  kind: "location";
  selection: ThreeDLocationSelection;
  name: string;
  worldPosition: [number, number, number];
  popupPosition: [number, number, number];
  ringRadius: number;
  locationCoordinate: Vector3;
}

export type ResolvedPopupObject =
  ResolvedThreeDObject | ResolvedLocationObject;

export const objectHasSelectionOverlay = (
  object: ResolvedPopupObject | undefined,
) =>
  !!object
  && object.kind != "utm"
  && object.kind != "electronics"
  && object.kind != "camera";

const objectName = (
  resource: { body: { name?: string, id?: number } },
  fallback: string,
) =>
  resource.body.name || `${fallback} ${resource.body.id || ""}`.trim();

const popupZOffset = (radius: number, multiplier = 1) =>
  multiplier * radius + POPUP_Z_PADDING;

export interface ResolveSelectedObjectProps {
  config: Config;
  configPosition: PositionConfig;
  plants: TaggedPlant[];
  points: TaggedGenericPointer[];
  weeds: TaggedWeedPointer[];
  toolSlots: SlotWithTool[];
  currentBotLocation: BotPosition;
  deviceAccount: TaggedDevice | undefined;
  getZ(x: number, y: number): number;
}

const resolvePlantObject = (
  props: ResolveSelectedObjectProps,
  selection: ThreeDObjectSelection,
): ResolvedPlantObject | undefined => {
  const plant = props.plants.find(resource => resource.body.id == selection.id);
  if (!plant) { return undefined; }
  const getWorldPosition = getWorldPositionFunc(props.config);
  const z = props.getZ(plant.body.x, plant.body.y);
  const worldPosition = getWorldPosition({ x: plant.body.x, y: plant.body.y, z });
  return {
    kind: "plant",
    selection,
    plant,
    name: objectName(plant, t("Plant")),
    worldPosition,
    popupPosition: [worldPosition[0], worldPosition[1],
      worldPosition[2] + popupZOffset(plant.body.radius, 2)],
    ringRadius: Math.max(plant.body.radius, MIN_RING_RADIUS),
    locationCoordinate: {
      x: plant.body.x,
      y: plant.body.y,
      z: plant.body.z || 0,
    },
  };
};

const resolvePointObject = (
  props: ResolveSelectedObjectProps,
  selection: ThreeDObjectSelection,
): ResolvedPointObject | undefined => {
  const point = props.points.find(resource => resource.body.id == selection.id);
  if (!point) { return undefined; }
  const getWorldPosition = getWorldPositionFunc(props.config);
  const z = props.getZ(point.body.x, point.body.y);
  const worldPosition = getWorldPosition({ x: point.body.x, y: point.body.y, z });
  return {
    kind: "point",
    selection,
    point,
    name: objectName(point, t("Point")),
    worldPosition,
    popupPosition: [worldPosition[0], worldPosition[1],
      worldPosition[2] + FIXED_POPUP_Z_OFFSET],
    ringRadius: Math.max(point.body.radius, MIN_RING_RADIUS),
    locationCoordinate: {
      x: point.body.x,
      y: point.body.y,
      z: point.body.z || 0,
    },
  };
};

const resolveWeedObject = (
  props: ResolveSelectedObjectProps,
  selection: ThreeDObjectSelection,
): ResolvedWeedObject | undefined => {
  const weed = props.weeds.find(resource => resource.body.id == selection.id);
  if (!weed) { return undefined; }
  const getWorldPosition = getWorldPositionFunc(props.config);
  const weedSize = weed.body.radius == 0 ? 50 : weed.body.radius;
  const z = props.getZ(weed.body.x, weed.body.y);
  const worldPosition = getWorldPosition({ x: weed.body.x, y: weed.body.y, z });
  return {
    kind: "weed",
    selection,
    weed,
    name: objectName(weed, t("Weed")),
    worldPosition,
    popupPosition: [worldPosition[0], worldPosition[1],
      worldPosition[2] + popupZOffset(weed.body.radius)],
    ringRadius: Math.max(weedSize, MIN_RING_RADIUS),
    locationCoordinate: {
      x: weed.body.x,
      y: weed.body.y,
      z: weed.body.z || 0,
    },
  };
};

const resolveSlotObject = (
  props: ResolveSelectedObjectProps,
  selection: ThreeDObjectSelection,
): ResolvedSlotObject | undefined => {
  const slot = props.toolSlots.find(resource =>
    resource.toolSlot.body.id == selection.id);
  if (!slot) { return undefined; }
  const worldPosition =
    getToolSlotRenderPosition(props.config, props.configPosition, slot);
  const slotBody = slot.toolSlot.body;
  return {
    kind: "slot",
    selection,
    slot,
    name: slot.tool?.body.name || t("Empty slot"),
    worldPosition: [worldPosition.x, worldPosition.y, worldPosition.z],
    popupPosition: [worldPosition.x, worldPosition.y,
      worldPosition.z + FIXED_POPUP_Z_OFFSET],
    ringRadius: SLOT_RING_RADIUS,
    locationCoordinate: {
      x: slotBody.gantry_mounted
        ? props.currentBotLocation.x ?? slotBody.x
        : slotBody.x,
      y: slotBody.y,
      z: slotBody.z,
    },
  };
};

const resolveUtmObject = (
  props: ResolveSelectedObjectProps,
  selection: ThreeDObjectSelection,
): ResolvedUtmObject => {
  const worldPosition = getToolRenderPosition(props.config, {
    x: props.configPosition.x,
    y: props.configPosition.y,
    z: props.configPosition.z,
  }, false);
  return {
    kind: "utm",
    selection,
    name: t("UTM"),
    worldPosition: [worldPosition.x, worldPosition.y, worldPosition.z],
    popupPosition: [worldPosition.x, worldPosition.y,
      worldPosition.z + FIXED_POPUP_Z_OFFSET],
    ringRadius: SLOT_RING_RADIUS,
    locationCoordinate: {
      x: props.configPosition.x,
      y: props.configPosition.y,
      z: props.configPosition.z,
    },
  };
};

const resolveElectronicsObject = (
  props: ResolveSelectedObjectProps,
  selection: ThreeDObjectSelection,
): ResolvedElectronicsObject => {
  const worldPosition =
    getElectronicsBoxPosition(props.config, props.configPosition);
  return {
    kind: "electronics",
    selection,
    name: props.deviceAccount?.body.name || t("FarmBot"),
    worldPosition: [worldPosition.x, worldPosition.y, worldPosition.z],
    popupPosition: [worldPosition.x, worldPosition.y,
      worldPosition.z + FIXED_POPUP_Z_OFFSET],
    ringRadius: ELECTRONICS_RING_RADIUS,
    locationCoordinate: {
      x: props.configPosition.x,
      y: props.configPosition.y,
      z: props.configPosition.z,
    },
  };
};

const resolveCameraObject = (
  props: ResolveSelectedObjectProps,
  selection: ThreeDObjectSelection,
): ResolvedCameraObject => {
  const { x, y, z } = props.configPosition;
  const position = get3DPositionNoMirrorFunc(props.config)({
    x: x + cameraMountOffset.x,
    y: y + cameraMountOffset.y,
  });
  const zPosition =
    zZeroFunc(props.config) - zDirFunc(props.config) * z
    - 140 + props.config.zGantryOffset + 20;
  return {
    kind: "camera",
    selection,
    name: t("Camera"),
    worldPosition: [position.x, position.y, zPosition],
    popupPosition: [position.x, position.y, zPosition + FIXED_POPUP_Z_OFFSET],
    ringRadius: SLOT_RING_RADIUS,
    locationCoordinate: {
      x: x + cameraMountOffset.x,
      y: y + cameraMountOffset.y,
      z,
    },
  };
};

export const resolveSelectedObject = (
  props: ResolveSelectedObjectProps,
  selection: ThreeDObjectSelection | undefined,
): ResolvedThreeDObject | undefined => {
  if (!selection) { return undefined; }
  switch (selection.kind) {
    case "plant": return resolvePlantObject(props, selection);
    case "point": return resolvePointObject(props, selection);
    case "weed": return resolveWeedObject(props, selection);
    case "slot": return resolveSlotObject(props, selection);
    case "utm": return resolveUtmObject(props, selection);
    case "electronics": return resolveElectronicsObject(props, selection);
    case "camera": return resolveCameraObject(props, selection);
  }
};

const locationName = (selection: ThreeDLocationSelection) =>
  `(${round(selection.x)}, ${round(selection.y)}, ${round(selection.z)})`;

export const resolveLocationObject = (
  props: Pick<ResolveSelectedObjectProps, "config">,
  selection: ThreeDLocationSelection | undefined,
): ResolvedLocationObject | undefined => {
  if (!selection) { return undefined; }
  const getWorldPosition = getWorldPositionFunc(props.config);
  const worldPosition = getWorldPosition({
    x: selection.x,
    y: selection.y,
    z: selection.z,
  });
  return {
    kind: "location",
    selection,
    name: locationName(selection),
    worldPosition,
    popupPosition: [
      worldPosition[0],
      worldPosition[1],
      worldPosition[2] + FIXED_POPUP_Z_OFFSET,
    ],
    ringRadius: MIN_RING_RADIUS,
    locationCoordinate: {
      x: selection.x,
      y: selection.y,
      z: selection.z,
    },
  };
};
