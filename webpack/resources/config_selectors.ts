import { ResourceIndex } from "./interfaces";
import { TaggedWebAppConfig } from "./tagged_resources";

export function getWebAppConfig(i: ResourceIndex): TaggedWebAppConfig | undefined {
  const conf = i.references[i.byKind.WebAppConfig[0] || "NO"];
  if (conf && conf.kind === "WebAppConfig") {
    return conf;
  }
}
