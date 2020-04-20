import { isNumber, some } from "lodash";
import {
  StringEqCriteria,
  PointerType,
  PointGroupCriteria,
  StrAndNumCriteriaKeys,
  POINTER_TYPES,
} from "./interfaces";

/** Check if equal criteria values exist. */
export const eqCriteriaSelected =
  <T extends string | number>(criteria: PointGroupCriteria) =>
    (key: string, value: T): boolean => {
      if (typeof value == "string") {
        return !!criteria.string_eq[key]?.includes(value);
      }
      if (typeof value == "number") {
        return !!criteria.number_eq[key]?.includes(value);
      }
      return false;
    };

/** Check if string equal criteria fields exist. */
const strCriteriaHasKey = (stringCriteria: StringEqCriteria) =>
  (key: string) => (stringCriteria[key]?.length || 0) > 0;

/** Check if number criteria fields exist. */
const numCriteriaHasKey = (criteria: PointGroupCriteria) =>
  (key: string) => (criteria.number_eq[key]?.length || 0) > 0
    || isNumber(criteria.number_lt[key])
    || isNumber(criteria.number_gt[key]);

/** Check if a string or number criteria field exists. */
export const criteriaHasKey = (
  criteria: PointGroupCriteria,
  categories: StrAndNumCriteriaKeys,
  key: string,
) =>
  some(categories.map(category => {
    switch (category) {
      case "string_eq":
        return strCriteriaHasKey(criteria.string_eq)(key);
      case "number_eq":
        return (criteria.number_eq[key]?.length || 0) > 0;
      case "number_lt":
        return isNumber(criteria.number_lt[key]);
      case "number_gt":
        return isNumber(criteria.number_gt[key]);
    }
  }));

/** Check for point type specific sub criteria. */
export const hasSubCriteria = (criteria: PointGroupCriteria) =>
  (pointerType: PointerType) => {
    const selected = strCriteriaHasKey(criteria.string_eq);
    const numSelected = numCriteriaHasKey(criteria);
    switch (pointerType) {
      case "GenericPointer":
        return !!(
          selected("meta.color")
          || numSelected("radius"));
      case "Weed":
        return !!(
          selected("meta.created_by")
          || selected("plant_stage")
          || selected("meta.color")
          || numSelected("radius"));
      case "Plant":
        return !!(
          selected("openfarm_slug")
          || selected("plant_stage"));
      case "ToolSlot":
        return !!(
          numSelected("tool_id")
          || numSelected("pullout_direction")
          || numSelected("gantry_mounted"));
    }
  };

/** Check for criteria specific to other point types. */
export const typeDisabled =
  (criteria: PointGroupCriteria, pointerType: PointerType): boolean =>
    some(POINTER_TYPES
      .filter(x => x != pointerType)
      .map(hasSubCriteria(criteria)));
