import { CalendarRow, RegimenItemCalendarRow } from "../interfaces";
import { TaggedRegimen } from "farmbot";
import { Actions } from "../../constants";
import { ResourceIndex, VariableNameSet } from "../../resources/interfaces";

export interface ActiveEditorProps {
  regimen: TaggedRegimen;
  calendar: CalendarRow[];
  dispatch: Function;
  resources: ResourceIndex;
  variableData: VariableNameSet;
}

export interface ActiveEditorState {
  variablesCollapsed: boolean;
}

export interface RegimenItemListProps {
  calendar: RegimenItemCalendarRow[];
  dispatch: Function;
}

export interface RegimenItemStepProps {
  item: CalendarRow;
  dispatch: Function;
}

export interface RegimenItemDayGroupProps {
  row: CalendarRow;
  dispatch: Function;
}

export interface RegimenEditorProps {
  current: TaggedRegimen | undefined;
  dispatch: Function;
  calendar: CalendarRow[];
  resources: ResourceIndex;
  variableData: VariableNameSet;
}

export interface CopyButtonProps {
  dispatch: Function;
  regimen: TaggedRegimen;
}

export interface SelectRegimen {
  type: Actions.SELECT_REGIMEN;
  payload: string;
}

export interface RegimenRowsProps {
  regimen: TaggedRegimen;
  calendar: CalendarRow[];
  dispatch: Function;
  varsCollapsed: boolean;
  resources: ResourceIndex;
}

export interface DisplayVarValueProps {
  row: RegimenItemCalendarRow;
  resources: ResourceIndex;
}
