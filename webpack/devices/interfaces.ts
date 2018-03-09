import { BotStateTree, ConfigurationName } from "farmbot";
import {
  McuParamName,
  Dictionary,
  SyncStatus,
  FarmwareManifest,
  LocationName
} from "farmbot";
import { AuthState } from "../auth/interfaces";
import {
  TaggedImage,
  TaggedPeripheral,
  TaggedDevice
} from "../resources/tagged_resources";
import { ResourceIndex } from "../resources/interfaces";
import { TaggedUser } from "../resources/tagged_resources";
import { WD_ENV } from "../farmware/weed_detector/remote_env/interfaces";
import { ConnectionStatus, ConnectionState, NetworkState } from "../connectivity/interfaces";
import { IntegerSize } from "../util";
import { WebAppConfig } from "../config_storage/web_app_configs";

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
  shouldDisplay: ShouldDisplay;
}

export type SourceFbosConfig = (config: ConfigurationName) =>
  {
    value: boolean | number | string | undefined,
    consistent: boolean
  };

/** Function to determine if a feature should be displayed. */
export type ShouldDisplay = (x: Feature) => boolean;
/** Names of features that use minimum FBOS version checking. */
export enum Feature {
  named_pins = "named_pins",
  change_ownership = "change_ownership",
  variables = "variables",
  jest_feature = "jest_feature", // for tests
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

export interface FarmbotOsProps {
  bot: BotState;
  account: TaggedDevice;
  botToMqttStatus: NetworkState;
  botToMqttLastSeen: string;
  dispatch: Function;
  sourceFbosConfig: SourceFbosConfig;
  shouldDisplay: ShouldDisplay;
}

export interface FarmbotOsState {
  osReleaseNotes: string;
}

export interface CameraSelectionProps {
  env: Dictionary<string | undefined>
}

export interface CameraSelectionState {
  cameraStatus: "" | "sending" | "done" | "error";
}

export interface McuInputBoxProps {
  bot: BotState;
  setting: McuParamName;
  dispatch: Function;
  intSize?: IntegerSize;
  filter?: number;
  gray?: boolean;
}

export interface EStopButtonProps {
  bot: BotState;
  user: TaggedUser | undefined;
}

export interface PeripheralsProps {
  bot: BotState;
  peripherals: TaggedPeripheral[];
  dispatch: Function;
  disabled: boolean | undefined;
}

export interface FarmwareProps {
  dispatch: Function;
  env: Partial<WD_ENV>;
  user_env: Record<string, string | undefined>;
  images: TaggedImage[];
  currentImage: TaggedImage | undefined;
  botToMqttStatus: NetworkState;
  farmwares: Dictionary<FarmwareManifest | undefined>;
  timeOffset: number;
  syncStatus: SyncStatus | undefined;
  webAppConfig: Partial<WebAppConfig>;
  firstPartyFarmwareNames: string[];
}

export interface HardwareSettingsProps {
  controlPanelState: ControlPanelState;
  dispatch: Function;
  botToMqttStatus: NetworkState;
  bot: BotState;
  sourceFbosConfig: SourceFbosConfig;
}

export interface ControlPanelState {
  homing_and_calibration: boolean;
  motors: boolean;
  encoders_and_endstops: boolean;
  danger_zone: boolean;
  power_and_reset: boolean;
  pin_guard: boolean;
}
