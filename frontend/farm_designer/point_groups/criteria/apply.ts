import { every, get, uniq, gt, lt, isNumber, isEqual } from "lodash";
import { TaggedPoint, TaggedPointGroup } from "farmbot";
import moment from "moment";
import { PointGroupCriteria, DEFAULT_CRITERIA } from "./interfaces";

/** Check if a string or number criteria field is empty. */
const eqCriteriaEmpty =
  (eqCriteria: Record<string, (string | number | boolean)[] | undefined>) =>
    every(Object.values(eqCriteria).map(values => !values?.length));

/** Check if a point matches the criteria in the provided category. */
const checkCriteria =
  (criteria: PointGroupCriteria, now: moment.Moment) =>
    (point: TaggedPoint, criteriaKey: keyof PointGroupCriteria) => {
      switch (criteriaKey) {
        case "string_eq":
        case "number_eq":
        case "boolean_eq":
          return every(Object.entries(criteria[criteriaKey])
            .map(([k, values]: [string, (string | number | boolean)[]]) =>
              values?.includes(get(point.body, k))))
            || eqCriteriaEmpty(criteria[criteriaKey]);
        case "number_gt":
        case "number_lt":
          const compare = { number_gt: gt, number_lt: lt };
          return every(Object.entries(criteria[criteriaKey])
            .map(([key, value]) => isNumber(value) &&
              compare[criteriaKey](get(point.body, key), value)));
        case "day":
          if (!criteria.day) { return true; }
          const pointDate = moment(point.body.pointer_type == "Plant"
            && point.body.planted_at
            ? point.body.planted_at
            : point.body.created_at);
          const compareDate = moment(now)
            .subtract(criteria.day.days_ago, "days");
          const matchesDays = criteria.day.op == "<"
            ? pointDate.isAfter(compareDate)
            : pointDate.isBefore(compareDate);
          return matchesDays;
      }
    };

/** Check if a point matches all criteria provided. */
export const selectPointsByCriteria = (
  criteria: PointGroupCriteria,
  allPoints: TaggedPoint[],
  now = moment(),
): TaggedPoint[] => {
  if (isEqual(criteria, DEFAULT_CRITERIA)) { return []; }
  const check = checkCriteria(criteria, now);
  return allPoints.filter(point =>
    every(Object.keys(criteria).map((key: keyof PointGroupCriteria) =>
      check(point, key))));
};

/** Return all points selected by group manual additions and criteria. */
export const pointsSelectedByGroup =
  (group: TaggedPointGroup, allPoints: TaggedPoint[]) =>
    uniq(allPoints
      .filter(p => group.body.point_ids.includes(p.body.id || 0))
      .concat(selectPointsByCriteria(group.body.criteria, allPoints)));
