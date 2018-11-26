import { TaggedResource } from "farmbot/dist/resources/tagged_resource";
import { ResourceIndex } from "./interfaces";
import { isTaggedResource } from "./tagged_resources";
import { sortResourcesById } from "../util/util";

/** Finds all resource where the `kind` attribute is equal to `kind` parameter.
 * Also performs basic runtime schema checks. */
export function findAll<T extends TaggedResource>(
  index: ResourceIndex, kind: T["kind"]): T[] {
  const results: T[] = [];

  Object.keys(index.byKind[kind]).map(function (uuid) {
    const item = index.references[uuid];
    if (item && isTaggedResource(item) && (item.kind === kind)) {
      results.push(item as T);
    }
  });
  return sortResourcesById(results) as T[];
}
