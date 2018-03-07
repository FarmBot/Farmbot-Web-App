import { isString, get } from "lodash";

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

const tempDataSource = JSON.stringify({ named_pins: MinVersionOverride.NEVER });

export function shouldDisplay(
  feature: string, current: string | undefined): boolean {
  if (isString(current)) {
    // TODO: get min version from JSON file
    // for example: {"some_feature": "1.2.3", "other_feature": "2.3.4"}
    const minOsVersionFeatureLookup = JSON.parse(tempDataSource);
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
}
