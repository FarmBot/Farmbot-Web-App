import { throttle } from "lodash";

/** Too many status updates === too many screen redraws. */
export const slowDown =
  (fn: (...args: unknown[]) => unknown) =>
    throttle(fn, 600, { leading: false, trailing: true });
