import { McuParams } from "farmbot/dist";
import { Xyz } from "../interfaces";
import { transform } from "lodash";

interface AxisStatus {
  axis: Xyz;
  disabled: boolean;
}

/** Farmbot prevents itself from ramming into walls via two mechanisms:
 *
 *  - Encoders (count steps)
 *  - End stops (detect collision with edge)
 *
 * If neither of these are enabled, FarmBot can do some pretty dangerous things,
 * such as smashing tools and ramming into tool bays.
 *
 * This function returns a 2 dimensional array describing whether or not a particular
 * axis has at least one of the precautions in place. Useful for checking if it is safe
 * to proceed with certain actions that could damage the bot.
 */
export function axisTrackingStatus(h: McuParams): AxisStatus[] {
  const stats = enabledAxisMap(h);
  const mapper = (a: keyof typeof stats) => ({ axis: a, disabled: !stats[a] });
  return Object.keys(stats).map(mapper);
}

export function enabledAxisMap(h: McuParams): Record<Xyz, boolean> {
  return {
    x: !!(h.encoder_enabled_x || h.movement_enable_endpoints_x),
    y: !!(h.encoder_enabled_y || h.movement_enable_endpoints_y),
    z: !!(h.encoder_enabled_z || h.movement_enable_endpoints_z)
  };
}

export function disabledAxisMap(h: McuParams): Record<Xyz, boolean> {
  return transform<boolean, Record<Xyz, boolean>>(
    enabledAxisMap(h),
    (d: Record<Xyz, boolean>, value: boolean, key: Xyz) => { d[key] = !value; },
    { x: false, y: false, z: false });
}
