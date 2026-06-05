import {
  TaggedGenericPointer, TaggedWeedPointer,
} from "farmbot";
import {
  ThreeDLocationSelection, ThreeDObjectSelection,
} from "../selection_types";
import { TaggedPlant } from "../../farm_designer/map/interfaces";
import { DesignerState } from "../../farm_designer/interfaces";
import { SlotWithTool } from "../../resources/interfaces";
import { Path } from "../../internal_urls";

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
  designer: DesignerState | undefined,
  plants: TaggedPlant[],
  points: TaggedGenericPointer[],
  weeds: TaggedWeedPointer[],
  toolSlots: SlotWithTool[],
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
  return selectionFromResource("slot", slot?.toolSlot);
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
  }
};
