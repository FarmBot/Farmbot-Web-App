import {
  BotStateTree, ConfigurationName, McuParamName, SyncStatus, Xyz, LocationData,
} from "farmbot";
import { ConnectionState } from "../connectivity/interfaces";

/** Value and consistency of the value between the bot and /api/fbos_config. */
export type SourceFbosConfig = (config: ConfigurationName) =>
  {
    value: boolean | number | string | undefined,
    consistent: boolean
  };

/**
 * Value and consistency of the value between the bot and /api/firmware_config.
 * */
export type SourceFwConfig = (config: McuParamName) =>
  { value: number | undefined, consistent: boolean };

/** Function to determine if a feature should be displayed. */
export type ShouldDisplay = (x: Feature) => boolean;
/** Names of features that use minimum FBOS version checking. */
export enum Feature {
  api_farmware_env = "api_farmware_env",
  api_farmware_installations = "api_farmware_installations",
  api_ota_releases = "api_ota_releases",
  api_pin_bindings = "api_pin_bindings",
  assertion_block = "assertion_block",
  backscheduled_regimens = "backscheduled_regimens",
  boot_sequence = "boot_sequence",
  calibration_retries = "calibration_retries",
  calibration_total_retries = "calibration_total_retries",
  computed_move = "computed_move",
  change_ownership = "change_ownership",
  criteria_groups = "criteria_groups",
  endstop_invert = "endstop_invert",
  express_k10 = "express_k10",
  express_k11 = "express_k11",
  express_stall_detection = "express_stall_detection",
  farmduino_k14 = "farmduino_k14",
  farmduino_k15 = "farmduino_k15",
  farmduino_k16 = "farmduino_k16",
  firmware_restart = "firmware_restart",
  flash_firmware = "flash_firmware",
  groups = "groups",
  home_single_axis = "home_single_axis",
  jest_feature = "jest_feature",
  long_scaling_factor = "long_scaling_factor",
  lua_step = "lua_step",
  mark_as_step = "mark_as_step",
  multiple_variables = "multiple_variables",
  named_pins = "named_pins",
  no_auto_reset = "no_auto_reset",
  no_firmware_logs = "no_firmware_logs",
  none_firmware = "none_firmware",
  number_variables = "number_variables",
  ota_update_hour = "ota_update_hour",
  planted_at_now = "planted_at_now",
  quiet_motors = "quiet_motors",
  resource_variables = "resource_variables",
  rpi_led_control = "rpi_led_control",
  safe_height_input = "safe_height_input",
  sensors = "sensors",
  soil_height = "soil_height",
  sort_type_optimized = "sort_type_optimized",
  sort_type_alternating = "sort_type_alternating",
  string_variables = "string_variables",
  toggle_peripheral = "toggle_peripheral",
  update_resource = "update_resource",
  use_update_channel = "use_update_channel",
  variables = "variables",
  z2_firmware_params = "z2_firmware_params",
  z2_firmware_params_tmc = "z2_firmware_params_tmc",
  z2_firmware_params_all = "z2_firmware_params_all",
}

/** Object fetched from ExternalUrl.featureMinVersions. */
export type MinOsFeatureLookup = Partial<Record<Feature, string>>;

export interface BotState {
  /** The browser optimistically overwrites FBOS sync status to "syncing..."
   * to reduce UI latency. When AJAX/sync operations fail, we need
   * a mechanism to rollback the update to the previous value. We store the
   * value of the status prior to the update here for safety */
  statusStash?: SyncStatus | undefined;
  /** How many steps to move when the user presses a manual movement arrow */
  stepSize: number;
  /** Version of available FBOS update from releases API. undefined: up to date */
  osUpdateVersion?: string | undefined;
  /** JSON string of minimum required FBOS versions for various features. */
  minOsFeatureData?: MinOsFeatureLookup;
  /** Notes notifying users of changes that may require intervention. */
  osReleaseNotes?: string;
  /** Is the bot in sync with the api */
  dirty: boolean;
  /** The state of the bot, as reported by the bot over MQTT. */
  hardware: HardwareState;
  /** Hardware settings auto update on blur. Tells the UI if it should load a
   * spinner or not. */
  isUpdating?: boolean;
  /** Have all API requests been acknowledged by external services? This flag
   * lets us know if it is safe to do data critical tasks with the bot */
  consistent: boolean;
  connectivity: ConnectionState;
  needVersionCheck: boolean;
  alreadyToldUserAboutMalformedMsg: boolean;
}

/** Status registers for the bot's status */
export type HardwareState = BotStateTree;

export interface OsUpdateInfo {
  version: string | undefined;
}

export interface MoveRelProps {
  x: number;
  y: number;
  z: number;
  speed?: number | undefined;
}

export interface MoveProps {
  x: number;
  y: number;
  z: number;
  safeZ?: boolean;
  speed?: number;
}

export type Axis = Xyz | "all";

export type BotPosition = Record<Xyz, number | undefined>;
export type BotLocationData = LocationData;

export type StepsPerMm = Record<Xyz, number | undefined>;

export type UserEnv = Record<string, string | undefined>;
