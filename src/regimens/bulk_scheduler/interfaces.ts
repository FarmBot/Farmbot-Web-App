import { RegimenItem } from "../interfaces";
import { TaggedSequence } from "../../resources/tagged_resources";
import { ResourceIndex } from "../../resources/interfaces";

export interface BulkSchedulerOutput {
  index: number;
  regimenItems: RegimenItem[];
}

export interface BulkEditorProps {
  selectedSequence?: TaggedSequence;
  dailyOffsetMs: number;
  weeks: Week[];
  resources: ResourceIndex;
  sequences: TaggedSequence[];
  dispatch: Function;
}

export interface Week {
  days: {
    day1: boolean;
    day2: boolean;
    day3: boolean;
    day4: boolean;
    day5: boolean;
    day6: boolean;
    day7: boolean;
  };
}

export interface ToggleDayParams {
  week: number;
  day: number;
}

export interface AddButtonProps {
  active: boolean;
  click: React.EventHandler<React.FormEvent<{}>>;
}

export interface SequenceListProps {
  sequences: TaggedSequence[];
  current: TaggedSequence | undefined;
  dispatch: Function;
}

export interface WeekGridProps {
  weeks: Week[];
  dispatch: Function;
};

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

