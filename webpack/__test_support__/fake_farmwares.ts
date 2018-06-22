import { Farmwares } from "../farmware/interfaces";
import { FarmwareManifest } from "farmbot";

export function fakeFarmware(): FarmwareManifest {
  return {
    name: "My Fake Farmware",
    uuid: "farmware_0",
    executable: "forth",
    args: ["my_farmware.fth"],
    url: "https://",
    path: "my_farmware",
    config: [{ name: "config_1", label: "Config 1", value: "4" }],
    meta: {
      min_os_version_major: "3",
      description: "Does things.",
      language: "forth",
      version: "0.0.0",
      author: "me",
      zip: "https://"
    }
  };
}

export function fakeFarmwares(): Farmwares {
  return {
    "farmware_0": fakeFarmware()
  };
}
