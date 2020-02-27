import { TaggedPointGroup } from "farmbot";
import { PointGroup } from "farmbot/dist/resources/api_resources";

export const DEFAULT_CRITERIA: Readonly<PointGroup["criteria"]> = {
  day: { op: "<", days_ago: 0 },
  number_eq: {},
  number_gt: {},
  number_lt: {},
  string_eq: {},
};

export type EqCriteria = Record<string, (string | number)[] | undefined> | undefined;
export type StringEqCriteria = PointGroup["criteria"]["string_eq"] | undefined;

export interface GroupCriteriaProps {
  dispatch: Function;
  group: TaggedPointGroup;
  slugs: string[];
}

export interface GroupCriteriaState {
  advanced: boolean;
  clearCount: number;
}

export interface GroupPointCountBreakdownProps {
  manualCount: number;
  totalCount: number;
}

export interface CriteriaSelectionProps {
  criteria: PointGroup["criteria"];
  group: TaggedPointGroup;
  dispatch: Function;
}

export interface LocationSelectionProps extends CriteriaSelectionProps {
}

export interface EqCriteriaSelectionProps<T> extends CriteriaSelectionProps {
  type: "string" | "number";
  criteriaField: Record<string, T[] | undefined> | undefined;
  criteriaKey: keyof PointGroup["criteria"];
}

export interface NumberCriteriaProps extends CriteriaSelectionProps {
  criteriaKey: "number_lt" | "number_gt";
}

export interface AddEqCriteriaProps<T> {
  dispatch: Function;
  group: TaggedPointGroup;
  type: "string" | "number";
  criteriaField: Record<string, T[] | undefined> | undefined;
  criteriaKey: keyof PointGroup["criteria"];
}

export interface AddEqCriteriaState {
  key: string;
  value: string;
}
export interface AddCriteriaState {
  key: string;
  value: string;
}

export interface AddStringCriteriaProps {
  group: TaggedPointGroup;
  dispatch: Function;
  slugs: string[];
}

export interface AddNumberCriteriaState {
  key: string;
  value: number;
}

export interface CheckboxSelectionsProps {
  dispatch: Function;
  group: TaggedPointGroup;
}
