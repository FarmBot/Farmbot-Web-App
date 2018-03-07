import { Color } from "../interfaces";
import { AuthState } from "../auth/interfaces";
import {
  Sequence as CeleryScriptSequence,
  SequenceBodyItem,
  LegalArgString,
  SyncStatus,
  ALLOWED_CHANNEL_NAMES,
  Xyz
} from "farmbot";
import { StepMoveDataXfer, StepSpliceDataXfer } from "../draggable/interfaces";
import { TaggedSequence } from "../resources/tagged_resources";
import { ResourceIndex } from "../resources/interfaces";
import { JSXChildren } from "../util";

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
  consistent: boolean;
  autoSyncEnabled: boolean;
  hardwareFlags: HardwareFlags;
  farmwareInfo: FarmwareInfo;
  installedOsVersion: string | undefined;
}

export interface SequenceEditorMiddleProps {
  dispatch: Function;
  sequence: TaggedSequence | undefined;
  resources: ResourceIndex;
  syncStatus: SyncStatus;
  consistent: boolean;
  autoSyncEnabled: boolean;
  hardwareFlags: HardwareFlags;
  farmwareInfo: FarmwareInfo;
  installedOsVersion: string | undefined;
}

export interface ActiveMiddleProps extends SequenceEditorMiddleProps {
  sequence: TaggedSequence;
  syncStatus: SyncStatus;
  consistent: boolean;
  autoSyncEnabled: boolean;
}

export type ChannelName = ALLOWED_CHANNEL_NAMES;

export const NUMERIC_FIELDS = ["milliseconds", "pin_mode", "pin_number",
  "pin_value", "rhs", "sequence_id", "speed", "x", "y", "z"];

export interface Sequence extends CeleryScriptSequence {
  id?: number;
  color: Color;
  name: string;
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
  children?: JSXChildren;
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

export type CHANGE_STEP = "CHANGE_STEP";

export type CHANGE_STEP_SELECT = "CHANGE_STEP_SELECT" | "UPDATE_SUB_SEQUENCE";

export interface ChangeStepSelect {
  type: CHANGE_STEP_SELECT;
  payload: {
    value: number | string;
    index: number;
    field: string;
    type?: string;
  };
}

export interface SelectSequence {
  type: "SELECT_SEQUENCE";
  payload: string;
}

export type DataXferObj = StepMoveDataXfer | StepSpliceDataXfer;

export type dispatcher = (a: Function | { type: string }) => DataXferObj;

export interface FarmwareInfo {
  farmwareNames: string[];
  firstPartyFarmwareNames: string[];
  showFirstPartyFarmware: boolean;
}

export interface StepParams {
  currentSequence: TaggedSequence;
  currentStep: SequenceBodyItem;
  dispatch: Function;
  index: number;
  resources: ResourceIndex;
  hardwareFlags?: HardwareFlags;
  farmwareInfo?: FarmwareInfo;
  installedOsVersion?: string | undefined;
}
