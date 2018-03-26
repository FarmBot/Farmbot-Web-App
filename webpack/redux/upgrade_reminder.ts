import { info } from "farmbot-toastr";
import { semverCompare, SemverResult, MinVersionOverride } from "../util";
import { Content } from "../constants";
import { Dictionary } from "lodash";

const IDEAL_VERSION =
  globalConfig.FBOS_END_OF_LIFE_VERSION || MinVersionOverride.ALWAYS;

/** Returns a function that, when given a version string, (possibly) warns the
 * user to upgrade FBOS versions before it hits end of life. */
export function createReminderFn() {
  /** FBOS Version can change during the app lifecycle. We only want one
   * reminder per FBOS version change. */
  const alreadyChecked: Dictionary<boolean | undefined> = {
    // Dont bother when the user is offline.
    [MinVersionOverride.ALWAYS]: true
  };

  return function reminder(version: string) {

    // Did we check this particular version yet?
    !alreadyChecked[version]
      // Is it up to date?
      && semverCompare(version, IDEAL_VERSION) === SemverResult.RIGHT_IS_GREATER
      && info(Content.OLD_FBOS_REC_UPGRADE);

    alreadyChecked[version] = true; // Turn off checks for this version now.
  };
}
