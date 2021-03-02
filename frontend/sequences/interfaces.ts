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
  TaggedSequence,
} from "farmbot";
import { StepMoveDataXfer, StepSpliceDataXfer } from "../draggable/interfaces";
import { ResourceIndex, VariableNameSet, UUID } from "../resources/interfaces";
import { ShouldDisplay } from "../devices/interfaces";
import { GetWebAppConfigValue } from "../config_storage/actions";
import { Folders } from "../folders/component";
import { DeviceSetting } from "../constants";
import { BooleanConfigKey } from "farmbot/dist/resources/configs/web_app";

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
  coordinate: Vector3;
  hardwareFlags: HardwareFlags | undefined;
}

export interface SequencesProps {
  dispatch: Function;
  sequences: TaggedSequence[];
  sequence: TaggedSequence | undefined;
  resources: ResourceIndex;
  syncStatus: SyncStatus;
  hardwareFlags: HardwareFlags;
  farmwareData: FarmwareData;
  shouldDisplay: ShouldDisplay;
  getWebAppConfigValue: GetWebAppConfigValue;
  menuOpen: UUID | undefined;
  stepIndex: number | undefined;
  folderData: Folders["props"];
  visualized?: boolean;
  hoveredStep?: string | undefined;
}

export interface SequenceEditorMiddleProps {
  dispatch: Function;
  sequence: TaggedSequence | undefined;
  resources: ResourceIndex;
  syncStatus: SyncStatus;
  hardwareFlags: HardwareFlags;
  farmwareData: FarmwareData;
  getWebAppConfigValue: GetWebAppConfigValue;
  menuOpen: UUID | undefined;
  visualized?: boolean;
  hoveredStep?: string | undefined;
}

export interface ActiveMiddleProps extends SequenceEditorMiddleProps {
  sequence: TaggedSequence;
}

export interface ActiveMiddleState {
  variablesCollapsed: boolean;
  viewSequenceCeleryScript: boolean;
}

export interface SequenceHeaderProps {
  dispatch: Function;
  sequence: TaggedSequence;
  syncStatus: SyncStatus;
  resources: ResourceIndex;
  menuOpen: UUID | undefined;
  variablesCollapsed: boolean;
  toggleVarShow: () => void;
  toggleViewSequenceCeleryScript: () => void;
  getWebAppConfigValue: GetWebAppConfigValue;
  visualized?: boolean;
}

export interface SequenceBtnGroupProps {
  dispatch: Function;
  sequence: TaggedSequence;
  syncStatus: SyncStatus;
  resources: ResourceIndex;
  menuOpen: UUID | undefined;
  getWebAppConfigValue: GetWebAppConfigValue;
  toggleViewSequenceCeleryScript(): void;
  visualized?: boolean;
}

export interface SequenceSettingsMenuProps {
  dispatch: Function;
  getWebAppConfigValue: GetWebAppConfigValue;
}

export interface SequenceSettingProps {
  label: DeviceSetting;
  description: string;
  dispatch: Function;
  setting: BooleanConfigKey;
  getWebAppConfigValue: GetWebAppConfigValue;
  confirmation?: string;
  defaultOn?: boolean;
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
  debug = "debug",
  assertion = "assertion",
}

export const MESSAGE_TYPES = Object.keys(MessageType);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const isMessageType = (x: any): x is ALLOWED_MESSAGE_TYPES =>
  MESSAGE_TYPES.includes(x);

export interface Sequence extends CeleryScriptSequence {
  id?: number;
  color: ResourceColor;
  name: string;
}

export interface SequenceReducerState {
  current: string | undefined;
  menuOpen: UUID | undefined;
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
  viewRaw?: boolean;
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

export interface MoveParams {
  step: SequenceBodyItem;
  to: number;
  from: number;
  sequence: TaggedSequence
}

export interface SpliceParams {
  index: number;
  sequence: TaggedSequence;
  step: SequenceBodyItem;
}

export interface RemoveParams {
  index: number;
  dispatch: Function;
  sequence: TaggedSequence;
  confirmStepDeletion: boolean;
}

export interface StepInputProps {
  step: SequenceBodyItem;
  sequence: TaggedSequence;
  field: LegalArgString;
  dispatch: Function;
  type_?: "text" | "hidden" | undefined;
  index: number;
  fieldOverride?: boolean;
  keyCallback?: (key: string, buffer: string) => void;
}

export interface StepTitleBarProps {
  step: SequenceBodyItem;
  index: number;
  dispatch: Function;
  sequence: TaggedSequence;
  pinnedSequenceName: string | undefined;
  toggleDraggable(action: "enter" | "leave"): () => void;
}

export interface SelectSequence {
  type: "SELECT_SEQUENCE";
  payload: string;
}

export type DataXferObj = StepMoveDataXfer | StepSpliceDataXfer;

export type dispatcher = (a: Function | { type: string }) => DataXferObj;

export type FarmwareConfigs = { [x: string]: FarmwareConfig[] };

export interface FarmwareData {
  farmwareNames: string[];
  firstPartyFarmwareNames: string[];
  showFirstPartyFarmware: boolean;
  farmwareConfigs: FarmwareConfigs;
  cameraDisabled: boolean;
  cameraCalibrated: boolean;
}

export interface StepParams<T = SequenceBodyItem> {
  currentSequence: TaggedSequence;
  currentStep: T;
  dispatch: Function;
  index: number;
  resources: ResourceIndex;
  hardwareFlags?: HardwareFlags;
  farmwareData?: FarmwareData;
  showPins?: boolean;
  expandStepOptions?: boolean;
}

export interface StepState {
  viewRaw?: boolean;
}
