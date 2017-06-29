import { Color } from "../interfaces";
import { AuthState } from "../auth/interfaces";
import {
  Sequence as CeleryScriptSequence,
  SequenceBodyItem,
  LegalArgString
} from "farmbot";
import { StepMoveDataXfer, StepSpliceDataXfer } from "../draggable/interfaces";
import {
  TaggedSequence,
  TaggedTool,
  TaggedToolSlotPointer
} from "../resources/tagged_resources";
import { ResourceIndex } from "../resources/interfaces";
import { JSXChildren } from "../util";

export interface Props {
  dispatch: Function;
  sequences: TaggedSequence[];
  tools: TaggedTool[];
  slots: TaggedToolSlotPointer[];
  sequence: TaggedSequence | undefined;
  auth: AuthState | undefined;
  resources: ResourceIndex;
}

export interface SequenceEditorMiddleProps {
  dispatch: Function;
  sequence: TaggedSequence | undefined;
  /** @deprecated Use props.resources now. */
  sequences: TaggedSequence[];
  /** @deprecated Use props.resources now. */
  tools: TaggedTool[];
  /** @deprecated Use props.resources now. */
  slots: TaggedToolSlotPointer[];
  resources: ResourceIndex;
}

export interface ActiveMiddleProps extends SequenceEditorMiddleProps {
  sequence: TaggedSequence;
}

export type CHANNEL_NAME = "toast" | "ticker";

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

export interface PickerProps {
  current: Color;
  onChange?: (color: Color) => any;
}

export interface PickerState {
  isOpen: boolean;
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

export interface StepParams {
  currentSequence: TaggedSequence;
  currentStep: SequenceBodyItem;
  dispatch: Function;
  index: number;
  /** @deprecated Use props.resources now. */
  sequences: TaggedSequence[];
  /** @deprecated Use props.resources now. */
  tools: TaggedTool[];
  /** @deprecated Use props.resources now. */
  slots: TaggedToolSlotPointer[];
  resources: ResourceIndex;
}
