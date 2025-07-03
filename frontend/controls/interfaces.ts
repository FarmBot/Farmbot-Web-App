import {
  BotPosition, BotState, SourceFwConfig, UserEnv,
} from "../devices/interfaces";
import {
  Vector3, McuParams, Xyz, AxisState, SyncStatus, TaggedSequence,
  FirmwareHardware, TaggedPeripheral, TaggedWebcamFeed, TaggedLog,
} from "farmbot";
import { ResourceIndex } from "../resources/interfaces";
import { GetWebAppConfigValue } from "../config_storage/actions";
import { MovementState } from "../interfaces";
import { PinBindingListItems } from "../settings/pin_bindings/interfaces";
import { RunButtonMenuOpen } from "../sequences/interfaces";

export interface AxisDisplayGroupProps {
  position: BotPosition;
  label: string;
  firmwareSettings?: McuParams;
  missedSteps?: BotPosition;
  axisStates?: Record<Xyz, AxisState | undefined>;
  busy?: boolean;
  style?: React.CSSProperties;
  highlightAxis?: Xyz;
  noValues?: boolean;
}

export interface AxisProps {
  val: number | undefined;
  axis: Xyz;
  detectionEnabled: boolean;
  missedSteps: number | undefined;
  axisState: AxisState | undefined;
  busy: boolean | undefined;
  index: number;
  highlight?: boolean;
  noValues?: boolean;
}

export interface AxisInputBoxGroupProps {
  onCommit: (v: Vector3) => Promise<false | void> | undefined;
  position: BotPosition;
  disabled: boolean | undefined;
  locked: boolean;
  dispatch: Function;
}

export interface AxisInputBoxGroupState {
  x?: number | undefined;
  y?: number | undefined;
  z?: number | undefined;
}

export interface AxisInputBoxProps {
  axis: Xyz;
  value: number | undefined;
  onChange: (key: string, val: number | undefined) => void;
}

export interface PinnedSequencesProps {
  syncStatus: SyncStatus | undefined;
  sequences: TaggedSequence[];
  resources: ResourceIndex;
  menuOpen: RunButtonMenuOpen;
  dispatch: Function;
}

export interface DesignerControlsProps {
  dispatch: Function;
  bot: BotState;
  feeds: TaggedWebcamFeed[];
  peripherals: TaggedPeripheral[];
  sequences: TaggedSequence[];
  resources: ResourceIndex;
  menuOpen: RunButtonMenuOpen;
  firmwareSettings: McuParams;
  getConfigValue: GetWebAppConfigValue;
  sourceFwConfig: SourceFwConfig;
  env: UserEnv;
  firmwareHardware: FirmwareHardware | undefined;
  movementState: MovementState;
  pinBindings: PinBindingListItems[];
  logs: TaggedLog[];
}
