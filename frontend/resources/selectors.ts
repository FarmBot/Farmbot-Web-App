import { ResourceIndex, UUID } from "./interfaces";
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
  TaggedWeedPointer,
} from "farmbot";
import {
  isTaggedPlantPointer,
  isTaggedGenericPointer,
  isTaggedRegimen,
  isTaggedSequence,
  isTaggedToolSlotPointer,
  sanityCheck,
  isTaggedWeedPointer,
} from "./tagged_resources";
import { betterCompact, bail } from "../util";
import { findAllById } from "./selectors_by_id";
import {
  findPoints, selectAllPoints, selectAllActivePoints,
} from "./selectors_by_kind";
import { assertUuid } from "./util";
import { joinKindAndId } from "./reducer_support";
import { chain } from "lodash";
import { getWebAppConfig } from "./getters";
import { TimeSettings } from "../interfaces";
import { BooleanSetting } from "../session_keys";

export * from "./selectors_by_id";
export * from "./selectors_by_kind";
export * from "./selectors_for_indexing";

/** Similar to findId(), but does not throw exceptions. Do NOT use this method
 * unless there is actually a reason for the resource to not have a UUID.
 * `findId()` is more appropriate 99% of the time because it can spot
 * referential integrity issues. */
export const maybeDetermineUuid =
  (index: ResourceIndex, kind: ResourceName, id: number) => {
    const kni = joinKindAndId(kind, id);
    const uuid = index.byKindAndId[kni];
    if (uuid) {
      assertUuid(kind, uuid);
      return uuid;
    }
  };

export const findId = (index: ResourceIndex, kind: ResourceName, id: number): UUID => {
  const uuid = maybeDetermineUuid(index, kind, id);
  if (uuid) {
    return uuid;
  } else {
    throw new Error("UUID not found for id " + id);
  }
};

export const isKind = (resourceName: ResourceName) => (tr: TaggedResource) =>
  tr.kind === resourceName;

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

  if (resource?.kind === "Point") {
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

export function selectAllWeedPointers(index: ResourceIndex):
  TaggedWeedPointer[] {
  const weedPointers = selectAllPoints(index)
    .map(p => isTaggedWeedPointer(p) ? p : undefined);
  return betterCompact(weedPointers);
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

/** FINDS: All tools that are in use. */
export function toolsInUse(index: ResourceIndex): TaggedTool[] {
  const ids = betterCompact(selectAllToolSlotPointers(index)
    .map(ts => ts.body.tool_id));
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

export function maybeGetToolSlot(index: ResourceIndex,
  uuid: string | undefined): TaggedToolSlotPointer | undefined {
  return selectAllToolSlotPointers(index).filter(x => x.uuid === uuid)[0];
}

/** Return the UTC offset of current bot if possible. If not, use UTC (0). */
export function maybeGetTimeOffset(index: ResourceIndex): number {
  const dev = maybeGetDevice(index);
  return dev ? dev.body.tz_offset_hrs : 0;
}

/** Return 12/24hr time format preference if possible. If not, use 12hr. */
export function maybeGet24HourTimeSetting(index: ResourceIndex): boolean {
  const conf = getWebAppConfig(index);
  return conf ? conf.body[BooleanSetting.time_format_24_hour] : false;
}

export function maybeGetTimeSettings(index: ResourceIndex): TimeSettings {
  return {
    utcOffset: maybeGetTimeOffset(index),
    hour24: maybeGet24HourTimeSetting(index),
  };
}

export function maybeGetDevice(index: ResourceIndex): TaggedDevice | undefined {
  const dev = index.references[Object.keys(index.byKind.Device)[0] || "nope"];
  return (dev?.kind === "Device") ?
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
  if ((list.length === 1) && user?.kind === "User") {
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
