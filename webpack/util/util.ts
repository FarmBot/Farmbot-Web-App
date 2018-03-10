import { t } from "i18next";
import * as _ from "lodash";
import { Dictionary } from "farmbot";
import { Color } from "../interfaces";
import { box } from "boxed_value";
import { TaggedResource, TaggedFirmwareConfig } from "../resources/tagged_resources";
import { history } from "../history";
import { BotLocationData } from "../devices/interfaces";
import { FirmwareConfig } from "../config_storage/firmware_configs";

// http://stackoverflow.com/a/901144/1064917
// Grab a query string param by name, because react-router-redux doesn't
// support query strings yet.
export function getParam(name: string): string {
  name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
  const regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
    r = regex.exec(location.search);
  // tslint:disable-next-line:no-null-keyword
  return r === null ? "" : decodeURIComponent(r[1].replace(/\+/g, " "));
}

export let colors: Array<Color> = [
  "blue",
  "green",
  "yellow",
  "orange",
  "purple",
  "pink",
  "gray",
  "red"
];

/** Picks a color that is compliant with sequence / regimen color codes */
export function randomColor(): Color {
  return _.sample(colors) || "gray";
}

export function defensiveClone<T>(target: T): T {
  const jsonString = JSON.stringify(target);
  return JSON.parse(jsonString || "null");
}

/** USAGE: DYNAMICALLY plucks `obj[key]`.
 *         * `undefined` becomes `""`
 *         * `number` types are coerced to strings (Eg: "5").
 *         * `boolean` is converted to "true" and "false" (a string).
 *         * All other types raise a runtime exception (Objects, functions,
 *           Array, Symbol, etc)
 */
export function safeStringFetch(obj: {}, key: string): string {
  const boxed = box((obj as Dictionary<{}>)[key]);
  switch (boxed.kind) {
    case "undefined":
    case "null":
      return "";
    case "number":
    case "string":
      return boxed.value.toString();
    case "boolean":
      return (boxed.value) ? "true" : "false";
    default:
      const msg = t(`Numbers strings and null only (got ${boxed.kind}).`);
      throw new Error(msg);
  }
}

/** Fancy debug */
export function fancyDebug<T extends {}>(d: T): T {
  console.log(Object
    .keys(d)
    .map(key => [key, (d as Dictionary<string>)[key]])
    .map((x) => {
      const key = _.padStart(x[0], 20, " ");
      const val = (JSON.stringify(x[1]) || "Nothing").slice(0, 52);

      return `${key} => ${val}`;
    })
    .join("\n"));
  return d;
}

export type CowardlyDictionary<T> = Dictionary<T | undefined>;
/** Sometimes, you are forced to pass a number type even though
 * the resource has no ID (usually for rendering purposes).
 * Example:
 *  farmEvent.id || 0
 *
 *  In those cases, you can use this constant to indicate intent.
 */
export const NOT_SAVED = -1;

export function isUndefined(x: object | undefined): x is undefined {
  return _.isUndefined(x);
}

/** Better than Array.proto.filter and _.compact() because the type checker
 * knows what's going on.
 */
export function betterCompact<T>(input: (T | undefined)[]): T[] {
  const output: T[] = [];
  input.forEach(x => x ? output.push(x) : "");
  return output;
}

/** Sorts a list of tagged resources. Unsaved resource get put on the end. */
export function sortResourcesById<T extends TaggedResource>(input: T[]): T[] {
  return _.sortBy(input, (x) => x.body.id || Infinity);
}

/** Light wrapper around _.merge() to prevent common type errors / mistakes. */
export function betterMerge<T, U>(target: T, update: U): T & U {
  return _.merge({}, target, update);
}

/** Like parseFloat, but allows you to control fallback value instead of
 * returning NaN. */
export function betterParseNum(num: string | undefined,
  fallback: number): number {
  try {
    const maybe = JSON.parse("" + num);
    if (_.isNumber(maybe) && !_.isNaN(maybe)) {
      return maybe;
    }
  } catch (_err) {
  }
  return fallback;
}
/** Determine if a string contains one of multiple values. */
export function oneOf(list: string[], target: string) {
  let matches = 0;
  list.map(x => target.includes(x) ? matches++ : "");
  return !!matches;
}

/** TODO: Upgrading to TSC 2.4, maybe we don't need this?
 * - RC 20 June 2016 */
type JSXChild = JSX.Element | JSX.Element[] | Primitive | undefined;
export type JSXChildren = JSXChild[] | JSXChild;

export type Primitive = boolean | string | number;

export function shortRevision() {
  return (globalConfig.SHORT_REVISION || "NONE").slice(0, 8);
}

/** When needing to reference the url in some js universally or vice versa. */
export function urlFriendly(stringToFormat: string) {
  return encodeURIComponent(stringToFormat.replace(/ /gi, "_").toLowerCase());
}

/** Get remainder of current url after the last "/". */
export function lastUrlChunk() {
  const p = history.getCurrentLocation().pathname;
  return p.split("/")[p.split("/").length - 1];
}

export const trim = (i: string): string => i.replace(/\s+/g, " ");

/** When you have a ridiculously long chain of flags and need to convert it
 * into a binary integer. */
export function bitArray(...values: boolean[]) {
  return values
    .map((x): number => x ? 1 : 0)
    .reduce((res, x) => {
      // tslint:disable-next-line:no-bitwise
      return res << 1 | x;
    });
}

// Thanks,
// https://italonascimento.github.io
//   /applying-a-timeout-to-your-promises/#implementing-the-timeout
export function withTimeout<T>(ms: number, promise: Promise<T>) {
  // Create a promise that rejects in <ms> milliseconds
  const timeout = new Promise((resolve, reject) => {
    const id = setTimeout(() => {
      clearTimeout(id);
      reject(`Timed out in  ${ms} ms.`);
    }, ms);
  });

  // Returns a race between our timeout and the passed in promise
  return Promise.race([promise, timeout]) as Promise<T>;
}

/** Performs deep object comparison. ONLY WORKS ON JSON-y DATA TYPES. */
export const equals = <T>(a: T, b: T): boolean => {
  // Some benchmarks claim that this is slower than `_.isEqual`.
  // For whatever reason, this is not true for our application.
  return JSON.stringify(a) === JSON.stringify(b);
};

export const timestamp = (date = new Date()) => Math.round(date.getTime());

/** Used to scroll to the bottom of a sequence after adding a step. */
export function scrollToBottom(elementId: string) {
  const elToScroll = document.getElementById(elementId);
  if (!elToScroll) { return; }

  // Wait for the new element height and scroll to the bottom.
  setTimeout(() => elToScroll.scrollTop = elToScroll.scrollHeight, 1);
}

export function validBotLocationData(
  botLocationData: BotLocationData | undefined): BotLocationData {
  if (botLocationData) {
    return botLocationData;
  }
  return {
    position: { x: undefined, y: undefined, z: undefined },
    scaled_encoders: { x: undefined, y: undefined, z: undefined },
    raw_encoders: { x: undefined, y: undefined, z: undefined },
  };
}

/**
 * Return FirmwareConfig if the data is valid.
 */
export function validFwConfig(
  config: TaggedFirmwareConfig | undefined): FirmwareConfig | undefined {
  return (config && config.body.api_migrated)
    ? config.body
    : undefined;
}
