import { throttle } from "lodash";

/** Too many status updates === too many screen redraws. */
export const slowDown =
  <Returns, Args, Fn extends (u: Args) => Returns>(fn: Fn) =>
    throttle(fn, 600, { leading: false, trailing: true });
