import { info } from "../toast/toast";
import {
  semverCompare, SemverResult, FbosVersionFallback, versionOK,
} from "../util";
import { Content } from "../constants";
import { Dictionary } from "lodash";
import { t } from "../i18next_wrapper";
import { badVersion } from "../devices/actions";

const IDEAL_VERSION =
  globalConfig.FBOS_END_OF_LIFE_VERSION || FbosVersionFallback.NULL;

/** Returns a function that, when given a version string, (possibly) warns the
 * user to upgrade FBOS versions before it hits end of life. */
export function createReminderFn() {
  /** FBOS Version can change during the app lifecycle. We only want one
   * reminder per FBOS version change. */
  const alreadyChecked: Dictionary<boolean | undefined> = {
    // Don't bother when the user is offline.
    [FbosVersionFallback.NULL]: true
  };

  return function reminder(version: string) {

    if (!alreadyChecked[version] && !versionOK(version)) {
      badVersion({ noDismiss: false });
      alreadyChecked[version] = true;
    }

    // Did we check this particular version yet?
    !alreadyChecked[version]
      // Is it up to date?
      && semverCompare(version, IDEAL_VERSION) === SemverResult.RIGHT_IS_GREATER
      && info(t(Content.OLD_FBOS_REC_UPGRADE), {
        title: t("Please upgrade"),
        color: "orange",
        noTimer: true,
        idPrefix: "EOL",
      });

    alreadyChecked[version] = true; // Turn off checks for this version now.
  };
}
