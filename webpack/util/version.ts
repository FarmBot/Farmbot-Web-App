import { isString } from "lodash";

export enum SemverResult {
  LEFT_IS_GREATER = 1,
  RIGHT_IS_GREATER = -1,
  EQUAL = 0
}
// CREDIT: https://github.com/substack/semver-compare
export function semverCompare(left: string, right: string): SemverResult {
  const pa: Array<string | undefined> = left.split(".");
  const pb: Array<string | undefined> = right.split(".");
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

  return SemverResult.EQUAL;
}

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
