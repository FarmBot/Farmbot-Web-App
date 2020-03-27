import { selectPointsByCriteria, pointsSelectedByGroup } from "..";
import {
  fakePoint, fakePlant, fakePointGroup, fakeToolSlot,
} from "../../../../__test_support__/fake_state/resources";
import moment from "moment";
import { DEFAULT_CRITERIA, PointGroupCriteria } from "../interfaces";
import { cloneDeep } from "lodash";

describe("selectPointsByCriteria()", () => {
  const fakeCriteria = (): PointGroupCriteria =>
    cloneDeep(DEFAULT_CRITERIA);

  it("matches color", () => {
    const criteria = fakeCriteria();
    criteria.number_eq = { x: [], y: undefined, z: [] };
    criteria.boolean_eq = { gantry_mounted: undefined };
    criteria.string_eq = { "meta.color": ["red", "blue"] };
    const matchingPoint = fakePoint();
    matchingPoint.body.meta.color = "red";
    const otherPoint = fakePoint();
    otherPoint.body.meta = {};
    const allPoints = [matchingPoint, otherPoint];
    const result = selectPointsByCriteria(criteria, allPoints);
    expect(result).toEqual([matchingPoint]);
  });

  it("matches positions: equal", () => {
    const criteria = fakeCriteria();
    criteria.string_eq = { "meta.color": [] };
    criteria.number_eq = { x: [0, 1], y: [100] };
    const matchingPoint1 = fakePoint();
    matchingPoint1.body.x = 0;
    matchingPoint1.body.y = 100;
    const matchingPoint2 = fakePoint();
    matchingPoint2.body.x = 1;
    matchingPoint2.body.y = 100;
    const otherPoint = fakePoint();
    otherPoint.body.x = 2;
    otherPoint.body.y = 100;
    const allPoints = [matchingPoint1, matchingPoint2, otherPoint];
    const result = selectPointsByCriteria(criteria, allPoints);
    expect(result).toEqual([matchingPoint1, matchingPoint2]);
  });

  it("matches positions: gt/lt", () => {
    const criteria = fakeCriteria();
    criteria.string_eq = {};
    criteria.number_gt = { x: 100 };
    criteria.number_lt = { x: 500 };
    const matchingPoint = fakePoint();
    matchingPoint.body.x = 200;
    const otherPoint = fakePoint();
    otherPoint.body.x = 0;
    const allPoints = [matchingPoint, otherPoint];
    const result = selectPointsByCriteria(criteria, allPoints);
    expect(result).toEqual([matchingPoint]);
  });

  it("matches boolean criteria", () => {
    const criteria = fakeCriteria();
    criteria.boolean_eq = { gantry_mounted: [true] };
    const matchingPoint = fakeToolSlot();
    matchingPoint.body.gantry_mounted = true;
    const otherPoint = fakeToolSlot();
    otherPoint.body.gantry_mounted = false;
    const allPoints = [matchingPoint, otherPoint];
    const result = selectPointsByCriteria(criteria, allPoints);
    expect(result).toEqual([matchingPoint]);
  });

  it("matches age greater than 1 day old", () => {
    const criteria = fakeCriteria();
    criteria.string_eq = {};
    criteria.day = { days_ago: 1, op: ">" };
    const matchingPoint = fakePoint();
    matchingPoint.body.created_at = "2020-01-20T20:00:00.000Z";
    const otherPoint = fakePoint();
    otherPoint.body.created_at = "2020-02-20T20:00:00.000Z";
    const allPoints = [matchingPoint, otherPoint];
    const now = moment("2020-02-20T20:00:00.000Z");
    const result = selectPointsByCriteria(criteria, allPoints, now);
    expect(result).toEqual([matchingPoint]);
  });

  it("matches age less than 1 day old", () => {
    const criteria = fakeCriteria();
    criteria.string_eq = {};
    criteria.day = { days_ago: 1, op: "<" };
    const matchingPoint = fakePoint();
    matchingPoint.body.created_at = "2020-02-20T20:00:00.000Z";
    const otherPoint = fakePoint();
    otherPoint.body.created_at = "2020-01-20T20:00:00.000Z";
    const allPoints = [matchingPoint, otherPoint];
    const now = moment("2020-02-20T20:00:00.000Z");
    const result = selectPointsByCriteria(criteria, allPoints, now);
    expect(result).toEqual([matchingPoint]);
  });

  it("matches planted date less than 1 day old", () => {
    const criteria = fakeCriteria();
    criteria.day = { days_ago: 1, op: "<" };
    const matchingPoint = fakePlant();
    matchingPoint.body.planted_at = "2020-02-20T20:00:00.000Z";
    matchingPoint.body.created_at = "2020-01-20T20:00:00.000Z";
    const otherPoint = fakePlant();
    otherPoint.body.planted_at = "2020-01-20T20:00:00.000Z";
    otherPoint.body.created_at = "2020-01-20T20:00:00.000Z";
    const allPoints = [matchingPoint, otherPoint];
    const now = moment("2020-02-20T20:00:00.000Z");
    const result = selectPointsByCriteria(criteria, allPoints, now);
    expect(result).toEqual([matchingPoint]);
  });
});

describe("pointsSelectedByGroup()", () => {
  it("returns group points", () => {
    const group = fakePointGroup();
    group.body.point_ids = [1];
    group.body.criteria.number_eq = { x: [123] };
    const selectedPoint1 = fakePoint();
    selectedPoint1.body.id = 1;
    const selectedPoint2 = fakePoint();
    selectedPoint2.body.id = 2;
    selectedPoint2.body.x = 123;
    const otherPoint = fakePoint();
    otherPoint.body.id = 0;
    const allPoints = [selectedPoint1, selectedPoint2, otherPoint];
    const result = pointsSelectedByGroup(group, allPoints);
    expect(result).toEqual([selectedPoint1, selectedPoint2]);
  });
});
