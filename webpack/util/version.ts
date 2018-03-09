import { isString, get, isUndefined } from "lodash";
import { BotState } from "../devices/interfaces";
import { TaggedDevice } from "../resources/tagged_resources";

/**
 * semverCompare(): Determine which version string is greater.
 * Supports major, minor, and patch number comparison
 * and checks the presence of pre-release identifiers.
 * CREDIT: https://github.com/substack/semver-compare
 */

export enum SemverResult {
  LEFT_IS_GREATER = 1,
  RIGHT_IS_GREATER = -1,
  EQUAL = 0
}

export function semverCompare(left: string, right: string): SemverResult {
  const leftSemVer = left.split("-")[0];
  const rightSemVer = right.split("-")[0];
  const leftHasSuffix = left.includes("-");
  const rightHasSuffix = right.includes("-");
  const pa: Array<string | undefined> = leftSemVer.split(".");
  const pb: Array<string | undefined> = rightSemVer.split(".");
  for (let i = 0; i < 3; i++) {
    const num_left = Number(pa[i]);
    const num_right = Number(pb[i]);

    if (num_left > num_right) {
      return SemverResult.LEFT_IS_GREATER;
    }

    if (num_right > num_left) {
      return SemverResult.RIGHT_IS_GREATER;
    }

    if (!isNaN(num_left) && isNaN(num_right)) {
      return SemverResult.LEFT_IS_GREATER;
    }

    if (isNaN(num_left) && !isNaN(num_right)) {
      return SemverResult.RIGHT_IS_GREATER;
    }

  }

  // num_left === num_right. Check presence of pre-release identifiers.
  if (!leftHasSuffix && rightHasSuffix) {
    return SemverResult.LEFT_IS_GREATER;
  }

  if (leftHasSuffix && !rightHasSuffix) {
    return SemverResult.RIGHT_IS_GREATER;
  }

  return SemverResult.EQUAL;
}

/**
 * minFwVersionCheck(): Conditionally display firmware settings based on
 * the user's current Arduino firmware version.
 */

export function minFwVersionCheck(current: string | undefined, min: string) {
  if (isString(current)) {
    switch (semverCompare(current.slice(0, -1), min)) {
      case SemverResult.LEFT_IS_GREATER:
      case SemverResult.EQUAL:
        return true;
      default:
        return false;
    }
  } else {
    return false;
  }
}

/**
 * shouldDisplay(): Determine whether a feature should be displayed based on
 * the user's current FBOS version. Min FBOS version feature data is pulled
 * from an external source to allow App and FBOS development flexibility.
 */

export enum MinVersionOverride {
  ALWAYS = "0.0.0",
  NEVER = "999.999.999",
}

export function shouldDisplay(
  current: string | undefined, lookupData: string | undefined) {
  return function (feature: string): boolean {
    if (isString(current)) {
      let minOsVersionFeatureLookup = {};
      try {
        minOsVersionFeatureLookup = JSON.parse(lookupData || "{}");
      } catch (e) {
        throw new Error(`Error parsing '${lookupData}', falling back to '{}'`);
      }
      const min = get(minOsVersionFeatureLookup, feature,
        MinVersionOverride.NEVER);
      switch (semverCompare(current, min)) {
        case SemverResult.LEFT_IS_GREATER:
        case SemverResult.EQUAL:
          return true;
        default:
          return false;
      }
    }
    return false;
  };
}

/**
 * determineInstalledOsVersion(): Compare the current FBOS version in the bot's
 * state with the API's fbos_version string and return the greatest version.
 */

export function determineInstalledOsVersion(
  bot: BotState, device: TaggedDevice | undefined): string | undefined {
  const fromBotState = bot.hardware.informational_settings.controller_version;
  const fromAPI = device ? device.body.fbos_version : undefined;
  if (isUndefined(fromBotState) && isUndefined(fromAPI)) { return undefined; }
  switch (semverCompare(fromBotState || "", fromAPI || "")) {
    case SemverResult.LEFT_IS_GREATER:
    case SemverResult.EQUAL:
      return fromBotState === "" ? undefined : fromBotState;
    case SemverResult.RIGHT_IS_GREATER:
      return fromAPI === "" ? undefined : fromAPI;
    default:
      return undefined;
  }
}

/**
 * Compare installed FBOS version against the lowest version compatible
 * with the web app to lock out incompatible FBOS versions from the App.
 * It uses a different method than semverCompare() to only look at
 * major and minor numeric versions and ignores patch and pre-release
 * identifiers.
 */

export function versionOK(stringyVersion = "0.0.0",
  _EXPECTED_MAJOR: number,
  _EXPECTED_MINOR: number) {
  const [actual_major, actual_minor] = stringyVersion
    .split(".")
    .map(x => parseInt(x, 10));
  if (actual_major > _EXPECTED_MAJOR) {
    return true;
  } else {
    const majorOK = (actual_major == _EXPECTED_MAJOR);
    const minorOK = (actual_minor >= _EXPECTED_MINOR);
    return (majorOK && minorOK);
  }
}
