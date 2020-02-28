import { overwrite, save } from "../../../api/crud";
import { TaggedPointGroup } from "farmbot";
import { PointGroup } from "farmbot/dist/resources/api_resources";
import { cloneDeep, isNumber } from "lodash";
import { SelectionBoxData } from "../../map/background";
import { DEFAULT_CRITERIA } from "./interfaces";

export const editCriteria =
  (group: TaggedPointGroup, update: Partial<PointGroup["criteria"]>) =>
    (dispatch: Function) => {
      const criteria = {
        string_eq: update.string_eq || group.body.criteria?.string_eq || {},
        day: update.day || group.body.criteria?.day || DEFAULT_CRITERIA.day,
        number_eq: update.number_eq || group.body.criteria?.number_eq || {},
        number_gt: update.number_gt || group.body.criteria?.number_gt || {},
        number_lt: update.number_lt || group.body.criteria?.number_lt || {},
      };
      dispatch(overwrite(group, { ...group.body, criteria }));
      dispatch(save(group.uuid));
    };

export const toggleEqCriteria = <T extends string | number>(
  eqCriteria: Record<string, T[] | undefined>,
) =>
  (key: string, value: T): Record<string, T[] | undefined> => {
    const values: T[] = eqCriteria[key] || [];
    if (values.includes(value)) {
      const newValues = values.filter(s => s != value);
      eqCriteria[key] = newValues;
      !newValues.length && delete eqCriteria[key];
    } else {
      values.push(value);
      eqCriteria[key] = values;
    }
    return eqCriteria;
  };

export const togglePointSelection =
  (group: TaggedPointGroup) => (toggleCriteria: Record<string, string>) =>
    (dispatch: Function) => {
      const stringCriteria = {};
      const toggle = toggleEqCriteria<string>(stringCriteria);
      Object.entries(toggleCriteria).map(([key, value]) => toggle(key, value));
      dispatch(editCriteria(group, { string_eq: stringCriteria }));
    };

export const toggleStringCriteria =
  (group: TaggedPointGroup, key: string, value: string) =>
    (dispatch: Function) => {
      const tempStringCriteria = cloneDeep(group.body.criteria?.string_eq || {});
      toggleEqCriteria<string>(tempStringCriteria)(key, value);
      dispatch(editCriteria(group, { string_eq: tempStringCriteria }));
    };

export const editGtLtCriteria =
  (group: TaggedPointGroup, box: SelectionBoxData) =>
    (dispatch: Function) => {
      if (!(isNumber(box.x0) && isNumber(box.y0)
        && isNumber(box.x1) && isNumber(box.y1))) { return; }
      const tempGtCriteria = cloneDeep(group.body.criteria?.number_gt || {});
      const tempLtCriteria = cloneDeep(group.body.criteria?.number_lt || {});
      tempGtCriteria.x = Math.min(box.x0, box.x1);
      tempGtCriteria.y = Math.min(box.y0, box.y1);
      tempLtCriteria.x = Math.max(box.x0, box.x1);
      tempLtCriteria.y = Math.max(box.y0, box.y1);
      dispatch(editCriteria(group, {
        number_gt: tempGtCriteria,
        number_lt: tempLtCriteria,
      }));
    };
