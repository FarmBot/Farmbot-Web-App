import { isNumber, some } from "lodash";
import {
  StringEqCriteria,
  PointGroupCriteria,
  StrAndNumCriteriaKeys,
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
