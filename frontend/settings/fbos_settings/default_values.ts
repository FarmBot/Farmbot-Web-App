import {
  BooleanConfigKey as BooleanFbosConfigKey,
  StringConfigKey as StringFbosConfigKey,
  NumberConfigKey as NumberFbosConfigKey,
} from "farmbot/dist/resources/configs/fbos";
import { ConfigurationName } from "farmbot";
import { getModifiedClassNameSpecifyModified } from "../default_values";

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
  gantry_height: 0,
};

export const modifiedFromDefault = (key: Key, value: Value) => {
  return value != DEFAULT_FBOS_CONFIG_VALUES[key];
};

export const getModifiedClassName = (key: Key, value: Value) => {
  return getModifiedClassNameSpecifyModified(modifiedFromDefault(key, value));
};
