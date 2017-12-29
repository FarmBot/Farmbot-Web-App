import { ResourceName } from "../resources/tagged_resources";
import { startTracking } from "../connectivity/data_consistency";

const BLACKLIST: ResourceName[] = [
  "Log",
  "Image",
  "WebcamFeed",
  "User"
];

export function maybeStartTracking(uuid: string, location: string) {
  const ignore = BLACKLIST.includes(uuid.split(".")[0] as ResourceName);
  ignore || startTracking(uuid, location);
}
