import { isString } from "lodash";
import { TaggedDevice } from "farmbot";
import { edit, save } from "../../api/crud";
import { forceOnline } from "../must_be_online";
import { DeviceAccountSettings } from "farmbot/dist/resources/api_resources";
import { Actions } from "../../constants";

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
    const update: Partial<DeviceAccountSettings> =
      { timezone: inferTimezone(undefined) };
    if (forceOnline()) {
      update.lng = -(new Date().getTimezoneOffset()) / 4;
      update.lat = 0;
    }
    dispatch(edit(device, update));
    dispatch(save(device.uuid));
  }
  if (forceOnline()) {
    dispatch({ type: Actions.SET_3D_TIME, payload: "12:00" });
  }
}
