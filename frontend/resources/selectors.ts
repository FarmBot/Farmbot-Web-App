import { ResourceIndex } from "./interfaces";
import {
  ResourceName,
  TaggedGenericPointer,
  TaggedPlantPointer,
  TaggedRegimen,
  TaggedResource,
  TaggedSequence,
  TaggedTool,
  TaggedToolSlotPointer,
  TaggedUser,
  TaggedDevice,
} from "farmbot";
import {
  isTaggedPlantPointer,
  isTaggedGenericPointer,
  isTaggedRegimen,
  isTaggedSequence,
  isTaggedTool,
  isTaggedToolSlotPointer,
  sanityCheck,
} from "./tagged_resources";
import { betterCompact, bail } from "../util";
import { findAllById } from "./selectors_by_id";
import { findPoints, selectAllPoints, selectAllActivePoints } from "./selectors_by_kind";
import { assertUuid } from "./util";
import { joinKindAndId } from "./reducer_support";
import { chain } from "lodash";

export * from "./selectors_by_id";
export * from "./selectors_by_kind";
export * from "./selectors_for_indexing";

/** Similar to findId(), but does not throw exceptions. Do NOT use this method
 * unless there is actually a reason for the resource to not have a UUID.
 * `findId()` is more appropriate 99% of the time because it can spot
 * referential integrity issues. */
export let maybeDetermineUuid =
  (index: ResourceIndex, kind: ResourceName, id: number) => {
    const kni = joinKindAndId(kind, id);
    const uuid = index.byKindAndId[kni];
    if (uuid) {
      assertUuid(kind, uuid);
      return uuid;
    }
  };

export let findId = (index: ResourceIndex, kind: ResourceName, id: number) => {
  const uuid = maybeDetermineUuid(index, kind, id);
  if (uuid) {
    return uuid;
  } else {
    throw new Error("UUID not found for id " + id);
  }
};

export let isKind = (name: ResourceName) => (tr: TaggedResource) => tr.kind === name;

export function groupPointsByType(index: ResourceIndex) {
  return chain(selectAllActivePoints(index))
    // If this fails to compile....
    .tap(x => x[0].body.pointer_type)
    // ... this line must be updated:
    .groupBy("body.pointer_type")
    .value();
}

export function findPointerByTypeAndId(index: ResourceIndex,
  pt: string,
  id: number) {
  const pni = joinKindAndId("Point", id);
  const uuid = "" + index.byKindAndId[pni];
  const resource = index.references[uuid];

  if (resource && resource.kind === "Point") {
    return resource;
  } else {
    // We might have a sequence dependency leak if this exception is ever
    // thrown.
    throw new Error(`Tried to fetch bad point ${pt} ${id}`);
  }
}

export function selectAllGenericPointers(index: ResourceIndex):
  TaggedGenericPointer[] {
  const genericPointers = selectAllPoints(index)
    .map(p => isTaggedGenericPointer(p) ? p : undefined);
  return betterCompact(genericPointers);
}

export function selectAllPlantPointers(index: ResourceIndex): TaggedPlantPointer[] {
  const plantPointers = selectAllActivePoints(index)
    .map(p => isTaggedPlantPointer(p) ? p : undefined);
  return betterCompact(plantPointers);
}

export function selectAllToolSlotPointers(index: ResourceIndex):
  TaggedToolSlotPointer[] {
  const toolSlotPointers = selectAllActivePoints(index)
    .map(p => isTaggedToolSlotPointer(p) ? p : undefined);
  return betterCompact(toolSlotPointers);
}

export function findToolSlot(i: ResourceIndex, uuid: string): TaggedToolSlotPointer {
  const ts = selectAllToolSlotPointers(i).filter(x => x.uuid === uuid)[0];
  if (ts) {
    return ts;
  } else {
    throw new Error("ToolSlotPointer not found: " + uuid);
  }
}

export function findPlant(i: ResourceIndex, uuid: string):
  TaggedPlantPointer {
  const point = findPoints(i, uuid);
  if (point && sanityCheck(point) && point.body.pointer_type === "Plant") {
    return point as TaggedPlantPointer;
  } else {
    throw new Error("That is not a true plant pointer");
  }
}
export function selectCurrentToolSlot(index: ResourceIndex, uuid: string) {
  const x = index.references[uuid];
  if (x && isTaggedToolSlotPointer(x)) {
    return x;
  } else {
    throw new Error("selectCurrentToolSlot: Not a tool slot: ");
  }
}

export function getRegimenByUUID(index: ResourceIndex, uuid: string) {
  assertUuid("Regimen", uuid);
  return index.references[uuid];
}

export function getSequenceByUUID(index: ResourceIndex,
  uuid: string): TaggedSequence {
  assertUuid("Sequence", uuid);
  const result = index.references[uuid];
  if (result && isTaggedSequence(result)) {
    return result;
  } else {
    throw new Error("BAD Sequence UUID;");
  }
}

/** GIVEN: a slot UUID.
 *  FINDS: Tool in that slot (if any) */
export let currentToolInSlot = (index: ResourceIndex) =>
  (toolSlotUUID: string): TaggedTool | undefined => {
    const currentSlot = selectCurrentToolSlot(index, toolSlotUUID);
    if (currentSlot
      && currentSlot.kind === "Point") {
      const toolUUID = index
        .byKindAndId[joinKindAndId("Tool", currentSlot.body.tool_id)];
      const tool = index.references[toolUUID || "NOPE!"];
      if (tool && isTaggedTool(tool)) {
        return tool;
      }
    }
  };

/** FINDS: All tools that are in use. */
export function toolsInUse(index: ResourceIndex): TaggedTool[] {
  const ids = betterCompact(selectAllToolSlotPointers(index).map(ts => ts.body.tool_id));
  return findAllById(index, ids, "Tool") as TaggedTool[];
}

export function maybeGetSequence(index: ResourceIndex,
  uuid: string | undefined): TaggedSequence | undefined {
  if (uuid) {
    return getSequenceByUUID(index, uuid);
  } else {
    return undefined;
  }
}

export function maybeGetRegimen(index: ResourceIndex,
  uuid: string | undefined): TaggedRegimen | undefined {
  const tr = uuid && getRegimenByUUID(index, uuid);
  if (tr && isTaggedRegimen(tr)) { return tr; }
}

/** Return the UTC offset of current bot if possible. If not, use UTC (0). */
export function maybeGetTimeOffset(index: ResourceIndex): number {
  const dev = maybeGetDevice(index);
  return dev ? dev.body.tz_offset_hrs : 0;
}

export function maybeGetDevice(index: ResourceIndex): TaggedDevice | undefined {
  const dev = index.references[Object.keys(index.byKind.Device)[0] || "nope"];
  return (dev && dev.kind === "Device") ?
    dev : undefined;
}

export const getDeviceAccountSettings =
  (index: ResourceIndex): TaggedDevice => {
    const device = maybeGetDevice(index);
    switch (Object.keys(index.byKind.Device).length) {
      case 0: return bail(`Tried to load device before it was loaded.`);
      case 1: return device ? device : bail("Malformed device!");
      default: return bail("Found more than 1 device");
    }
  };

export function maybeFetchUser(index: ResourceIndex):
  TaggedUser | undefined {
  const list = Object.keys(index.byKind.User);
  const uuid = list[0];
  const user = index.references[uuid || -1];

  if (user && sanityCheck(user) && list.length > 1) {
    throw new Error("PROBLEM: Expected 1 user. Got: " + list.length);
  }
  if ((list.length === 1) && user && user.kind === "User") {
    return user;
  } else {
    return undefined;
  }
}
export function getUserAccountSettings(index: ResourceIndex): TaggedUser {
  const user = maybeFetchUser(index);
  if (user) {
    return user;
  } else {
    throw new Error(`PROBLEM: Tried to fetch user before it was available.`);
  }
}

export function all(index: ResourceIndex) {
  return betterCompact(Object.keys(index.all).map(uuid => index.references[uuid]));
}
