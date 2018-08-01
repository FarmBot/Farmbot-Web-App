import { ResourceName } from "farmbot";
import { startTracking } from "../connectivity/data_consistency";

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
];

export function maybeStartTracking(uuid: string) {
  const ignore = BLACKLIST.includes(uuid.split(".")[0] as ResourceName);
  ignore || startTracking(uuid);
}
