import { FirmwareHardware, McuParamName } from "farmbot";
import {
  NumberConfigKey as NumberFirmwareConfigKey,
} from "farmbot/dist/resources/configs/firmware";
import { cloneDeep } from "lodash";
import { getModifiedClassNameSpecifyDefault } from "../default_values";

const DEFAULT_FIRMWARE_CONFIG_VALUES: Record<NumberFirmwareConfigKey, number> = {
  encoder_enabled_x: 1,
  encoder_enabled_y: 1,
  encoder_enabled_z: 1,
  encoder_invert_x: 0,
  encoder_invert_y: 0,
  encoder_invert_z: 0,
  encoder_missed_steps_decay_x: 5,
  encoder_missed_steps_decay_y: 5,
  encoder_missed_steps_decay_z: 5,
  encoder_missed_steps_max_x: 5,
  encoder_missed_steps_max_y: 5,
  encoder_missed_steps_max_z: 5,
  encoder_scaling_x: 5556,
  encoder_scaling_y: 5556,
  encoder_scaling_z: 5556,
  encoder_type_x: 0,
  encoder_type_y: 0,
  encoder_type_z: 0,
  encoder_use_for_pos_x: 0,
  encoder_use_for_pos_y: 0,
  encoder_use_for_pos_z: 0,
  movement_axis_nr_steps_x: 0,
  movement_axis_nr_steps_y: 0,
  movement_axis_nr_steps_z: 0,
  movement_axis_stealth_x: 1,
  movement_axis_stealth_y: 1,
  movement_axis_stealth_z: 1,
  movement_calibration_deadzone_x: 250,
  movement_calibration_deadzone_y: 250,
  movement_calibration_deadzone_z: 250,
  movement_calibration_retry_x: 1,
  movement_calibration_retry_y: 1,
  movement_calibration_retry_z: 1,
  movement_calibration_retry_total_x: 10,
  movement_calibration_retry_total_y: 10,
  movement_calibration_retry_total_z: 10,
  movement_enable_endpoints_x: 0,
  movement_enable_endpoints_y: 0,
  movement_enable_endpoints_z: 0,
  movement_home_at_boot_x: 0,
  movement_home_at_boot_y: 0,
  movement_home_at_boot_z: 0,
  movement_home_spd_x: 400,
  movement_home_spd_y: 400,
  movement_home_spd_z: 400,
  movement_home_up_x: 0,
  movement_home_up_y: 0,
  movement_home_up_z: 1,
  movement_invert_endpoints_x: 0,
  movement_invert_endpoints_y: 0,
  movement_invert_endpoints_z: 0,
  movement_invert_motor_x: 0,
  movement_invert_motor_y: 0,
  movement_invert_motor_z: 0,
  movement_keep_active_x: 0,
  movement_keep_active_y: 0,
  movement_keep_active_z: 1,
  movement_max_spd_x: 400,
  movement_max_spd_y: 400,
  movement_max_spd_z: 400,
  movement_max_spd_z2: 400,
  movement_min_spd_x: 50,
  movement_min_spd_y: 50,
  movement_min_spd_z: 50,
  movement_min_spd_z2: 50,
  movement_secondary_motor_invert_x: 1,
  movement_secondary_motor_x: 1,
  movement_step_per_mm_x: 5,
  movement_step_per_mm_y: 5,
  movement_step_per_mm_z: 25,
  movement_steps_acc_dec_x: 300,
  movement_steps_acc_dec_y: 300,
  movement_steps_acc_dec_z: 300,
  movement_steps_acc_dec_z2: 300,
  movement_stop_at_home_x: 1,
  movement_stop_at_home_y: 1,
  movement_stop_at_home_z: 1,
  movement_stop_at_max_x: 1,
  movement_stop_at_max_y: 1,
  movement_stop_at_max_z: 1,
  movement_timeout_x: 180,
  movement_timeout_y: 180,
  movement_timeout_z: 180,
  param_config_ok: 0,
  param_e_stop_on_mov_err: 0,
  param_mov_nr_retry: 3,
  param_test: 0,
  param_use_eeprom: 1,
  param_version: 1,
  pin_guard_1_active_state: 1,
  pin_guard_1_pin_nr: 0,
  pin_guard_1_time_out: 60,
  pin_guard_2_active_state: 1,
  pin_guard_2_pin_nr: 0,
  pin_guard_2_time_out: 60,
  pin_guard_3_active_state: 1,
  pin_guard_3_pin_nr: 0,
  pin_guard_3_time_out: 60,
  pin_guard_4_active_state: 1,
  pin_guard_4_pin_nr: 0,
  pin_guard_4_time_out: 60,
  pin_guard_5_active_state: 1,
  pin_guard_5_pin_nr: 0,
  pin_guard_5_time_out: 60,
  pin_report_1_pin_nr: 0,
  pin_report_2_pin_nr: 0,
  movement_invert_2_endpoints_x: 0,
  movement_invert_2_endpoints_y: 0,
  movement_invert_2_endpoints_z: 0,
  movement_microsteps_x: 1,
  movement_microsteps_y: 1,
  movement_microsteps_z: 1,
  movement_motor_current_x: 1823,
  movement_motor_current_y: 1823,
  movement_motor_current_z: 1823,
  movement_stall_sensitivity_x: 63,
  movement_stall_sensitivity_y: 63,
  movement_stall_sensitivity_z: 63,
};

const DEFAULT_EXPRESS_FIRMWARE_CONFIG_VALUES =
  cloneDeep(DEFAULT_FIRMWARE_CONFIG_VALUES);
DEFAULT_EXPRESS_FIRMWARE_CONFIG_VALUES.encoder_enabled_z = 0;
DEFAULT_EXPRESS_FIRMWARE_CONFIG_VALUES.movement_max_spd_y = 900;
DEFAULT_EXPRESS_FIRMWARE_CONFIG_VALUES.movement_min_spd_x = 300;
DEFAULT_EXPRESS_FIRMWARE_CONFIG_VALUES.movement_min_spd_y = 300;
DEFAULT_EXPRESS_FIRMWARE_CONFIG_VALUES.movement_home_spd_y = 500;
DEFAULT_EXPRESS_FIRMWARE_CONFIG_VALUES.movement_steps_acc_dec_x = 250;
DEFAULT_EXPRESS_FIRMWARE_CONFIG_VALUES.movement_steps_acc_dec_y = 250;
DEFAULT_EXPRESS_FIRMWARE_CONFIG_VALUES.encoder_missed_steps_max_x = 70;
DEFAULT_EXPRESS_FIRMWARE_CONFIG_VALUES.encoder_missed_steps_max_y = 60;
DEFAULT_EXPRESS_FIRMWARE_CONFIG_VALUES.encoder_missed_steps_max_z = 70;
DEFAULT_EXPRESS_FIRMWARE_CONFIG_VALUES.encoder_missed_steps_decay_x = 100;
DEFAULT_EXPRESS_FIRMWARE_CONFIG_VALUES.encoder_missed_steps_decay_y = 100;
DEFAULT_EXPRESS_FIRMWARE_CONFIG_VALUES.encoder_missed_steps_decay_z = 100;

const DEFAULT_GENESIS_FIRMWARE_CONFIG_VALUES =
  cloneDeep(DEFAULT_FIRMWARE_CONFIG_VALUES);
DEFAULT_GENESIS_FIRMWARE_CONFIG_VALUES.movement_motor_current_x = 1646;

export const getDefaultFwConfigValue =
  (firmwareHardware: FirmwareHardware | undefined) =>
    (key: NumberFirmwareConfigKey): number => {
      switch (firmwareHardware) {
        case "arduino":
        case "farmduino":
        case "farmduino_k14":
        case "farmduino_k15":
        case "farmduino_k16":
        case "farmduino_k17":
        case "farmduino_k18":
          return DEFAULT_GENESIS_FIRMWARE_CONFIG_VALUES[key];
        case "express_k10":
        case "express_k11":
        case "express_k12":
          return DEFAULT_EXPRESS_FIRMWARE_CONFIG_VALUES[key];
        default:
          return DEFAULT_FIRMWARE_CONFIG_VALUES[key];
      }
    };

export const getModifiedClassName = (
  key: McuParamName,
  valueRaw: number | undefined,
  firmwareHardware: FirmwareHardware | undefined,
  func?: (n: number | undefined) => number,
) => {
  const defaultValueRaw = getDefaultFwConfigValue(firmwareHardware)(key);
  const defaultValue = func ? func(defaultValueRaw) : defaultValueRaw;
  const value = func ? func(valueRaw) : valueRaw;
  return getModifiedClassNameSpecifyDefault(value, defaultValue);
};
