import { McuParams, Xyz } from "farmbot";

interface AxisStatus {
  axis: Xyz;
  disabled: boolean;
}

/** Farmbot prevents itself from ramming into walls via two mechanisms:
 *
 *  - Encoders (count steps) or stall detection (motor feedback)
 *  - Limit switches (detect collision with end switch)
 *
 * If neither of these are enabled, FarmBot can do some pretty dangerous things,
 * such as smashing tools and ramming into tool bays.
 *
 * This function returns a 2 dimensional array describing whether or not
 * a particular axis has at least one of the precautions in place.
 * Useful for checking if it is safe to proceed with certain actions that
 * could damage the bot.
 */
export function axisTrackingStatus(
  mcuParams: McuParams, disableEncoderUse = false,
): AxisStatus[] {
  const stats = enabledAxisMap(mcuParams, disableEncoderUse);
  const mapper = (a: keyof typeof stats) => ({ axis: a, disabled: !stats[a] });
  return (Object.keys(stats) as Xyz[]).map(mapper);
}

export function enabledAxisMap(
  mcuParams: McuParams, disableEncoderUse = false,
): Record<Xyz, boolean> {
  const encoderOrStallUseEnabled = {
    x: !disableEncoderUse && mcuParams.encoder_enabled_x,
    y: !disableEncoderUse && mcuParams.encoder_enabled_y,
    z: !disableEncoderUse && mcuParams.encoder_enabled_z,
  };
  return {
    x: !!(encoderOrStallUseEnabled.x || mcuParams.movement_enable_endpoints_x),
    y: !!(encoderOrStallUseEnabled.y || mcuParams.movement_enable_endpoints_y),
    z: !!(encoderOrStallUseEnabled.z || mcuParams.movement_enable_endpoints_z)
  };
}

export const disabledAxisMap = (h: McuParams): Record<Xyz, boolean> => {
  const enabled = enabledAxisMap(h);
  return {
    x: !enabled.x,
    y: !enabled.y,
    z: !enabled.z,
  };
};
