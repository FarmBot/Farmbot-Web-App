import { ResourceColor } from "../interfaces";
import { TaggedRegimen } from "farmbot";

export interface CalendarRow {
  day: string;
  items: RegimenItemCalendarRow[];
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
  /** Variable labels. */
  variables: (string | undefined)[];
}

/** Used by UI widgets that modify a regimen */
export interface RegimenProps {
  regimen: TaggedRegimen;
  dispatch: Function;
}

/** A list of "Sequence" scheduled after a starting point (epoch). */
export interface Regimen {
  id?: number;
  /** Friendly identifier for humans to easily identify regimens. */
  name: string;
  color: ResourceColor;
  regimen_items: RegimenItem[];
}

export interface RegimenListItemProps {
  regimen: TaggedRegimen;
  dispatch: Function;
  inUse: boolean;
}

/** Individual step that a regimen will execute at a point in time. */
export interface RegimenItem {
  id?: number;
  sequence_id: number;
  regimen_id?: number;
  /** Time (in milliseconds) to wait before executing the sequence */
  time_offset: number;
}
