import { t } from "i18next";
import { Content } from "../../constants";
import { isString } from "lodash";

/** Used for every new account the first time the Device page is loaded. */
const ONLY_ONCE = {
  need_to_talk: true
};

export function inferTimezone(current: string | undefined): string {
  if (current) {
    return current;
  }
  const browserTime = maybeResolveTZ();
  if (browserTime) {
    if (ONLY_ONCE.need_to_talk) {
      alert(t(Content.TIMEZONE_GUESS_BROWSER));
      ONLY_ONCE.need_to_talk = false;
    }
    // WARNING SIDE EFFECTS!!!
    return browserTime;
  }
  if (ONLY_ONCE.need_to_talk) {
    alert(t(Content.TIMEZONE_GUESS_UTC));
    ONLY_ONCE.need_to_talk = false;
  }
  return "UTC";
}

/** Sometimes, a mismatch between the device time zone and the user time zone
 * can occur. When this happens,
 */
export function timezoneMismatch(botTime: string | undefined,
  userTime: string | undefined = maybeResolveTZ()): boolean {

  if (isString(botTime) && isString(userTime)) {
    return botTime.toUpperCase() !== userTime.toUpperCase();
  } else {
    // Don't show warnings if TZ data is unavailable.
    return false;
  }
}

/** Use browser's i18n functionality to guess timezone. */
function maybeResolveTZ(): string | undefined {
  if (Intl && Intl.DateTimeFormat) {
    // WARNING SIDE EFFECTS!!!
    return Intl
      .DateTimeFormat()
      .resolvedOptions()
      .timeZone;
  }
  return undefined;
}
