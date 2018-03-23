import { info } from "farmbot-toastr";
import { LATEST_VERSION } from "farmbot";
import { semverCompare, SemverResult, MinVersionOverride } from "../util";
import { Content } from "../constants";

const IDEAL_VERSION = [LATEST_VERSION, 0, 0].join(".");

/** Returns a function that, when given a version string, (possibly) reminds the
 * user to upgrade FBOS versions. */
export function createReminderFn() {
  const state = { ready: true };

  return function reminder(version: string) {
    state.ready
      && version !== MinVersionOverride.ALWAYS
      && semverCompare(version, IDEAL_VERSION) === SemverResult.RIGHT_IS_GREATER
      && (state.ready = false) // Turn off reminders
      && info(Content.OLD_FBOS_REC_UPGRADE);
  };
}
