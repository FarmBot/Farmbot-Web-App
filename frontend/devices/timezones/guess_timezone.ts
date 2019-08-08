import { isString } from "lodash";
import { TaggedDevice } from "farmbot";
import { edit, save } from "../../api/crud";

/** Use browser's i18n functionality to guess timezone. */
const maybeResolveTZ = (): string | undefined => Intl &&
  Intl.DateTimeFormat &&
  Intl.DateTimeFormat().resolvedOptions().timeZone;

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

export function maybeSetTimezone(dispatch: Function, device: TaggedDevice) {
  if (!device.body.timezone) {
    dispatch(edit(device, { timezone: inferTimezone(undefined) }));
    dispatch(save(device.uuid));
  }
}
