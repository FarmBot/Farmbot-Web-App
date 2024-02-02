import {
  BooleanConfigKey as BooleanFbosConfigKey,
  StringConfigKey as StringFbosConfigKey,
  NumberConfigKey as NumberFbosConfigKey,
} from "farmbot/dist/resources/configs/fbos";
import { ConfigurationName, FirmwareHardware } from "farmbot";
import { getModifiedClassNameSpecifyModified } from "../default_values";
import { cloneDeep } from "lodash";

type Key = BooleanFbosConfigKey | StringFbosConfigKey | NumberFbosConfigKey
  | ConfigurationName;
type Value = string | number | boolean | undefined;
const DEFAULT_FBOS_CONFIG_VALUES: Record<Key, Value> = {
  id: 0,
  device_id: 0,
  firmware_input_log: false,
  firmware_output_log: false,
  sequence_body_log: false,
  sequence_complete_log: false,
  sequence_init_log: false,
  os_auto_update: true,
  fw_auto_update: true,
  arduino_debug_messages: false,
  firmware_debug_log: false,
  firmware_hardware: undefined,
  firmware_path: undefined,
  update_channel: "stable",
  boot_sequence_id: undefined,
  safe_height: 0,
  soil_height: 0,
  gantry_height: 120,
};

const DEFAULT_EXPRESS_FBOS_CONFIG_VALUES =
  cloneDeep(DEFAULT_FBOS_CONFIG_VALUES);
DEFAULT_EXPRESS_FBOS_CONFIG_VALUES.gantry_height = 140;
const DEFAULT_GENESIS_FBOS_CONFIG_VALUES = DEFAULT_FBOS_CONFIG_VALUES;

export const getDefaultConfigValue =
  (firmwareHardware: FirmwareHardware | undefined) =>
    (key: Key): Value => {
      switch (firmwareHardware) {
        case "arduino":
        case "farmduino":
        case "farmduino_k14":
        case "farmduino_k15":
        case "farmduino_k16":
        case "farmduino_k17":
          return DEFAULT_GENESIS_FBOS_CONFIG_VALUES[key];
        case "express_k10":
        case "express_k11":
        case "express_k12":
          return DEFAULT_EXPRESS_FBOS_CONFIG_VALUES[key];
        default:
          return DEFAULT_FBOS_CONFIG_VALUES[key];
      }
    };

const modifiedFromDefault = (
  key: Key,
  value: Value,
  firmwareHardware: FirmwareHardware | undefined,
) => {
  return value != getDefaultConfigValue(firmwareHardware)(key);
};

export const getModifiedClassName = (
  key: Key,
  value: Value,
  firmwareHardware: FirmwareHardware | undefined,
) => {
  return getModifiedClassNameSpecifyModified(
    modifiedFromDefault(key, value, firmwareHardware));
};
