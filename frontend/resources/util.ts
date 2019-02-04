import { ResourceName } from "farmbot";
import { Dictionary } from "farmbot/dist";
import { betterCompact } from "../util";
import { isArray } from "lodash";
import { ResourceIndex } from "./interfaces";
import { joinKindAndId } from "./reducer_support";

let count = 0;
export function generateUuid(id: number | undefined, kind: ResourceName) {
  return `${joinKindAndId(kind, id)}.${count++}`;
}

export function arrayWrap<T>(input: T | (T[])): T[] {
  return isArray(input) ? input : [input];
}

/** For when you have an array that is guaranteed to have a length of 1 */
export function arrayUnwrap<T>(input: T | T[]): T {
  return isArray(input) ? input[0] : input;
}

export function entries<T>(input: Dictionary<T | undefined>): T[] {
  const x = Object.keys(input).map(key => input[key]);
  const y = betterCompact(x);
  return y;
}

export function hasId(ri: ResourceIndex, k: ResourceName, id: number): boolean {
  return !!ri.byKindAndId[joinKindAndId(k, id)];
}

export function assertUuid(expected: ResourceName, actual: string | undefined) {
  if (actual && !actual.startsWith(expected)) {
    console.warn(`
    UUID integrity warning! Application expected ${expected} type, but instead
    received "${actual}"`);
    return false;
  } else {
    return true;
  }
}
