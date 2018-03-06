import { TaggedWebAppConfig, ResourceIndex } from "./interfaces";

export function getWebAppConfig(i: ResourceIndex): TaggedWebAppConfig | undefined {
  const conf = i.references[i.byKind.WebAppConfig[0] || "NO"];
  if (conf && conf.kind === "WebAppConfig") {
    return conf;
  }
}
