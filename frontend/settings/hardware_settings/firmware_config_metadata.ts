import { McuParamName } from "farmbot";

const AXES = ["x", "y", "z"] as const;

const AXIS_BOOLEAN_PREFIXES = [
  "encoder_enabled",
  "encoder_use_for_pos",
  "encoder_invert",
  "movement_keep_active",
  "movement_invert_motor",
  "movement_axis_stealth",
  "movement_home_at_boot",
  "movement_stop_at_home",
  "movement_stop_at_max",
  "movement_home_up",
  "movement_enable_endpoints",
  "movement_invert_endpoints",
  "movement_invert_2_endpoints",
] as const;

const axisBooleanParams = AXIS_BOOLEAN_PREFIXES.flatMap(prefix =>
  AXES.map(axis => `${prefix}_${axis}` as McuParamName));

/** Firmware values that are numerically stored but rendered as toggle controls. */
export const BOOLEAN_MCU_PARAMS = new Set<McuParamName>([
  ...axisBooleanParams,
  "movement_secondary_motor_x",
  "movement_secondary_motor_invert_x",
  "param_e_stop_on_mov_err",
  "pin_guard_1_active_state",
  "pin_guard_2_active_state",
  "pin_guard_3_active_state",
  "pin_guard_4_active_state",
  "pin_guard_5_active_state",
]);

export const isBooleanMcuParam = (key: string) =>
  BOOLEAN_MCU_PARAMS.has(key as McuParamName);
