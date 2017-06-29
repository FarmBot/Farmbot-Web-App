import { McuParams } from "farmbot/dist";
import { Xyz } from "../interfaces";

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
 * This function returns a 2 dimensional array describing wether or not a particular
 * axis has at least one of the precautions in place. Useful for checking if it is safe
 * to proceed with certain actions that could damage the bot.
 */
export function axisTrackingStatus(h: McuParams): AxisStatus[] {
  let stats = enabledAxisMap(h);
  let mapper = (a: keyof typeof stats) => ({ axis: a, disabled: !stats[a] });
  return Object.keys(stats).map(mapper);
}

export function enabledAxisMap(h: McuParams): Record<Xyz, boolean> {
  return {
    x: !!(h.encoder_enabled_x || h.movement_enable_endpoints_x),
    y: !!(h.encoder_enabled_y || h.movement_enable_endpoints_y),
    z: !!(h.encoder_enabled_z || h.movement_enable_endpoints_z)
  }
}
