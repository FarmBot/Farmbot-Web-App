import { ResourceName } from "farmbot";
import { startTracking } from "../connectivity/data_consistency";
import { unpackUUID } from "../util";

const IGNORE_LIST: ResourceName[] = [
  "Curve",
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
  "WizardStepResult",
  "Telemetry",
  "Alert",
  "Folder",
];

export function maybeStartTracking(uuid: string) {
  const ignore = IGNORE_LIST.includes(unpackUUID(uuid).kind);
  ignore || startTracking(uuid);
}
