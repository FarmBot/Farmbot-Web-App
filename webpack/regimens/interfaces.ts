import { Color } from "../interfaces";
import { Week } from "./bulk_scheduler/interfaces";
import { AuthState } from "../auth/interfaces";
import { BotState } from "../devices/interfaces";
import { TaggedRegimen, TaggedSequence } from "../resources/tagged_resources";
import { ResourceIndex } from "../resources/interfaces";

export interface CalendarRow {
  day: string;
  items: RegimenItemCalendarRow[];
}

export interface Props {
  dispatch: Function;
  sequences: TaggedSequence[];
  auth: AuthState | undefined;
  bot: BotState;
  current: TaggedRegimen | undefined;
  regimens: TaggedRegimen[];
  resources: ResourceIndex;
  selectedSequence: TaggedSequence | undefined;
  dailyOffsetMs: number;
  weeks: Week[];
  calendar: CalendarRow[];
}

export interface RegimenItemCalendarRow {
  regimen: TaggedRegimen;
  item: RegimenItem;
  name: string;
  hhmm: string;
  color: string;
  /** Numeric field that can be used for sorting purposes. */
  sortKey: number;
  day: number;
  dispatch: Function;
}

/** Used by UI widgets that modify a regimen */
export interface RegimenProps {
  regimen?: TaggedRegimen;
  dispatch: Function;
}

/** A list of "Sequence" scheduled after a starting point (epoch). */
export interface Regimen {
  id?: number;
  /** Friendly identifier for humans to easily identify regimens. */
  name: string;
  color: Color;
  regimen_items: RegimenItem[];
  in_use?: boolean;
}

export interface RegimenListItemProps {
  length: number;
  regimen: TaggedRegimen;
  dispatch: Function;
  index: number;
}

/** Individual step that a regimen will execute at a point in time. */
export interface RegimenItem {
  id?: number;
  sequence_id: number;
  regimen_id?: number;
  /** Time (in milliseconds) to wait before executing the sequence */
  time_offset: number;
}

export interface AddRegimenProps {
  dispatch: Function;
  className?: string;
  children?: React.ReactNode;
  length: number;
}

export interface RegimensListProps {
  dispatch: Function;
  regimens: TaggedRegimen[];
  regimen: TaggedRegimen | undefined;
}

export interface RegimensListState {
  searchTerm: string;
}
