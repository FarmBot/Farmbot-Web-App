import { DeviceAccountSettings } from "../devices/interfaces";

/** Determines if the device was forced to wait due to log flooding. */
export const deviceIsThrottled =
  (dev: Partial<DeviceAccountSettings> | undefined): boolean => {
    return !!(dev && dev.throttled_at && dev.throttled_until);
  };
