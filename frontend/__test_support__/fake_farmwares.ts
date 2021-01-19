import { Farmwares, FarmwareManifestInfo } from "../farmware/interfaces";
import { FarmwareManifest as FarmwareManifestV2 } from "farmbot";

export function fakeFarmware(fwName = "My Fake Farmware"): FarmwareManifestInfo {
  return {
    name: fwName,
    installation_pending: false,
    url: "https://",
    config: [{ name: "config_1", label: "Config 1", value: "4" }],
    meta: {
      fbos_version: ">=3.0.0",
      farmware_tools_version: ">=1.0.0",
      description: "Does things.",
      language: "forth",
      version: "0.0.0",
      author: "me",
    }
  };
}

export function fakeFarmwares(): Farmwares {
  return {
    "farmware_0": fakeFarmware()
  };
}

export const fakeFarmwareManifestV2 = (): FarmwareManifestV2 => ({
  farmware_manifest_version: "2.0",
  package: "My Fake Farmware",
  package_version: "0.0.0",
  description: "Also does things.",
  author: "you",
  language: "forth",
  executable: "forth",
  args: "my_farmware.fth",
  config: {},
  farmbot_os_version_requirement: ">=3.0.0",
  farmware_tools_version_requirement: ">=0.0.0",
  url: "https://",
  zip: "https://",
});
