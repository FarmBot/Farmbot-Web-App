import {
  RegimenProps,
  CalendarRow,
  RegimenItemCalendarRow
} from "../interfaces";
import { TaggedRegimen } from "../../resources/tagged_resources";
import { Actions } from "../../constants";

export interface ActiveEditorProps {
  regimen: TaggedRegimen;
  calendar: CalendarRow[];
  dispatch: Function;
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
}

export interface CopyButtnProps {
  dispatch: Function;
  regimen?: TaggedRegimen;
}

export interface DeleteButtonProps extends RegimenProps {
  baseUrl: string;
}

export interface SelectRegimen {
  type: Actions.SELECT_REGIMEN;
  payload: string;
}
