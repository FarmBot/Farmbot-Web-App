import { BotStateTree } from "farmbot";
import {
  ALLOWED_MESSAGE_TYPES,
  McuParamName,
  ConfigurationName,
  Dictionary,
  SyncStatus,
  FarmwareManifest
} from "farmbot";
import { AuthState } from "../auth/interfaces";
import {
  TaggedImage,
  TaggedPeripheral,
  TaggedDevice
} from "../resources/tagged_resources";
import { RestResources } from "../resources/interfaces";
import { TaggedUser } from "../resources/tagged_resources";
import { WD_ENV } from "../images/weed_detector/remote_env/interfaces";

export interface Props {
  auth: AuthState | undefined;
  bot: BotState;
  deviceAccount: TaggedDevice;
  images: TaggedImage[];
  dispatch: Function;
}

/** How the device is stored in the API side.
 * This is what comes back from the API as JSON.
 */
export interface DeviceAccountSettings {
  id: number;
  name: string;
  webcam_url?: string;
  timezone?: string | undefined;
};

/** Meta information about a log message. */
interface Meta {
  type: ALLOWED_MESSAGE_TYPES;
  /** Bot Position X */
  x: number | undefined;
  /** Bot Position Y */
  y: number | undefined;
  /** Bot Position Z */
  z: number | undefined;
}

export interface BotState {
  /** How many steps to move when the user presses a manual movement arrow */
  stepSize: number;
  /** The current os version on the github release api */
  currentOSVersion?: string;
  /** The current fw version on the github release api */
  currentFWVersion?: string;
  /** Is the bot in sync with the api */
  dirty: boolean;
  /** The state of the bot, as reported by the bot over MQTT. */
  hardware: HardwareState;
  /** Hardware settings auto update on blur. Tells the UI if it should load a
   * spinner or not. */
  isUpdating?: boolean;
  controlPanelState: ControlPanelState;
  /** The inversions for the jog buttons on the controls page. */
  x_axis_inverted: boolean;
  y_axis_inverted: boolean;
  z_axis_inverted: boolean;
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
  cameraStatus: "" | "sending" | "done" | "error";
}

export interface StepsPerMMBoxProps {
  bot: BotState;
  setting: ConfigurationName;
  dispatch: Function;
}

export interface McuInputBoxProps {
  bot: BotState;
  setting: McuParamName;
  dispatch: Function;
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
}

export interface FarmwareProps {
  dispatch: Function;
  env: Partial<WD_ENV>;
  images: TaggedImage[];
  currentImage: TaggedImage | undefined;
  syncStatus: SyncStatus;
  farmwares: Dictionary<FarmwareManifest | undefined>;
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
}
