
/** Remove this in October 2017 - RC */
let ONLY_ONCE = {
  need_to_talk: true
}

export function inferTimezone(current: string | undefined): string {
  if (current) {
    return current;
  }
  let browserTime = maybeResolveTZ();
  if (browserTime) {
    if (ONLY_ONCE.need_to_talk) {
      alert("This account did not have a timezone set. " +
        "Farmbot requires a timezone to operate. " +
        "We have updated your timezone settings based on your browser. " +
        "Please verify these settings in the device settings panel. " +
        "Device sync is recommended.");
      ONLY_ONCE.need_to_talk = false;
    }
    // WARNING SIDE EFFECTS!!!
    return browserTime;
  }
  if (ONLY_ONCE.need_to_talk) {
    alert("Warning: Farmbot could not guess your timezone. " +
      "We have defaulted your timezone to UTC, which is less than ideal for " +
      "most users. Please select your timezone from the dropdown. Device " +
      "sync is recommended.");
    ONLY_ONCE.need_to_talk = false;
  };
  return "UTC";
}

/** Sometimes, a mismatch between the device time zone and the user time zone
 * can occur. When this happens,
 */
export function timezoneMismatch(botTime: string | undefined,
  userTime: string | undefined = maybeResolveTZ()): boolean {

  if (_.isString(botTime) && _.isString(userTime)) {
    return botTime.toUpperCase() !== userTime.toUpperCase();
  } else {
    // Dont show warnings if TZ data is unavailable.
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
