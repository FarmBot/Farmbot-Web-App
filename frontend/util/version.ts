import { isUndefined } from "lodash";
import { BotState, Feature, MinOsFeatureLookup } from "../devices/interfaces";
import { TaggedDevice } from "farmbot";

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
  const leftRc = parseInt(left.toLowerCase().split("rc")[1]);
  const rightRc = parseInt(right.toLowerCase().split("rc")[1]);
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

  if (leftRc > rightRc) {
    return SemverResult.LEFT_IS_GREATER;
  }

  if (rightRc > leftRc) {
    return SemverResult.RIGHT_IS_GREATER;
  }

  return SemverResult.EQUAL;
}

/**
 * for shouldDisplay()
 */
export enum MinVersionOverride {
  DEMO = "99.99.99",
  NEVER = "999.999.999",
}

export enum FbosVersionFallback {
  NULL = "0.0.0",
}

const fallbackData: MinOsFeatureLookup = {
  [Feature.express_k12]: MinVersionOverride.NEVER, // available: "15.4.6",
  [Feature.planted_at_now]: MinVersionOverride.NEVER,
};

/**
 * Determine whether a feature should be displayed based on
 * the user's current FBOS version. Min FBOS version feature data is pulled
 * from an external source to allow App and FBOS development flexibility.
 * Device-less accounts can use features compatible with supported versions.
 *
 * @param current installed OS version string to compare against data ("0.0.0")
 * @param lookupData min req versions data, for example {"feature": "1.0.0"}
 */
export function createShouldDisplayFn(
  current: string | undefined,
  lookupData: MinOsFeatureLookup | undefined,
  override: string | undefined) {
  return function (feature: Feature): boolean {
    const fallback = globalConfig.FBOS_END_OF_LIFE_VERSION ||
      FbosVersionFallback.NULL;
    const target = override || current || fallback;
    const table = lookupData || fallbackData;
    const min = table[feature] || fallbackData[feature] || MinVersionOverride.NEVER;
    switch (semverCompare(target, min)) {
      case SemverResult.LEFT_IS_GREATER:
      case SemverResult.EQUAL:
        return true;
      default:
        return false;
    }
  };
}

/**
 * Compare the current FBOS version in the bot's
 * state with the API's fbos_version string and return the greatest version. */
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
  }
}

const parseVersion = (version: string) =>
  version.split(".").map(x => parseInt(x, 10));

/**
 * Compare installed FBOS version against the lowest version compatible
 * with the web app to lock out incompatible FBOS versions from the App.
 * It uses a different method than semverCompare() to only look at
 * major and minor numeric versions and ignores patch and pre-release
 * identifiers.
 *
 * @param stringyVersion version string to check ("0.0.0")
 */
export function versionOK(stringyVersion = "0.0.0") {
  const [actual_major, actual_minor] = parseVersion(stringyVersion);
  const [EXPECTED_MAJOR, EXPECTED_MINOR] =
    parseVersion(globalConfig.MINIMUM_FBOS_VERSION || "6.0.0");
  if (actual_major > EXPECTED_MAJOR) {
    return true;
  } else {
    const majorOK = (actual_major == EXPECTED_MAJOR);
    const minorOK = (actual_minor >= EXPECTED_MINOR);
    return (majorOK && minorOK);
  }
}
