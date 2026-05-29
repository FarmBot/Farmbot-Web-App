import { TaggedPointGroup } from "farmbot";
import { Path } from "../internal_urls";

/** Find a group from a URL-provided ID. */
export const findGroupFromUrl = (groups: TaggedPointGroup[]) => {
  if (!Path.startsWith(Path.groups()) &&
    !Path.startsWith(Path.zones())) { return; }
  const groupId = parseInt(Path.getLastChunk());
  return groups.filter(group => group.body.id === groupId)[0];
};
