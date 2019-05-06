import { AuthState } from "../auth/interfaces";
import {
  BotStateTree, ConfigurationName,
  McuParamName, SyncStatus, LocationName,
  TaggedImage,
  TaggedPeripheral,
  TaggedDevice,
  TaggedSensor,
  TaggedDiagnosticDump,
  TaggedFarmwareInstallation,
  JobProgress,
} from "farmbot";
import { ResourceIndex } from "../resources/interfaces";
import { WD_ENV } from "../farmware/weed_detector/remote_env/interfaces";
import {
  ConnectionStatus, ConnectionState, NetworkState
} from "../connectivity/interfaces";
import { IntegerSize } from "../util";
import { Farmwares } from "../farmware/interfaces";
import { FirmwareConfig } from "farmbot/dist/resources/configs/firmware";
import { GetWebAppConfigValue } from "../config_storage/actions";
import { TimeSettings } from "../interfaces";

export interface Props {
  userToApi: ConnectionStatus | undefined;
  userToMqtt: ConnectionStatus | undefined;
  botToMqtt: ConnectionStatus | undefined;
  auth: AuthState | undefined;
  bot: BotState;
  deviceAccount: TaggedDevice;
  images: TaggedImage[];
  dispatch: Function;
  resources: ResourceIndex;
  sourceFbosConfig: SourceFbosConfig;
  sourceFwConfig: SourceFwConfig;
  shouldDisplay: ShouldDisplay;
  firmwareConfig: FirmwareConfig | undefined;
  isValidFbosConfig: boolean;
  env: UserEnv;
  saveFarmwareEnv: SaveFarmwareEnv;
  timeSettings: TimeSettings;
}

/** Function to save a Farmware env variable to the API. */
export type SaveFarmwareEnv =
  (key: string, value: string) => (dispatch: Function) => void;

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
  named_pins = "named_pins",
  sensors = "sensors",
  change_ownership = "change_ownership",
  variables = "variables",
  loops = "loops",
  api_pin_bindings = "api_pin_bindings",
  farmduino_k14 = "farmduino_k14",
  jest_feature = "jest_feature", // for tests
  backscheduled_regimens = "backscheduled_regimens",
  endstop_invert = "endstop_invert",
  diagnostic_dumps = "diagnostic_dumps",
  rpi_led_control = "rpi_led_control",
  mark_as_step = "mark_as_step",
  firmware_restart = "firmware_restart",
  api_farmware_installations = "api_farmware_installations",
  api_farmware_env = "api_farmware_env",
  use_update_channel = "use_update_channel",
  long_scaling_factor = "long_scaling_factor",
  flash_firmware = "flash_firmware",
  express_k10 = "express_k10",
}
/** Object fetched from FEATURE_MIN_VERSIONS_URL. */
export type MinOsFeatureLookup = Partial<Record<Feature, string>>;

/** How the device is stored in the API side.
 * This is what comes back from the API as JSON.
 */
export interface DeviceAccountSettings {
  id: number;
  name: string;
  timezone?: string | undefined;
  tz_offset_hrs: number;
  throttled_until?: string;
  throttled_at?: string;
  fbos_version?: string | undefined;
  last_saw_api?: string | undefined;
  last_saw_mq?: string | undefined;
}

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

export type Xyz = "x" | "y" | "z";
export type Axis = Xyz | "all";

export type BotPosition = Record<Xyz, (number | undefined)>;
export type BotLocationData = Record<LocationName, BotPosition>;

export type StepsPerMmXY = Record<"x" | "y", (number | undefined)>;

export interface CalibrationButtonProps {
  disabled: boolean;
  axis: Axis;
}

export type UserEnv = Record<string, string | undefined>;

export interface FarmbotOsProps {
  bot: BotState;
  diagnostics: TaggedDiagnosticDump[];
  account: TaggedDevice;
  botToMqttStatus: NetworkState;
  botToMqttLastSeen: string;
  dispatch: Function;
  sourceFbosConfig: SourceFbosConfig;
  shouldDisplay: ShouldDisplay;
  isValidFbosConfig: boolean;
  env: UserEnv;
  saveFarmwareEnv: SaveFarmwareEnv;
  timeSettings: TimeSettings;
}

export interface FarmbotOsState {
  osReleaseNotesHeading: string;
  osReleaseNotes: string;
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
}

export interface EStopButtonProps {
  bot: BotState;
  forceUnlock: boolean;
}

export interface PeripheralsProps {
  bot: BotState;
  peripherals: TaggedPeripheral[];
  dispatch: Function;
  disabled: boolean | undefined;
}

export interface SensorsProps {
  bot: BotState;
  sensors: TaggedSensor[];
  dispatch: Function;
  disabled: boolean | undefined;
}

export interface FarmwareProps {
  dispatch: Function;
  env: Partial<WD_ENV>;
  user_env: UserEnv;
  images: TaggedImage[];
  currentImage: TaggedImage | undefined;
  botToMqttStatus: NetworkState;
  farmwares: Farmwares;
  timeSettings: TimeSettings;
  syncStatus: SyncStatus | undefined;
  getConfigValue: GetWebAppConfigValue;
  firstPartyFarmwareNames: string[];
  currentFarmware: string | undefined;
  shouldDisplay: ShouldDisplay;
  saveFarmwareEnv: SaveFarmwareEnv;
  taggedFarmwareInstallations: TaggedFarmwareInstallation[];
  imageJobs: JobProgress[];
  infoOpen: boolean;
}

export interface HardwareSettingsProps {
  controlPanelState: ControlPanelState;
  dispatch: Function;
  botToMqttStatus: NetworkState;
  bot: BotState;
  shouldDisplay: ShouldDisplay;
  sourceFwConfig: SourceFwConfig;
  firmwareConfig: FirmwareConfig | undefined;
}

export interface ControlPanelState {
  homing_and_calibration: boolean;
  motors: boolean;
  encoders_and_endstops: boolean;
  danger_zone: boolean;
  power_and_reset: boolean;
  pin_guard: boolean;
  diagnostic_dumps: boolean;
}
