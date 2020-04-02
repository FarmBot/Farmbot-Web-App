import { isObject, isString, get, chain } from "lodash";
import { betterCompact } from "../util";
import { assertUuid } from "./util";
import {
  TaggedResource,
  ResourceName,
  TaggedRegimen,
  TaggedSequence,
  TaggedTool,
  TaggedFarmEvent,
  TaggedToolSlotPointer,
  TaggedPlantPointer,
  TaggedGenericPointer,
  PointerType,
  SpecialStatus,
  TaggedPlantTemplate,
  TaggedSavedGarden,
  TaggedPointGroup,
  TaggedWeedPointer,
} from "farmbot";

export interface TaggedResourceBase {
  kind: ResourceName;
  /** Unique identifier and index key.
   * We can't use the object's `id` attribute as a local index key because
   * unsaved objects don't have one.
   */
  uuid: string;
  body: object;
  /** Indicates if the resource is saved, saving or dirty.
   * `undefined` denotes that the resource is saved. */
  specialStatus: SpecialStatus;
}

/** Given an array of TaggedResources, returns the most "important" special status.
 * the hierarchy is SAVED => DIRTY => SAVING  */
export function getArrayStatus(i: TaggedResource[]): SpecialStatus {
  const r = betterCompact(chain(i).map(x => x.specialStatus).uniq().value());
  if (r.length) {
    return (r.includes(SpecialStatus.SAVING)) ?
      SpecialStatus.SAVING : SpecialStatus.DIRTY;
  } else {
    return SpecialStatus.SAVED;
  }
}

/** Spot check to be certain a TaggedResource is what it says it is. */
export function sanityCheck(x: object): x is TaggedResource {
  if (isTaggedResource(x)) {
    assertUuid(x.kind, x.uuid);
    return true;
  } else {
    throw new Error("Bad kind, uuid, or body: " + JSON.stringify(x));
  }
}

export function isTaggedResource(x: object): x is TaggedResource {
  const isOk = (isObject(x)
    && isString(get(x, "kind"))
    && isString(get(x, "uuid"))
    && isObject(get(x, "body")));
  if (isOk) {
    return true;
  } else {
    console.error(JSON.stringify(x));
    return false;
  }
}

const is = (r: ResourceName) => function isOfTag(x: object): x is TaggedResource {
  const safe = (sanityCheck(x) && isTaggedResource(x) && x.kind == r);
  if (!safe) {
    if (x) {
      throw new Error("Possible bad index");
    }
  }
  return safe;
};

export function isTaggedPoint(x: {}): x is PointerType {
  return (is("Point")(x)) && (x.kind === "Point");
}

export const isTaggedRegimen =
  (x: object): x is TaggedRegimen => is("Regimen")(x);
export const isTaggedFolder =
  (x: object): x is TaggedRegimen => is("Folder")(x);
export const isTaggedSequence =
  (x: object): x is TaggedSequence => is("Sequence")(x);
export const isTaggedTool =
  (x: object): x is TaggedTool => is("Tool")(x);
export const isTaggedFarmEvent =
  (x: object): x is TaggedFarmEvent => is("FarmEvent")(x);
export const isTaggedToolSlotPointer =
  (x: object): x is TaggedToolSlotPointer => {
    return isTaggedPoint(x) && (x.body.pointer_type === "ToolSlot");
  };
export const isTaggedPlantPointer =
  (x: object): x is TaggedPlantPointer => {
    return isTaggedPoint(x) && (x.body.pointer_type === "Plant");
  };
export const isTaggedGenericPointer =
  (x: object): x is TaggedGenericPointer => {
    return isTaggedPoint(x) && (x.body.pointer_type === "GenericPointer");
  };
export const isTaggedWeedPointer = (x: object): x is TaggedWeedPointer =>
  isTaggedPoint(x) && (x.body.pointer_type === "Weed");
export const isTaggedSavedGarden =
  (x: object): x is TaggedSavedGarden => is("SavedGarden")(x);
export const isTaggedPlantTemplate =
  (x: object): x is TaggedPlantTemplate => is("PlantTemplate")(x);
export const isTaggedPointGroup =
  (x: object): x is TaggedPointGroup => is("PointGroup")(x);
