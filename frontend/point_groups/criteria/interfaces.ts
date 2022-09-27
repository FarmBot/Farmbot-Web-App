import { TaggedPointGroup, PointType, TaggedPoint, TaggedTool } from "farmbot";
import {
  PointGroup, PointGroupSortType,
} from "farmbot/dist/resources/api_resources";
import { BotSize } from "../../farm_designer/map/interfaces";
import { UUID } from "../../resources/interfaces";
import { ToolTransformProps } from "../../tools/interfaces";

export type PointGroupCriteria = PointGroup["criteria"];
export type StringEqCriteria = PointGroupCriteria["string_eq"];
export type PointerType = PointType;
export type StrAndNumCriteriaKeys = (keyof Omit<PointGroupCriteria, "day">)[];
export type EqCriteria<T> = Record<string, T[] | undefined>;

export const POINTER_TYPES: PointerType[] =
  ["Plant", "GenericPointer", "Weed", "ToolSlot"];

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
  botSize: BotSize;
  selectionPointType: PointType[] | undefined;
}

export interface GroupCriteriaState {
  advanced: boolean;
  clearCount: number;
  dayChanged: boolean;
}

export interface ClearCriteriaProps {
  dispatch: Function;
  group: TaggedPointGroup;
}

export interface ClearPointIdsProps {
  dispatch: Function;
  group: TaggedPointGroup;
}

export interface GroupPointCountBreakdownProps {
  group: TaggedPointGroup;
  dispatch: Function;
  pointsSelectedByGroup: TaggedPoint[];
  iconDisplay: boolean;
  hovered: UUID | undefined;
  tools: TaggedTool[];
  toolTransformProps: ToolTransformProps;
  tryGroupSortType: PointGroupSortType | undefined;
}

export interface PointTypeSelectionProps {
  dispatch: Function;
  group: TaggedPointGroup;
  pointTypes: PointerType[];
}

export interface CriteriaSelectionProps {
  criteria: PointGroupCriteria;
  group: TaggedPointGroup;
  dispatch: Function;
}

export interface DaySelectionProps extends CriteriaSelectionProps {
  dayChanged: boolean;
  changeDay(state: boolean): void;
  advanced: boolean;
}

export interface LocationSelectionProps extends CriteriaSelectionProps {
  editGroupAreaInMap: boolean;
  botSize: BotSize;
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

export interface PointSubCriteriaProps extends SubCriteriaProps {
  pointerType: PointerType;
}

export interface PlantSubCriteriaProps extends SubCriteriaProps {
  slugs: string[];
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

export interface SubCriteriaSectionProps {
  dispatch: Function;
  group: TaggedPointGroup;
  disabled: boolean;
  pointerTypes: PointerType[];
  slugs: string[];
}

export interface ClearCategoryProps {
  group: TaggedPointGroup;
  criteriaCategories: StrAndNumCriteriaKeys;
  criteriaKeys: string[];
  dispatch: Function;
}

export type CheckboxListItem<T> = { label: string, value: T, color?: string };

export interface CheckboxListProps<T> {
  criteriaKey: string;
  list: CheckboxListItem<T>[];
  dispatch: Function;
  group: TaggedPointGroup;
  pointerType: PointerType;
  disabled?: boolean;
}
