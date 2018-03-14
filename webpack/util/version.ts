import { isString, isUndefined } from "lodash";
import { BotState, Feature, MinOsFeatureLookup } from "../devices/interfaces";
import { TaggedDevice } from "../resources/tagged_resources";

/**
 * for semverCompare()
 */
export enum SemverResult {
  LEFT_IS_GREATER = 1,
  RIGHT_IS_GREATER = -1,
  EQUAL = 0
}

/**
 * Determine which version string is greater.
 * Supports major, minor, and patch number comparison
 * and checks the presence of pre-release identifiers.
 *
 * CREDIT: https://github.com/substack/semver-compare
 *
 * @param left semver string, ex: "0.0.0-rc0"
 * @param right semver string, ex: "0.0.0-rc0"
 */
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
 * Conditionally display firmware settings based on
 * the user's current Arduino firmware version.
 *
 * @param current installed firmware version string ("0.0.0")
 * @param min minimum firmware version string required ("0.0.0")
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
 * for shouldDisplay()
 */
export enum MinVersionOverride {
  ALWAYS = "0.0.0",
  NEVER = "999.999.999",
}

/**
 * Determine whether a feature should be displayed based on
 * the user's current FBOS version. Min FBOS version feature data is pulled
 * from an external source to allow App and FBOS development flexibility.
 *
 * @param current installed OS version string to compare against data ("0.0.0")
 * @param lookupData min req versions data, for example {"feature": "1.0.0"}
 */
export function shouldDisplay(
  current: string | undefined, lookupData: MinOsFeatureLookup | undefined) {
  return function (feature: Feature): boolean {
    /** Escape hatch for platform developers doing offline development. */
    if (localStorage.getItem("IM_A_DEVELOPER")) {
      return true;
    }

    if (isString(current)) {
      const min = (lookupData || {})[feature] || MinVersionOverride.NEVER;
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
 * Compare the current FBOS version in the bot's
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
 *
 * @param stringyVersion version string to check ("0.0.0")
 * @param _EXPECTED_MAJOR minimum required major version number
 * @param _EXPECTED_MINOR minimum required minor version number
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
