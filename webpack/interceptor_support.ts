import { DataChangeType, Dictionary, toPairs, rpcRequest, Pair } from "farmbot/dist";
import { getDevice } from "./device";
import { box } from "boxed_value";
import * as _ from "lodash";
import { ResourceName } from "./resources/tagged_resources";

export let METHOD_MAP: Dictionary<DataChangeType> = {
  "post": "add",
  "put": "update",
  "patch": "update",
  "delete": "remove"
};
export let METHODS = ["post", "put", "patch", "delete"];

/** Temporary stub until auto_sync rollout. TODO: Remove */
const RESOURNCE_NAME_IN_URL = [
  "device",
  "farm_events",
  "logs",
  "peripherals",
  "plants",
  "points",
  "regimens",
  "sequences",
  "tool_slots",
  "tools"
];

// LEGACY API. This was a temporary solution that was superceded by the auto
// sync feature. End of life: 1 Jan 2018
interface DataUpdateEndOfLife {
  kind: "data_update";
  args: {
    value: string;
  };
  comment?: string | undefined;
  body?: Pair[] | undefined;
}

// LEGACY API. This was a temporary solution that was superceded by the auto
// sync feature. End of life: 1 Jan 2018
export function notifyBotOfChanges(url: string | undefined,
  action: DataChangeType, uuid: string) {
  if (url) {
    url
      .split("/")
      .filter((chunk: ResourceName) => {
        return RESOURNCE_NAME_IN_URL.includes(chunk);
      }).map(async function (resource: ResourceName) {
        const data_update: DataUpdateEndOfLife = {
          kind: "data_update",
          args: { value: action },
          body: toPairs({ [resource]: inferUpdateId(url) })
        };
        getDevice().publish(rpcRequest([data_update as any]));
      });
  }
}

/** More nasty hacks until we have time to implement proper API push state
 * notifications. */
export function inferUpdateId(url: string) {
  try {
    const ids = url
      .split("/")
      .filter(x => !x.includes(",")) // Don't allow batch endpoints to participate.
      .map(x => parseInt(x, 10))
      .filter(x => !_.isNaN(x));
    const id: number | undefined = ids[0];
    const isNum = _.isNumber(id);
    const onlyOne = ids.length === 1;
    return (isNum && onlyOne) ? ("" + id) : "*";
  } catch (error) { // Don't crash - just keep moving along. This is a temp patch.
    return "*";
  }
}

/** The input of an axios error interceptor is an "any" type.
 * Sometimes it will be a real Axios error, other times it will not be.
 */
export interface SafeError {
  response: {
    status: number;
  };
}

/** Prevents hard-to-find NPEs and type errors inside of interceptors. */
export function isSafeError(x: SafeError | any): x is SafeError {
  return !!(
    (box(x).kind === "object") &&
    (box(x.response).kind === "object") &&
    (box(x.response.status).kind === "number"));
}
