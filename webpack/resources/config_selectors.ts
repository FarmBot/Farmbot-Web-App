import { ResourceIndex } from "./interfaces";
import { TaggedWebAppConfig, TaggedFbosConfig } from "./tagged_resources";

export function getWebAppConfig(i: ResourceIndex): TaggedWebAppConfig | undefined {
  const conf = i.references[i.byKind.WebAppConfig[0] || "NO"];
  if (conf && conf.kind === "WebAppConfig") {
    return conf;
  }
}

export function getFbosConfig(i: ResourceIndex): TaggedFbosConfig | undefined {
  const conf = i.references[i.byKind.FbosConfig[0] || "NO"];
  if (conf && conf.kind === "FbosConfig") {
    return conf;
  }
}
