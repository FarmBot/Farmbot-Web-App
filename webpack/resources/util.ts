import { ResourceName } from "./tagged_resources";
import { joinKindAndId } from "./reducer";
import { Dictionary } from "farmbot/dist";
import { betterCompact } from "../util";
import * as _ from "lodash";

let count = 0;
export function generateUuid(id: number | undefined, kind: ResourceName) {
  return `${joinKindAndId(kind, id)}.${count++}`;
}

export function arrayWrap<T>(input: T | (T[])): T[] {
  return _.isArray(input) ? input : [input];
}

export function entries<T>(input: Dictionary<T | undefined>): T[] {
  const x = Object.keys(input).map(key => input[key]);
  const y = betterCompact(x);
  return y;
}
