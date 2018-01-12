import { BotStateTree } from "farmbot";
import {
  McuParamName,
  ConfigurationName,
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
import { RestResources, ResourceIndex } from "../resources/interfaces";
import { TaggedUser } from "../resources/tagged_resources";
import { WD_ENV } from "../farmware/weed_detector/remote_env/interfaces";
import { EncoderDisplay } from "../controls/interfaces";
import { ConnectionStatus, ConnectionState } from "../connectivity/interfaces";
import { IntegerSize } from "../util";

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
}

/** How the device is stored in the API side.
 * This is what comes back from the API as JSON.
 */
export interface DeviceAccountSettings {
  id: number;
  name: string;
  timezone?: string | undefined;
  tz_offset_hrs: number;
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
  /** Is the bot in sync with the api */
  dirty: boolean;
  /** The state of the bot, as reported by the bot over MQTT. */
  hardware: HardwareState;
  /** Hardware settings auto update on blur. Tells the UI if it should load a
   * spinner or not. */
  isUpdating?: boolean;
  controlPanelState: ControlPanelState;
  /** The inversions for the jog buttons on the controls page. */
  axis_inversion: Record<Xyz, boolean>;
  /** The display setting for encoder data on the controls page. */
  encoder_visibility: Record<EncoderDisplay, boolean>;
  /** Have all API requests been acknowledged by external services? This flag
   * lets us know if it is safe to do data critical tasks with the bot */
  consistent: boolean;
  connectivity: ConnectionState;
}

export interface BotProp {
  bot: BotState;
}

/** Status registers for the bot's status */
export type HardwareState = BotStateTree;

export interface GithubRelease {
  tag_name: string;
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
  auth: AuthState;
  dispatch: Function;
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

export interface StepsPerMMBoxProps {
  bot: BotState;
  setting: ConfigurationName;
  dispatch: Function;
  disabled?: boolean;
}

export interface McuInputBoxProps {
  bot: BotState;
  setting: McuParamName;
  dispatch: Function;
  intSize?: IntegerSize;
  filter?: number;
}

export interface EStopButtonProps {
  bot: BotState;
  user: TaggedUser | undefined;
}

export interface PeripheralsProps {
  resources: RestResources;
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
  syncStatus: SyncStatus;
  farmwares: Dictionary<FarmwareManifest | undefined>;
  timeOffset: number;
}

export interface HardwareSettingsProps {
  controlPanelState: ControlPanelState;
  dispatch: Function;
  bot: BotState;
}

export interface ControlPanelState {
  homing_and_calibration: boolean;
  motors: boolean;
  encoders_and_endstops: boolean;
  danger_zone: boolean;
  power_and_reset: boolean;
  pin_guard: boolean;
}
