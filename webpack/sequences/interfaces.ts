import { Color } from "../interfaces";
import { AuthState } from "../auth/interfaces";
import {
  Sequence as CeleryScriptSequence,
  SequenceBodyItem,
  LegalArgString,
  SyncStatus,
  ALLOWED_CHANNEL_NAMES,
  Xyz,
  FarmwareConfig
} from "farmbot";
import { StepMoveDataXfer, StepSpliceDataXfer } from "../draggable/interfaces";
import { TaggedSequence } from "../resources/tagged_resources";
import { ResourceIndex } from "../resources/interfaces";
import { ShouldDisplay } from "../devices/interfaces";

export interface HardwareFlags {
  findHomeEnabled: Record<Xyz, boolean>;
  stopAtHome: Record<Xyz, boolean>;
  stopAtMax: Record<Xyz, boolean>;
  negativeOnly: Record<Xyz, boolean>;
  axisLength: Record<Xyz, number>;
}

export interface Props {
  dispatch: Function;
  sequences: TaggedSequence[];
  sequence: TaggedSequence | undefined;
  auth: AuthState | undefined;
  resources: ResourceIndex;
  syncStatus: SyncStatus;
  hardwareFlags: HardwareFlags;
  farmwareInfo: FarmwareInfo;
  shouldDisplay: ShouldDisplay;
}

export interface SequenceEditorMiddleProps {
  dispatch: Function;
  sequence: TaggedSequence | undefined;
  resources: ResourceIndex;
  syncStatus: SyncStatus;
  hardwareFlags: HardwareFlags;
  farmwareInfo: FarmwareInfo;
  shouldDisplay: ShouldDisplay;
}

export interface ActiveMiddleProps extends SequenceEditorMiddleProps {
  sequence: TaggedSequence;
  syncStatus: SyncStatus;
}

export type ChannelName = ALLOWED_CHANNEL_NAMES;

export const NUMERIC_FIELDS = ["milliseconds", "pin_mode", "pin_number",
  "pin_value", "rhs", "sequence_id", "speed", "x", "y", "z"];

export interface Sequence extends CeleryScriptSequence {
  id?: number;
  color: Color;
  name: string;
  in_use?: boolean;
}

export interface SequenceReducerState {
  current: string | undefined;
}

export interface SequencesListProps {
  sequences: TaggedSequence[];
  sequence: TaggedSequence | undefined;
  dispatch: Function;
  auth: AuthState | undefined;
}

export interface SequencesListState {
  searchTerm: string;
}

/** Used when dispatching an updated message type. */
export interface MessageParams {
  value: string | number;
  index: number;
}

export interface MoveAbsState {
  isToolSelected: boolean;
}

export interface StepButtonParams {
  current: TaggedSequence | undefined;
  step: SequenceBodyItem;
  dispatch: Function;
  children?: React.ReactNode;
  color: "blue"
  | "green"
  | "orange"
  | "yellow"
  | "brown"
  | "red"
  | "purple"
  | "pink"
  | "gray";
}

export interface CopyParams {
  dispatch: Function;
  step: SequenceBodyItem;
}

export interface RemoveParams {
  index: number;
  dispatch: Function;
}

export interface StepInputProps {
  step: SequenceBodyItem;
  sequence: TaggedSequence;
  field: LegalArgString;
  dispatch: Function;
  type_?: "text" | "hidden" | undefined;
  index: number;
}

export interface StepTitleBarProps {
  step: SequenceBodyItem;
  index: number;
  dispatch: Function;
  sequence: TaggedSequence;
}

export interface SelectSequence {
  type: "SELECT_SEQUENCE";
  payload: string;
}

export type DataXferObj = StepMoveDataXfer | StepSpliceDataXfer;

export type dispatcher = (a: Function | { type: string }) => DataXferObj;

export type FarmwareConfigs = { [x: string]: FarmwareConfig[] };

export interface FarmwareInfo {
  farmwareNames: string[];
  firstPartyFarmwareNames: string[];
  showFirstPartyFarmware: boolean;
  farmwareConfigs: FarmwareConfigs;
}

export interface StepParams {
  currentSequence: TaggedSequence;
  currentStep: SequenceBodyItem;
  dispatch: Function;
  index: number;
  resources: ResourceIndex;
  hardwareFlags?: HardwareFlags;
  farmwareInfo?: FarmwareInfo;
  shouldDisplay?: ShouldDisplay;
}
