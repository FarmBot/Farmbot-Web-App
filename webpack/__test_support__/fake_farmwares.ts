import { Dictionary, FarmwareManifest } from "farmbot";

export function fakeFarmwares(): Dictionary<FarmwareManifest | undefined> {
  return {
    "farmware_0": {
      name: "My Farmware",
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
    }
  };
}
