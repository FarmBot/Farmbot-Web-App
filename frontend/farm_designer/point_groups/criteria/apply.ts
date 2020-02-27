import { every, get, isEqual, uniq, gt, lt, isNumber } from "lodash";
import { TaggedPoint, TaggedPointGroup } from "farmbot";
import { PointGroup } from "farmbot/dist/resources/api_resources";
import moment from "moment";
import { DEFAULT_CRITERIA } from "./interfaces";

const eqCriteriaEmpty =
  (eqCriteria: Record<string, (string | number)[] | undefined>) =>
    every(Object.values(eqCriteria).map(values => !values?.length));

const checkCriteria =
  (criteria: PointGroup["criteria"], now: moment.Moment) =>
    (point: TaggedPoint, criteriaKey: keyof PointGroup["criteria"]) => {
      switch (criteriaKey) {
        case "string_eq":
        case "number_eq":
          return every(Object.entries(criteria[criteriaKey])
            .map(([k, values]: [string, (string | number)[]]) =>
              values?.includes(get(point.body, k))))
            || eqCriteriaEmpty(criteria[criteriaKey]);
        case "number_gt":
        case "number_lt":
          const compare = { number_gt: gt, number_lt: lt };
          return every(Object.entries(criteria[criteriaKey])
            .map(([key, value]) => isNumber(value) &&
              compare[criteriaKey](get(point.body, key), value)));
        case "day":
          const pointDate = moment(point.body.pointer_type == "Plant"
            && point.body.planted_at
            ? point.body.planted_at
            : point.body.created_at);
          const compareDate = moment(now)
            .subtract(criteria[criteriaKey].days_ago, "days");
          const matchesDays = criteria[criteriaKey].op == "<"
            ? pointDate.isAfter(compareDate)
            : pointDate.isBefore(compareDate);
          return matchesDays || !criteria[criteriaKey].days_ago;
      }
    };

export const selectPointsByCriteria = (
  criteria: PointGroup["criteria"] | undefined,
  allPoints: TaggedPoint[],
  now = moment(),
): TaggedPoint[] => {
  if (!criteria || isEqual(criteria, DEFAULT_CRITERIA)) { return []; }
  const check = checkCriteria(criteria, now);
  return allPoints.filter(point =>
    every(Object.keys(criteria).map((key: keyof PointGroup["criteria"]) =>
      check(point, key))));
};

export const pointsSelectedByGroup =
  (group: TaggedPointGroup, allPoints: TaggedPoint[]) =>
    uniq(allPoints
      .filter(p => group.body.point_ids.includes(p.body.id || 0))
      .concat(selectPointsByCriteria(group.body.criteria, allPoints)));
