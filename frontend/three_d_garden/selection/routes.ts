import {
  PointType, TaggedGenericPointer, TaggedSceneObject, TaggedWeedPointer,
} from "farmbot";
import {
  ThreeDLocationSelection, ThreeDObjectSelection,
} from "../selection_types";
import { TaggedPlant } from "../../farm_designer/map/interfaces";
import { ThreeDDesignerState } from "../../farm_designer/interfaces";
import { SlotWithTool } from "../../resources/interfaces";
import { Path } from "../../internal_urls";

const POINT_TYPE_BY_SELECTION_KIND:
  Partial<Record<ThreeDObjectSelection["kind"], PointType>> =
{
  plant: "Plant",
  point: "GenericPointer",
  weed: "Weed",
  slot: "ToolSlot",
};

export const pointTypeForSelectionKind = (
  kind: ThreeDObjectSelection["kind"],
) => POINT_TYPE_BY_SELECTION_KIND[kind];

export const selectionKindAllowed = (
  kind: ThreeDObjectSelection["kind"],
  selectionPointType: PointType[] | undefined,
) => {
  const pointType = pointTypeForSelectionKind(kind);
  return !!pointType && (selectionPointType || ["Plant"]).includes(pointType);
};

interface SelectionLookupProps {
  plants: TaggedPlant[];
  points: TaggedGenericPointer[];
  weeds: TaggedWeedPointer[];
  toolSlots: SlotWithTool[];
  sceneObjects: TaggedSceneObject[];
}

export interface ThreeDObjectSelectionLookup {
  bySelection: Map<string, string>;
  byUuid: Map<string, ThreeDObjectSelection>;
}

const selectionLookupKey = (selection: ThreeDObjectSelection) =>
  `${selection.kind}-${selection.id}`;

const addLookupSelection = (
  lookup: ThreeDObjectSelectionLookup,
  uuid: string,
  selection: ThreeDObjectSelection,
) => {
  lookup.bySelection.set(selectionLookupKey(selection), uuid);
  lookup.byUuid.set(uuid, selection);
};

export const createSelectionLookup = (props: SelectionLookupProps) => {
  const lookup: ThreeDObjectSelectionLookup = {
    bySelection: new Map(),
    byUuid: new Map(),
  };
  props.plants.forEach(plant => plant.body.id && addLookupSelection(
    lookup, plant.uuid, { kind: "plant", id: plant.body.id }));
  props.points.forEach(point => point.body.id && addLookupSelection(
    lookup, point.uuid, { kind: "point", id: point.body.id }));
  props.weeds.forEach(weed => weed.body.id && addLookupSelection(
    lookup, weed.uuid, { kind: "weed", id: weed.body.id }));
  props.toolSlots.forEach(slot => slot.toolSlot.body.id && addLookupSelection(
    lookup, slot.toolSlot.uuid,
    { kind: "slot", id: slot.toolSlot.body.id }));
  props.sceneObjects.forEach(sceneObject => sceneObject.body.id
    && addLookupSelection(lookup, sceneObject.uuid, {
      kind: "sceneObject", id: sceneObject.body.id,
    }));
  return lookup;
};

export const uuidForSelection = (
  lookup: ThreeDObjectSelectionLookup,
  selection: ThreeDObjectSelection,
) => lookup.bySelection.get(selectionLookupKey(selection));

export const selectionForUuid = (
  lookup: ThreeDObjectSelectionLookup,
  uuid: string,
) => lookup.byUuid.get(uuid);

export const routeSelectionFromPath = (
  pathname: string,
): ThreeDObjectSelection | undefined => {
  const parts = pathname.split("/").filter(Boolean);
  const designerIndex = parts.indexOf("designer");
  if (designerIndex < 0) { return undefined; }
  const panel = parts[designerIndex + 1];
  const id = parseInt(parts[designerIndex + 2] || "");
  if (!isFinite(id)) { return undefined; }
  switch (panel) {
    case "plants": return { kind: "plant", id };
    case "points": return { kind: "point", id };
    case "weeds": return { kind: "weed", id };
    case "tool-slots": return { kind: "slot", id };
    case "scene-objects": return { kind: "sceneObject", id };
    default: return undefined;
  }
};

export const routeLocationSelectionFromPath = (
  pathname: string,
  search: string,
): ThreeDLocationSelection | undefined => {
  const parts = pathname.split("/").filter(Boolean);
  const designerIndex = parts.indexOf("designer");
  if (designerIndex < 0 || parts[designerIndex + 1] != "location") {
    return undefined;
  }
  const params = new URLSearchParams(search);
  const x = parseFloat(params.get("x") || "");
  const y = parseFloat(params.get("y") || "");
  const z = parseFloat(params.get("z") || "0");
  return isFinite(x) && isFinite(y) && isFinite(z)
    ? { kind: "location", x, y, z }
    : undefined;
};

const selectionFromResource = (
  kind: ThreeDObjectSelection["kind"],
  resource: { body: { id?: number } } | undefined,
): ThreeDObjectSelection | undefined =>
  resource?.body.id ? { kind, id: resource.body.id } : undefined;

export const hoverSelectionFromDesigner = (
  designer: ThreeDDesignerState | undefined,
  plants: TaggedPlant[],
  points: TaggedGenericPointer[],
  weeds: TaggedWeedPointer[],
  toolSlots: SlotWithTool[],
  sceneObjects: TaggedSceneObject[] = [],
  // eslint-disable-next-line complexity
): ThreeDObjectSelection | undefined => {
  const hoveredPlantUuid =
    designer?.hoveredPlant.plantUUID || designer?.hoveredPlantListItem;
  const plant = plants.filter(resource => resource.uuid == hoveredPlantUuid)[0];
  if (plant?.body.id) { return { kind: "plant", id: plant.body.id }; }

  const point = points.filter(resource =>
    resource.uuid == designer?.hoveredPoint)[0];
  if (point?.body.id) { return { kind: "point", id: point.body.id }; }

  const weed = weeds.filter(resource => resource.uuid == designer?.hoveredPoint)[0];
  if (weed?.body.id) { return { kind: "weed", id: weed.body.id }; }

  const slot = toolSlots.filter(resource =>
    resource.toolSlot.uuid == designer?.hoveredToolSlot)[0];
  const slotSelection = selectionFromResource("slot", slot?.toolSlot);
  if (slotSelection) { return slotSelection; }

  const sceneObject = sceneObjects.filter(resource =>
    resource.uuid == designer?.hoveredSceneObject)[0];
  const sceneObjectSelection = selectionFromResource("sceneObject", sceneObject);
  if (sceneObjectSelection) { return sceneObjectSelection; }
  const staticSceneObject = sceneObjects.filter(resource =>
    resource.uuid == designer?.hoveredSceneObject)[0];
  return staticSceneObject
    ? { kind: "sceneObject", id: 0, uuid: staticSceneObject.uuid }
    : undefined;
};

export const pathForThreeDSelection = (
  selection: ThreeDObjectSelection,
): string => {
  switch (selection.kind) {
    case "plant": return Path.plants(selection.id);
    case "point": return Path.points(selection.id);
    case "weed": return Path.weeds(selection.id);
    case "slot": return Path.toolSlots(selection.id);
    case "utm": return Path.tools();
    case "electronics": return Path.settings("farmbot");
    case "camera": return Path.photos();
    case "connectivity": return Path.designer();
    case "sceneObject": return Path.sceneObjects(selection.id);
    case "bed": return Path.settings("3d_garden");
  }
};
