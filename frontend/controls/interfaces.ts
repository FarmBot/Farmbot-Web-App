import {
  BotPosition, BotState, ShouldDisplay, UserEnv,
} from "../devices/interfaces";
import {
  Vector3, McuParams, Xyz, AxisState, SyncStatus, TaggedSequence,
  FirmwareHardware, TaggedPeripheral, TaggedWebcamFeed,
} from "farmbot";
import { ResourceIndex, UUID } from "../resources/interfaces";
import { GetWebAppConfigValue } from "../config_storage/actions";

export interface AxisDisplayGroupProps {
  position: BotPosition;
  label: string;
  firmwareSettings?: McuParams;
  missedSteps?: BotPosition;
  axisStates?: Record<Xyz, AxisState | undefined>;
  busy?: boolean;
  style?: React.CSSProperties;
}

export interface AxisProps {
  val: number | undefined;
  axis: Xyz;
  detectionEnabled: boolean;
  missedSteps: number | undefined;
  axisState: AxisState | undefined;
  busy: boolean | undefined;
  index: number;
}

export interface AxisInputBoxGroupProps {
  onCommit: (v: Vector3) => void;
  position: BotPosition;
  disabled: boolean | undefined;
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
  menuOpen: UUID | undefined;
  dispatch: Function;
}

export interface DesignerControlsProps {
  dispatch: Function;
  bot: BotState;
  feeds: TaggedWebcamFeed[];
  peripherals: TaggedPeripheral[];
  sequences: TaggedSequence[];
  resources: ResourceIndex;
  menuOpen: UUID | undefined;
  firmwareSettings: McuParams;
  getConfigValue: GetWebAppConfigValue;
  env: UserEnv;
  firmwareHardware: FirmwareHardware | undefined;
  shouldDisplay: ShouldDisplay;
}
