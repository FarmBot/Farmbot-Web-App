import { ResourceColor, TimeSettings } from "../interfaces";
import {
  TaggedResource,
  TaggedFirmwareConfig,
  TaggedFbosConfig,
  ResourceName,
} from "farmbot";
import {
  sortBy,
  merge,
  isNumber,
} from "lodash";
import moment from "moment";

export const colors: Array<ResourceColor> = [
  "blue",
  "green",
  "yellow",
  "orange",
  "purple",
  "pink",
  "gray",
  "red",
];

export function defensiveClone<T>(target: T): T {
  const jsonString = JSON.stringify(target);
  return JSON.parse(jsonString || "null");
}

/** Better than Array.proto.filter and compact() because the type checker
 * knows what's going on.
 */
export function betterCompact<T>(input: (T | undefined)[]): T[] {
  const output: T[] = [];
  input.forEach(x => x ? output.push(x) : "");
  return output;
}

/** Sorts a list of tagged resources. Unsaved resource get put on the end. */
export function sortResourcesById<T extends TaggedResource>(input: T[]): T[] {
  return sortBy(input, (x) => x.body.id || Infinity);
}

/**
 * Light wrapper around merge() to prevent common type errors / mistakes.
 *
 * NOTE:  If you rely solely on `betterMerge()` to combine array-bearing
 *   CeleryScript nodes, the API will reject them because they contain
 *   extra properties. The CS Corpus does not allow extra nodes for
 *   safety reasons.
 */
export function betterMerge<T, U>(target: T, update: U): T & U {
  return merge({}, target, update);
}

/** Like parseFloat, but allows you to control fallback value instead of
 * returning NaN. */
export function betterParseNum(num: string | undefined,
  fallback: number): number {
  try {
    const maybe = JSON.parse("" + num);
    if (isNumber(maybe) && !isNaN(maybe)) {
      return maybe;
    }
    // eslint-disable-next-line no-empty
  } catch (_) {
  }
  return fallback;
}
/** Determine if a string contains one of multiple values. */
export function oneOf(list: string[], target: string) {
  let matches = 0;
  list.map(x => target.includes(x) ? matches++ : "");
  return !!matches;
}

export type Primitive = boolean | string | number;

export function shortRevision() {
  return (globalConfig.SHORT_REVISION || "NONE").slice(0, 8);
}

export const trim = (i: string): string => i.replace(/\s+/g, " ");

/** When you have a ridiculously long chain of flags and need to convert it
 * into a binary integer. */
export function bitArray(...values: boolean[]) {
  return values
    .map((x): number => x ? 1 : 0)
    .reduce((res, x) => {
      // eslint-disable-next-line no-bitwise
      return res << 1 | x;
    });
}

/** Performs deep object comparison. ONLY WORKS ON JSON-y DATA TYPES. */
export const equals = <T>(a: T, b: T): boolean => {
  // Some benchmarks claim that this is slower than `_.isEqual`.
  // For whatever reason, this is not true for our application.
  return JSON.stringify(a) === JSON.stringify(b);
};

/** Used to scroll to the bottom of a sequence after adding a step. */
export function scrollToBottom(elementId: string) {
  const elToScroll = document.getElementById(elementId);
  if (!elToScroll) { return; }
  // Wait for the new element height and scroll to the bottom.
  setTimeout(() => elToScroll.scrollTop = elToScroll.scrollHeight, 1);
}

/**
 * Return FirmwareConfig if the data is valid.
 */
export function validFwConfig(config: TaggedFirmwareConfig | undefined):
  TaggedFirmwareConfig["body"] | undefined {
  return config ? config.body : undefined;
}

/**
 * Return FbosConfig if the data is valid.
 */
export function validFbosConfig(
  config: TaggedFbosConfig | undefined): TaggedFbosConfig["body"] | undefined {
  return config ? config.body : undefined;
}

interface BetterUUID {
  kind: ResourceName;
  localId: number;
  remoteId?: number;
}

export function unpackUUID(uuid: string): BetterUUID {
  const [kind, remoteId, localId] = uuid.split(".");
  const id = parseInt(remoteId, 10);
  return {
    kind: (kind as ResourceName),
    localId: parseInt(localId, 10),
    remoteId: id > 0 ? id : undefined
  };
}

/**
 * Integer parsed from float
 * since number type inputs allow floating point notation.
 */
export const parseIntInput = (input: string): number => {
  const int = parseInt("" + parseFloat(input).toFixed(1), 10);
  return int === 0 ? 0 : int;
};

export const timeFormatString =
  (timeSettings: TimeSettings | undefined): string => {
    const subHour = timeSettings?.seconds ? "mm:ss" : "mm";
    return timeSettings?.hour24 ? `H:${subHour}` : `h:${subHour}a`;
  };

export const formatTime =
  (momentTime: moment.Moment,
    timeSettings: TimeSettings,
    dateFormat = "",
  ) => {
    const datetimeSeparator = dateFormat ? ", " : "";
    const separator = dateFormat.includes("Y") ? " " : datetimeSeparator;
    const timeFormat = timeFormatString(timeSettings);
    return momentTime
      .utcOffset(timeSettings.utcOffset)
      .format(`${dateFormat}${separator}${timeFormat}`);
  };
