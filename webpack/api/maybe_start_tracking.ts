import { ResourceName } from "../resources/tagged_resources";
import { startTracking } from "../connectivity/data_consistency";

const BLACKLIST: ResourceName[] = [
  "Log",
  "Image",
  "WebcamFeed",
  "User",
  "WebAppConfig",
  "FbosConfig",
  "FirmwareConfig",
];

export function maybeStartTracking(uuid: string) {
  const ignore = BLACKLIST.includes(uuid.split(".")[0] as ResourceName);
  ignore || startTracking(uuid);
}
