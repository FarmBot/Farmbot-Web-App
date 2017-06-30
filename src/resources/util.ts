import { ResourceName } from "./tagged_resources";
import { joinKindAndId } from "./reducer";
import { Dictionary } from "farmbot/dist";
import { betterCompact } from "../util";
import * as _ from "lodash";

var count = 0;
export function generateUuid(id: number | undefined, kind: ResourceName) {
  return `${joinKindAndId(kind, id)}.${count++}`
}

export function arrayWrap<T>(input: T | (T[])): T[] {
  return _.isArray(input) ? input : [input];
}

export function entries<T>(input: Dictionary<T | undefined>): T[] {
  let x = Object.keys(input).map(key => input[key]);
  let y = betterCompact(x);
  return y;
}
