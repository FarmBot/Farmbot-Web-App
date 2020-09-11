import {
  BotStateTree, ConfigurationName, McuParamName, SyncStatus, TaggedDevice,
  Alert, Xyz, LocationData, FirmwareHardware,
} from "farmbot";
import { ConnectionState } from "../connectivity/interfaces";
import { IntegerSize } from "../util";
import { TimeSettings } from "../interfaces";

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
  computed_move = "computed_move",
  change_ownership = "change_ownership",
  criteria_groups = "criteria_groups",
  endstop_invert = "endstop_invert",
  express_k10 = "express_k10",
  express_stall_detection = "express_stall_detection",
  farmduino_k14 = "farmduino_k14",
  farmduino_k15 = "farmduino_k15",
  firmware_restart = "firmware_restart",
  flash_firmware = "flash_firmware",
  groups = "groups",
  jest_feature = "jest_feature",
  long_scaling_factor = "long_scaling_factor",
  mark_as_step = "mark_as_step",
  named_pins = "named_pins",
  none_firmware = "none_firmware",
  ota_update_hour = "ota_update_hour",
  rpi_led_control = "rpi_led_control",
  safe_height_input = "safe_height_input",
  sensors = "sensors",
  soil_height = "soil_height",
  update_resource = "update_resource",
  use_update_channel = "use_update_channel",
  variables = "variables",
  z2_firmware_params = "z2_firmware_params",
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
  /** The current os version on the github release api */
  currentOSVersion?: string;
  /** The current beta os version on the github release api */
  currentBetaOSVersion?: string;
  /** The current beta os commit on the github release api */
  currentBetaOSCommit?: string;
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
  controlPanelState: ControlPanelState;
  /** Have all API requests been acknowledged by external services? This flag
   * lets us know if it is safe to do data critical tasks with the bot */
  consistent: boolean;
  connectivity: ConnectionState;
}

/** Status registers for the bot's status */
export type HardwareState = BotStateTree;

export interface GithubRelease {
  tag_name: string;
  target_commitish: string;
  assets: {
    name: string;
    browser_download_url: string;
  }[];
}

export interface OsUpdateInfo {
  version: string;
  commit: string;
}

export interface MoveRelProps {
  x: number;
  y: number;
  z: number;
  speed?: number | undefined;
}

export type Axis = Xyz | "all";

export type BotPosition = Record<Xyz, number | undefined>;
export type BotLocationData = LocationData;

export type StepsPerMmXY = Record<"x" | "y", (number | undefined)>;

export type UserEnv = Record<string, string | undefined>;

export interface FarmbotSettingsProps {
  bot: BotState;
  alerts: Alert[];
  device: TaggedDevice;
  dispatch: Function;
  sourceFbosConfig: SourceFbosConfig;
  shouldDisplay: ShouldDisplay;
  timeSettings: TimeSettings;
  botOnline: boolean;
}

export interface McuInputBoxProps {
  sourceFwConfig: SourceFwConfig;
  setting: McuParamName;
  dispatch: Function;
  intSize?: IntegerSize;
  float?: boolean;
  scale?: number;
  filter?: number;
  gray?: boolean;
  min?: number;
  max?: number;
  disabled?: boolean;
  title?: string;
  firmwareHardware: FirmwareHardware | undefined;
}

export interface EStopButtonProps {
  bot: BotState;
  forceUnlock: boolean;
}

export interface ControlPanelState {
  farmbot_settings: boolean;
  firmware: boolean;
  power_and_reset: boolean;
  axis_settings: boolean;
  motors: boolean;
  encoders_or_stall_detection: boolean;
  limit_switches: boolean;
  error_handling: boolean;
  pin_bindings: boolean;
  pin_guard: boolean;
  parameter_management: boolean;
  farm_designer: boolean;
  account: boolean;
  other_settings: boolean;
}
