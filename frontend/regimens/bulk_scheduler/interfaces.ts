import { TaggedDevice, TaggedRegimen, TaggedSequence } from "farmbot";
import { ResourceIndex } from "../../resources/interfaces";

export interface RegimenSchedulerProps {
  dispatch: Function;
  sequences: TaggedSequence[];
  current: TaggedRegimen | undefined;
  resources: ResourceIndex;
  selectedSequence: TaggedSequence | undefined;
  dailyOffsetMs: number;
  weeks: Week[];
  device: TaggedDevice;
}

export interface BulkEditorProps {
  selectedSequence?: TaggedSequence;
  dailyOffsetMs: number;
  weeks: Week[];
  resources: ResourceIndex;
  sequences: TaggedSequence[];
  dispatch: Function;
  device: TaggedDevice;
}

type WeekDay =
  | "day1"
  | "day2"
  | "day3"
  | "day4"
  | "day5"
  | "day6"
  | "day7";

export const DAYS: WeekDay[] = [
  "day1",
  "day2",
  "day3",
  "day4",
  "day5",
  "day6",
  "day7",
];

export interface Week {
  days: Record<WeekDay, boolean>;
}

export interface ToggleDayParams {
  week: number;
  day: number;
}

export interface AddButtonProps {
  active: boolean;
  onClick: React.EventHandler<React.FormEvent<{}>>;
}

export interface WeekGridProps {
  weeks: Week[];
  dispatch: Function;
}

export interface WeekRowProps {
  week: Week;
  index: number;
  dispatch: Function;
}

export interface DayProps {
  day: number;
  week: number;
  dispatch: Function;
  id: string;
  active: boolean;
}
