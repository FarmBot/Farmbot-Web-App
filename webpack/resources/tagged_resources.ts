import { Sequence } from "../sequences/interfaces";
import { Tool } from "../tools/interfaces";
import { Regimen } from "../regimens/interfaces";
import { FarmEvent, Crop } from "../farm_designer/interfaces";
import {
  Log,
  GenericPointer,
  PlantPointer,
  ToolSlotPointer,
  SensorReading,
  Sensor,
} from "../interfaces";
import { Peripheral } from "../controls/peripherals/interfaces";
import { User } from "../auth/interfaces";
import { assertUuid } from "./selectors";
import { DeviceAccountSettings } from "../devices/interfaces";
import { isObject, isString, get } from "lodash";
import { Image } from "../farmware/images/interfaces";
import { betterCompact } from "../util";
import * as _ from "lodash";
import { WebcamFeed } from "../controls/interfaces";
import { FbosConfig } from "../config_storage/fbos_configs";
import { FirmwareConfig } from "../config_storage/firmware_configs";
import { WebAppConfig } from "../config_storage/web_app_configs";
import { FarmwareInstallation } from "../farmware/interfaces";

export type ResourceName =
  | "Crop"
  | "Device"
  | "FarmEvent"
  | "FbosConfig"
  | "FirmwareConfig"
  | "Image"
  | "Log"
  | "Peripheral"
  | "Plant"
  | "Point"
  | "Regimen"
  | "Sensor"
  | "SensorReading"
  | "Sequence"
  | "Tool"
  | "User"
  | "WebAppConfig"
  | "WebcamFeed"
  | "FarmwareInstallation";

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

/** Denotes special status of resource */
export enum SpecialStatus {
  /** The local copy is different than the one on the remote end. */
  DIRTY = "DIRTY",
  /** The local copy is being saved on the remote end right now? */
  SAVING = "SAVING",
  /** API and FE are in sync. Using "" for now because its falsey like old
   * `undefined` value */
  SAVED = ""
}

/** Given an array of TaggedResources, returns the most "important" special status.
 * the hierarchy is SAVED => DIRTY => SAVING  */
export function getArrayStatus(i: TaggedResource[]): SpecialStatus {
  const r = betterCompact(_(i).map(x => x.specialStatus).uniq().value());
  if (r.length) {
    return (r.includes(SpecialStatus.SAVING)) ?
      SpecialStatus.SAVING : SpecialStatus.DIRTY;
  } else {
    return SpecialStatus.SAVED;
  }
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
  | TaggedFbosConfig
  | TaggedFirmwareConfig
  | TaggedImage
  | TaggedLog
  | TaggedPeripheral
  | TaggedPoint
  | TaggedRegimen
  | TaggedSensor
  | TaggedSensorReading
  | TaggedSequence
  | TaggedTool
  | TaggedUser
  | TaggedWebAppConfig
  | TaggedWebcamFeed
  | TaggedFarmwareInstallation;

export type TaggedRegimen = Resource<"Regimen", Regimen>;
export type TaggedTool = Resource<"Tool", Tool>;
export type TaggedSequence = Resource<"Sequence", Sequence>;
export type TaggedCrop = Resource<"Crop", Crop>;
export type TaggedFarmEvent = Resource<"FarmEvent", FarmEvent>;
export type TaggedImage = Resource<"Image", Image>;
export type TaggedLog = Resource<"Log", Log>;
export type TaggedPeripheral = Resource<"Peripheral", Peripheral>;
export type TaggedFbosConfig = Resource<"FbosConfig", FbosConfig>;
export type TaggedFirmwareConfig = Resource<"FirmwareConfig", FirmwareConfig>;
export type TaggedWebAppConfig = Resource<"WebAppConfig", WebAppConfig>;
export type TaggedSensorReading = Resource<"SensorReading", SensorReading>;
export type TaggedSensor = Resource<"Sensor", Sensor>;

type PointUnion = GenericPointer | PlantPointer | ToolSlotPointer;

export type TaggedGenericPointer = Resource<"Point", GenericPointer>;
export type TaggedPlantPointer = Resource<"Point", PlantPointer>;
export type TaggedToolSlotPointer = Resource<"Point", ToolSlotPointer>;

export type TaggedPoint = Resource<"Point", PointUnion>;

export type TaggedUser = Resource<"User", User>;
export type TaggedDevice = Resource<"Device", DeviceAccountSettings>;
export type TaggedWebcamFeed = Resource<"WebcamFeed", WebcamFeed>;
export type TaggedFarmwareInstallation =
  Resource<"FarmwareInstallation", FarmwareInstallation>;

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
  return (isObject(x)
    && isString(get(x, "kind"))
    && isString(get(x, "uuid"))
    && isObject(get(x, "body")));
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

export type PointerType =
  | TaggedToolSlotPointer
  | TaggedGenericPointer
  | TaggedPlantPointer;

function isTaggedPoint(x: {}): x is PointerType {
  return (is("Point")(x)) && (x.kind === "Point");
}

export let isTaggedRegimen =
  (x: object): x is TaggedRegimen => is("Regimen")(x);
export let isTaggedSequence =
  (x: object): x is TaggedSequence => is("Sequence")(x);
export let isTaggedTool =
  (x: object): x is TaggedTool => is("Tool")(x);
export let isTaggedCrop =
  (x: object): x is TaggedCrop => is("Crop")(x);
export let isTaggedFarmEvent =
  (x: object): x is TaggedFarmEvent => is("FarmEvent")(x);
export let isTaggedLog =
  (x: object): x is TaggedLog => is("Log")(x);
export let isTaggedToolSlotPointer =
  (x: object): x is TaggedToolSlotPointer => {
    return isTaggedPoint(x) && (x.body.pointer_type === "ToolSlot");
  };
export let isTaggedPlantPointer =
  (x: object): x is TaggedPlantPointer => {
    return isTaggedPoint(x) && (x.body.pointer_type === "Plant");
  };
export let isTaggedGenericPointer =
  (x: object): x is TaggedGenericPointer => {
    return isTaggedPoint(x) && (x.body.pointer_type === "GenericPointer");
  };
