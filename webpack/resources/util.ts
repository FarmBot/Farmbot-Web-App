import { ResourceName } from "farmbot";
import { joinKindAndId } from "./reducer_support";
import { Dictionary } from "farmbot/dist";
import { betterCompact } from "../util";
import * as _ from "lodash";
import { ResourceIndex } from "./interfaces";

let count = 0;
export function generateUuid(id: number | undefined, kind: ResourceName) {
  return `${joinKindAndId(kind, id)}.${count++}`;
}

export function arrayWrap<T>(input: T | (T[])): T[] {
  return _.isArray(input) ? input : [input];
}
export function arrayUnwrap<T>(input: T | T[]): T {
  return _.isArray(input) ? input[0] : input;
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
    BAD NEWS!!! You thought this was a ${expected} UUID, but here's what it
    actually was:
      ${actual}
    `);
    return false;
  } else {
    return true;
  }
}
