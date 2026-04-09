import { throttle } from "lodash";

/** Too many status updates === too many screen redraws. */
export const slowDown =
  <Args extends unknown[], Return>(fn: (...args: Args) => Return) =>
    throttle(fn, 600, { leading: false, trailing: true });
