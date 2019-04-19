import { ResourceName } from "farmbot";
import { startTracking } from "../connectivity/data_consistency";
import { unpackUUID } from "../util";

const BLACKLIST: ResourceName[] = [
  "DiagnosticDump",
  "FbosConfig",
  "FirmwareConfig",
  "Image",
  "Log",
  "PlantTemplate",
  "SavedGarden",
  "SensorReading",
  "User",
  "WebAppConfig",
  "WebcamFeed",
  "Enigma",
];

export function maybeStartTracking(uuid: string) {
  const ignore = BLACKLIST.includes(unpackUUID(uuid).kind);
  ignore || startTracking(uuid);
}
