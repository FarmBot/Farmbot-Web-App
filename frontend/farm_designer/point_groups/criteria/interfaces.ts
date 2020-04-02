import { TaggedPointGroup, PointType } from "farmbot";
import { PointGroup } from "farmbot/dist/resources/api_resources";

export type PointGroupCriteria = PointGroup["criteria"];
export type StringEqCriteria = PointGroupCriteria["string_eq"];
export type PointerType = PointType;
export type StrAndNumCriteriaKeys = (keyof Omit<PointGroupCriteria, "day">)[];
export type EqCriteria<T> = Record<string, T[] | undefined>;

export const POINTER_TYPES: PointerType[] =
  ["Plant", "GenericPointer", "ToolSlot", "Weed"];

export const DEFAULT_CRITERIA: Readonly<PointGroupCriteria> = {
  day: { op: "<", days_ago: 0 },
  number_eq: {},
  number_gt: {},
  number_lt: {},
  string_eq: {},
};

export interface GroupCriteriaProps {
  dispatch: Function;
  group: TaggedPointGroup;
  slugs: string[];
  editGroupAreaInMap: boolean;
}

export interface GroupCriteriaState {
  advanced: boolean;
  clearCount: number;
}

export interface ClearCriteriaProps {
  dispatch: Function;
  group: TaggedPointGroup;
}

export interface GroupPointCountBreakdownProps {
  manualCount: number;
  totalCount: number;
}

export interface CriteriaSelectionProps {
  criteria: PointGroupCriteria;
  group: TaggedPointGroup;
  dispatch: Function;
}

export interface LocationSelectionProps extends CriteriaSelectionProps {
  editGroupAreaInMap: boolean;
}

export interface EqCriteriaSelectionProps<T> extends CriteriaSelectionProps {
  type: "string" | "number";
  eqCriteria: EqCriteria<T>;
  criteriaKey: keyof PointGroupCriteria;
}

export interface NumberCriteriaProps extends CriteriaSelectionProps {
  criteriaKey: "number_lt" | "number_gt";
}

export interface AddEqCriteriaProps<T> {
  dispatch: Function;
  group: TaggedPointGroup;
  type: "string" | "number";
  eqCriteria: EqCriteria<T>;
  criteriaKey: keyof PointGroupCriteria;
}

export interface AddEqCriteriaState {
  key: string;
  value: string;
}

export interface AddNumberCriteriaState {
  key: string;
  value: number;
}

export interface SubCriteriaProps {
  dispatch: Function;
  group: TaggedPointGroup;
  disabled: boolean;
}

export interface PlantSubCriteriaProps extends SubCriteriaProps {
  slugs: string[];
}

export interface CheckboxSelectionsProps {
  dispatch: Function;
  group: TaggedPointGroup;
  slugs: string[];
}

export interface CheckboxSelectionsState {
  Plant: boolean;
  GenericPointer: boolean;
  ToolSlot: boolean;
  Weed: boolean;
}

export interface NumberLtGtInputProps {
  criteriaKey: "x" | "y" | "radius";
  group: TaggedPointGroup;
  dispatch: Function;
  inputWidth?: number;
  labelWidth?: number;
  disabled?: boolean;
  pointerType?: PointerType;
}

export interface ClearCategoryProps {
  group: TaggedPointGroup;
  criteriaCategories: StrAndNumCriteriaKeys;
  criteriaKey: string;
  dispatch: Function;
}

export interface CheckboxListProps<T> {
  criteriaKey: string;
  list: { label: string, value: T }[];
  dispatch: Function;
  group: TaggedPointGroup;
  pointerType: PointerType;
  disabled?: boolean;
}
