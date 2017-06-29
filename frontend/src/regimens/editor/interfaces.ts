import {
  RegimenItem,
  RegimenProps,
  CalendarRow,
  RegimenItemCalendarRow,
  Regimen
} from "../interfaces";
import { AuthState } from "../../auth/interfaces";
import { BotState } from "../../devices/interfaces";
import { TaggedRegimen } from "../../resources/tagged_resources";

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

export interface RegimenEditorWidgetProps {
  current: TaggedRegimen | undefined;
  dispatch: Function;
  auth: AuthState | undefined;
  calendar: CalendarRow[];
  bot: BotState;
}

export interface CopyButtnProps {
  dispatch: Function;
  regimen?: TaggedRegimen;
}

export interface DeleteButtonProps extends RegimenProps {
  baseUrl: string;
};
