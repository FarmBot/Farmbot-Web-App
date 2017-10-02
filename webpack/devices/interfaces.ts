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
import { RestResources } from "../resources/interfaces";
import { TaggedUser } from "../resources/tagged_resources";
import { WD_ENV } from "../farmware/weed_detector/remote_env/interfaces";
import { EncoderDisplay } from "../controls/interfaces";
import { ConnectionStatus } from "../connectivity/interfaces";

export interface Props {
  userToApi: ConnectionStatus | undefined;
  userToMqtt: ConnectionStatus | undefined;
  botToMqtt: ConnectionStatus | undefined;
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
  timezone?: string | undefined;
  last_seen?: string | undefined;
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
  axis_inversion: Record<Xyz, boolean>;
  /** The display setting for encoder data on the controls page. */
  encoder_visibility: Record<EncoderDisplay, boolean>;
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
export type BotLocationData = Record<LocationName, BotPosition> | undefined;

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
  disabled: boolean | undefined;
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
