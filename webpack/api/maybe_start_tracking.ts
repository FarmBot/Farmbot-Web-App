import { ResourceName } from "../resources/tagged_resources";
import { startTracking } from "../connectivity/data_consistency";

const DONT_CARE: ResourceName[] = [
  "Log",
  "Image",
  "WebcamFeed",
  "User"
];

export function maybeStartTracking(uuid: string) {
  const forgetAboutIt = DONT_CARE.includes(uuid.split(".")[0] as ResourceName);
  return forgetAboutIt || startTracking();
}
