import { isString } from "lodash";

/** Use browser's i18n functionality to guess timezone. */
function maybeResolveTZ(): string | undefined {
  if (Intl && Intl.DateTimeFormat) {
    // WARNING SIDE EFFECTS!!!
    console.warn("Ding!");
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  }
  return undefined;
}

export const inferTimezone = (current: string | undefined): string =>
  current || maybeResolveTZ() || "UTC";

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
