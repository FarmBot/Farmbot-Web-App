import { ResourceColor } from "../interfaces";
import {
  Sequence as CeleryScriptSequence,
  SequenceBodyItem,
  LegalArgString,
  SyncStatus,
  ALLOWED_CHANNEL_NAMES,
  Xyz,
  FarmwareConfig,
  ALLOWED_MESSAGE_TYPES,
  Vector3,
} from "farmbot";
import { StepMoveDataXfer, StepSpliceDataXfer } from "../draggable/interfaces";
import { TaggedSequence } from "farmbot";
import { ResourceIndex, VariableNameSet, UUID } from "../resources/interfaces";
import { ShouldDisplay } from "../devices/interfaces";

export interface HardwareFlags {
  findHomeEnabled: Record<Xyz, boolean>;
  stopAtHome: Record<Xyz, boolean>;
  stopAtMax: Record<Xyz, boolean>;
  negativeOnly: Record<Xyz, boolean>;
  axisLength: Record<Xyz, number>;
}

export interface CheckConflictCaseProps {
  axis: Xyz;
  target: number;
  hardwareFlags: HardwareFlags;
}

export interface MoveAbsoluteWarningProps {
  vector: Vector3 | undefined;
  offset: Vector3;
  hardwareFlags: HardwareFlags | undefined;
}

export interface Props {
  dispatch: Function;
  sequences: TaggedSequence[];
  sequence: TaggedSequence | undefined;
  resources: ResourceIndex;
  syncStatus: SyncStatus;
  hardwareFlags: HardwareFlags;
  farmwareInfo: FarmwareInfo;
  shouldDisplay: ShouldDisplay;
  confirmStepDeletion: boolean;
  menuOpen: boolean;
  stepIndex: number | undefined;
}

export interface SequenceEditorMiddleProps {
  dispatch: Function;
  sequence: TaggedSequence | undefined;
  resources: ResourceIndex;
  syncStatus: SyncStatus;
  hardwareFlags: HardwareFlags;
  farmwareInfo: FarmwareInfo;
  shouldDisplay: ShouldDisplay;
  confirmStepDeletion: boolean;
  menuOpen: boolean;
}

export interface ActiveMiddleProps extends SequenceEditorMiddleProps {
  sequence: TaggedSequence;
}

export interface SequenceHeaderProps {
  dispatch: Function;
  sequence: TaggedSequence;
  syncStatus: SyncStatus;
  resources: ResourceIndex;
  shouldDisplay: ShouldDisplay;
  menuOpen: boolean;
  variablesCollapsed: boolean;
  toggleVarShow: () => void;
  confirmStepDeletion: boolean;
}

export type ChannelName = ALLOWED_CHANNEL_NAMES;

export const INT_NUMERIC_FIELDS = ["milliseconds", "pin_mode", "pin_number",
  "pin_value", "rhs", "sequence_id", "speed"];

export const FLOAT_NUMERIC_FIELDS = ["x", "y", "z"];

export const NUMERIC_FIELDS = INT_NUMERIC_FIELDS.concat(FLOAT_NUMERIC_FIELDS);

export enum MessageType {
  success = "success",
  busy = "busy",
  warn = "warn",
  error = "error",
  info = "info",
  fun = "fun",
  debug = "debug"
}

export const MESSAGE_TYPES = Object.keys(MessageType);

// tslint:disable-next-line:no-any
export const isMessageType = (x: any): x is ALLOWED_MESSAGE_TYPES =>
  MESSAGE_TYPES.includes(x);

export interface Sequence extends CeleryScriptSequence {
  id?: number;
  color: ResourceColor;
  name: string;
}

export interface SequenceReducerState {
  current: string | undefined;
  menuOpen: boolean;
  stepIndex: number | undefined;
}

export interface SequencesListProps {
  sequences: TaggedSequence[];
  resourceUsage: Record<UUID, boolean | undefined>;
  sequence: TaggedSequence | undefined;
  dispatch: Function;
  sequenceMetas: Record<UUID, VariableNameSet | undefined>;
}

export interface SequencesListState {
  searchTerm: string;
}

export interface MoveAbsState {
  more: boolean;
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
  index?: number | undefined;
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
  fieldOverride?: boolean;
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
  confirmStepDeletion: boolean;
}
