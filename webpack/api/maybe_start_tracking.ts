import { ResourceName } from "../resources/tagged_resources";
import { startTracking } from "../connectivity/data_consistency";

const BLACKLIST: ResourceName[] = [
  "Log",
  "Image",
  "WebcamFeed",
  "User"
];

export function maybeStartTracking(uuid: string) {
  const ignore = BLACKLIST.includes(uuid.split(".")[0] as ResourceName);
  console.log(`
  ${JSON.stringify(BLACKLIST)}.includes(${JSON.stringify(uuid.split(".")[0])})
  => ${JSON.stringify(ignore)}
  `);
  ignore || console.log("Will track");
  return ignore || startTracking();
}
