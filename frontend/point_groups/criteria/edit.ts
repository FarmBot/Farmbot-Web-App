import { TaggedPointGroup } from "farmbot";
import { cloneDeep, isNumber, isUndefined } from "lodash";
import { SelectionBoxData } from "../../farm_designer/map/background";
import {
  PointGroupCriteria, POINTER_TYPES, EqCriteria, PointerType,
  StrAndNumCriteriaKeys,
} from "./interfaces";
import { error } from "../../toast/toast";
import { t } from "../../i18next_wrapper";
import { overwriteGroup } from "../actions";

/** Update and save group criteria. */
export const editCriteria =
  (group: TaggedPointGroup, update: Partial<PointGroupCriteria>) =>
    (dispatch: Function) => {
      const criteria = {
        string_eq: update.string_eq || group.body.criteria.string_eq,
        day: update.day || group.body.criteria.day,
        number_eq: update.number_eq || group.body.criteria.number_eq,
        number_gt: update.number_gt || group.body.criteria.number_gt,
        number_lt: update.number_lt || group.body.criteria.number_lt,
      };
      dispatch(overwriteGroup(group, { ...group.body, criteria }));
    };

/** Toggle string or number equal criteria. */
export const toggleEqCriteria =
  <T extends string | number>(
    eqCriteria: EqCriteria<T>,
    direction?: "on" | "off",
  ) => (key: string, value: T) => {
    const values: T[] = eqCriteria[key] || [];
    if (values.includes(value)) {
      if (direction != "on") {
        const newValues = values.filter(s => s != value);
        eqCriteria[key] = newValues;
        !newValues.length && delete eqCriteria[key];
      }
    } else {
      if (direction != "off") {
        values.push(value);
        eqCriteria[key] = values;
      }
    }
  };

/**
 * Toggle and save string or number equal criteria.
 * When adding criteria with a pointerType provided, clear incompatible criteria.
 */
export const toggleAndEditEqCriteria =
  <T extends string | number>(
    group: TaggedPointGroup,
    key: string,
    value: T,
    pointerType?: PointerType,
  ) =>
    (dispatch: Function) => {
      const tempCriteria = cloneDeep(group.body.criteria);
      const criteriaField = typeof value == "string" ? "string_eq" : "number_eq";
      const tempEqCriteria = tempCriteria[criteriaField] as EqCriteria<T>;
      const wasOff = !tempEqCriteria[key]?.includes(value);
      toggleEqCriteria<T>(tempEqCriteria)(key, value);
      pointerType && wasOff && clearSubCriteria(
        POINTER_TYPES.filter(x => x != pointerType), tempCriteria, key);
      dispatch(editCriteria(group, tempCriteria));
    };

/** Clear incompatible criteria. */
const clearSubCriteria = (
  pointerTypes: PointerType[],
  tempCriteria: PointGroupCriteria,
  keepKey: string,
) => {
  const toggleStrEq = toggleEqCriteria<string>(tempCriteria.string_eq, "off");
  const toggleNumEq = toggleEqCriteria<number>(tempCriteria.number_eq, "off");
  const toggleStrEqMapper = (key: string) => key != keepKey &&
    tempCriteria.string_eq[key]?.map(value => toggleStrEq(key, value));
  if (pointerTypes.includes("Plant")) {
    ["openfarm_slug", "plant_stage"].map(toggleStrEqMapper);
  }
  if (pointerTypes.includes("Weed")) {
    ["meta.created_by", "plant_stage"].map(toggleStrEqMapper);
  }
  if (pointerTypes.includes("GenericPointer") && pointerTypes.includes("Weed")) {
    ["meta.color"].map(toggleStrEqMapper);
  }
  if (pointerTypes.includes("GenericPointer")
    && pointerTypes.includes("Weed")
    && pointerTypes.includes("Plant")) {
    delete tempCriteria.number_lt.radius;
    delete tempCriteria.number_gt.radius;
  }
  if (pointerTypes.includes("ToolSlot")) {
    tempCriteria.number_eq.pullout_direction?.map(value =>
      toggleNumEq("pullout_direction", value));
  }
};

/**
 * Toggle and save pointer_type string equal criteria.
 * When removing pointer_type criteria, clear pointer_type-specific criteria.
 */
export const togglePointTypeCriteria =
  (group: TaggedPointGroup, pointerType: PointerType, clear = false) =>
    (dispatch: Function) => {
      const tempCriteria = cloneDeep(group.body.criteria);
      const toggle = toggleEqCriteria<string>(tempCriteria.string_eq);
      clear && (tempCriteria.string_eq.pointer_type = []);
      toggle("pointer_type", pointerType);
      clearSubCriteria(POINTER_TYPES.filter(x => x != pointerType),
        tempCriteria, "pointer_type");
      dispatch(editCriteria(group, tempCriteria));
    };

/** Clear and save all fields in the provided criteria categories. */
export const clearCriteriaField = (
  group: TaggedPointGroup,
  categories: StrAndNumCriteriaKeys,
  fields: string[],
) =>
  (dispatch: Function) => {
    const tempCriteria = cloneDeep(group.body.criteria);
    categories.map(category => fields.map(field =>
      delete tempCriteria[category][field]));
    dispatch(editCriteria(group, tempCriteria));
  };

/** For map selection box actions maybeUpdateGroup. */
export const editGtLtCriteria =
  (group: TaggedPointGroup, box: SelectionBoxData) =>
    (dispatch: Function) => {
      if (!(isNumber(box.x0) && isNumber(box.y0)
        && isNumber(box.x1) && isNumber(box.y1))) { return; }
      const tempGtCriteria = cloneDeep(group.body.criteria.number_gt);
      const tempLtCriteria = cloneDeep(group.body.criteria.number_lt);
      tempGtCriteria.x = Math.min(box.x0, box.x1);
      tempGtCriteria.y = Math.min(box.y0, box.y1);
      tempLtCriteria.x = Math.max(box.x0, box.x1);
      tempLtCriteria.y = Math.max(box.y0, box.y1);
      dispatch(editCriteria(group, {
        number_gt: tempGtCriteria,
        number_lt: tempLtCriteria,
      }));
    };

/** For EqCriteriaSelection form. */
export const removeEqCriteriaValue =
  <T extends string | number>(
    group: TaggedPointGroup,
    eqCriteria: EqCriteria<T>,
    eqCriteriaName: string,
    key: string,
    value: T,
  ) => (dispatch: Function) => {
    const tempCriteriaField = cloneDeep(eqCriteria);
    toggleEqCriteria<T>(tempCriteriaField, "off")(key, value);
    dispatch(editCriteria(group, { [eqCriteriaName]: tempCriteriaField }));
  };

/**
 * For criteria form NumberLtGtInput.
 * Clear incompatible criteria if pointer_type is provided.
 */
export const editGtLtCriteriaField = (
  group: TaggedPointGroup,
  criteriaField: "number_gt" | "number_lt",
  criteriaKey: string,
  pointerType?: PointerType,
) =>
  (e: React.FormEvent<HTMLInputElement>) =>
    (dispatch: Function) => {
      const tempCriteria = cloneDeep(group.body.criteria);
      pointerType && clearSubCriteria(
        POINTER_TYPES.filter(x => x != pointerType), tempCriteria, criteriaKey);
      const value = e.currentTarget.value != ""
        ? parseInt(e.currentTarget.value)
        : undefined;
      if (!isUndefined(value)) {
        const ltValue = tempCriteria.number_lt[criteriaKey];
        const gtValue = tempCriteria.number_gt[criteriaKey];
        if (criteriaField == "number_lt" && !isUndefined(gtValue) &&
          !(value > gtValue)) {
          return error(t("Value must be greater than {{ num }}.",
            { num: gtValue }));
        }
        if (criteriaField == "number_gt" && !isUndefined(ltValue) &&
          !(value < ltValue)) {
          return error(t("Value must be less than {{ num }}.",
            { num: ltValue }));
        }
      }
      tempCriteria[criteriaField][criteriaKey] = value;
      dispatch(editCriteria(group, tempCriteria));
    };
