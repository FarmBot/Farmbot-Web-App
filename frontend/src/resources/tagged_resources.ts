import { Sequence } from "../sequences/interfaces";
import { Tool } from "../tools/interfaces";
import { Regimen } from "../regimens/interfaces";
import { FarmEvent, Crop } from "../farm_designer/interfaces";
import {
  Log,
  GenericPointer,
  PlantPointer,
  ToolSlotPointer,
} from "../interfaces";
import { Peripheral } from "../controls/peripherals/interfaces";
import { User } from "../auth/interfaces";
import { assertUuid } from "./selectors";
import { DeviceAccountSettings } from "../devices/interfaces";
import { isObject, isString, get } from "lodash";
import { Image } from "../images/interfaces";

export type ResourceName =
  | "users"
  | "device"
  | "farm_events"
  | "images"
  | "logs"
  | "peripherals"
  | "crops"
  | "points"
  | "regimens"
  | "sequences"
  | "tools"
  | "users";

export interface TaggedResourceBase {
  kind: ResourceName;
  /** Unique identifier and index key.
   * We can't use the object's `id` attribute as a local index key because
   * unsaved objects don't have one.
   */
  uuid: string;
  body: object;
  dirty?: boolean | undefined;
  saving?: boolean | undefined;
}

export interface Resource<T extends ResourceName, U extends object>
  extends TaggedResourceBase {
  kind: T;
  body: U;
}

export type TaggedResource =
  | TaggedCrop
  | TaggedDevice
  | TaggedFarmEvent
  | TaggedGenericPointer
  | TaggedImage
  | TaggedLog
  | TaggedPeripheral
  | TaggedPlantPointer
  | TaggedRegimen
  | TaggedSequence
  | TaggedTool
  | TaggedToolSlotPointer
  | TaggedUser;

export type TaggedRegimen = Resource<"regimens", Regimen>;
export type TaggedTool = Resource<"tools", Tool>;
export type TaggedSequence = Resource<"sequences", Sequence>;
export type TaggedCrop = Resource<"crops", Crop>;
export type TaggedFarmEvent = Resource<"farm_events", FarmEvent>;
export type TaggedImage = Resource<"images", Image>;
export type TaggedLog = Resource<"logs", Log>;
export type TaggedPeripheral = Resource<"peripherals", Peripheral>;
export type TaggedGenericPointer = Resource<"points", GenericPointer>;
export type TaggedPlantPointer = Resource<"points", PlantPointer>;
export type TaggedToolSlotPointer = Resource<"points", ToolSlotPointer>;
export type TaggedUser = Resource<"users", User>;
export type TaggedDevice = Resource<"device", DeviceAccountSettings>;

/** Spot check to be certain a TaggedResource is what it says it is. */
export function sanityCheck(x: object) {
  if (isTaggedResource(x)) {
    assertUuid(x.kind, x.uuid);
    return true;
  } else {
    throw new Error("Bad kind, uuid, or body: " + JSON.stringify(x));
  }
}

export function isTaggedResource(x: object): x is TaggedResource {
  return (isObject(x)
    && isString(get(x, "kind"))
    && isString(get(x, "uuid"))
    && isObject(get(x, "body")))
}

let is = (r: ResourceName) => function isOfTag(x: object): x is TaggedResource {
  let safe = (sanityCheck(x) && isTaggedResource(x) && x.kind == r);
  if (!safe) {
    if (x) {
      throw new Error("Possible bad index");
    }
  }
  return safe;
};

export type PointerType =
  | TaggedToolSlotPointer
  | TaggedGenericPointer
  | TaggedPlantPointer;

function isTaggedPoint(x: any): x is PointerType {
  return (is("points")(x)) && (x.kind === "points");
}

export let isTaggedRegimen =
  (x: object): x is TaggedRegimen => is("regimens")(x);
export let isTaggedSequence =
  (x: object): x is TaggedSequence => is("sequences")(x);
export let isTaggedTool =
  (x: object): x is TaggedTool => is("tools")(x);
export let isTaggedCrop =
  (x: object): x is TaggedCrop => is("crops")(x);
export let isTaggedFarmEvent =
  (x: object): x is TaggedFarmEvent => is("farm_events")(x);
export let isTaggedLog =
  (x: object): x is TaggedLog => is("logs")(x);
export let isTaggedToolSlotPointer =
  (x: object): x is TaggedToolSlotPointer => {
    return isTaggedPoint(x) && (x.body.pointer_type === "ToolSlot")
  };
export let isTaggedPlantPointer =
  (x: object): x is TaggedPlantPointer => {
    return isTaggedPoint(x) && (x.body.pointer_type === "Plant")
  };
export let isTaggedGenericPointer =
  (x: object): x is TaggedGenericPointer => {
    return isTaggedPoint(x) && (x.body.pointer_type === "GenericPointer")
  }
