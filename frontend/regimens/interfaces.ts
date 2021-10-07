import { TaggedRegimen } from "farmbot";
import { RegimenItem } from "farmbot/dist/resources/api_resources";

export interface CalendarRow {
  day: string;
  items: RegimenItemCalendarRow[];
}

export interface RegimenItemCalendarRow {
  regimen: TaggedRegimen;
  item: RegimenItem;
  sequenceName: string;
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

export interface RegimenListItemProps {
  regimen: TaggedRegimen;
  dispatch: Function;
  inUse: boolean;
}
