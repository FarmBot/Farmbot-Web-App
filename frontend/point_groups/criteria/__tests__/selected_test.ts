import { eqCriteriaSelected, criteriaHasKey } from "..";
import { DEFAULT_CRITERIA, PointGroupCriteria } from "../interfaces";
import { cloneDeep } from "lodash";

const fakeCriteria = (): PointGroupCriteria =>
  cloneDeep(DEFAULT_CRITERIA);

describe("eqCriteriaSelected()", () => {
  it("returns selected numbers", () => {
    const criteria = fakeCriteria();
    criteria.number_eq = { pullout_direction: [0] };
    const result = eqCriteriaSelected(criteria)("pullout_direction", 0);
    expect(result).toEqual(true);
  });

  it("returns numbers not selected", () => {
    const criteria = fakeCriteria();
    criteria.number_eq = {};
    const result = eqCriteriaSelected(criteria)("pullout_direction", 0);
    expect(result).toEqual(false);
  });

  it("returns selected strings", () => {
    const criteria = fakeCriteria();
    criteria.string_eq = { plant_stage: ["planted"] };
    const result = eqCriteriaSelected(criteria)("plant_stage", "planted");
    expect(result).toEqual(true);
  });

  it("returns strings not selected", () => {
    const criteria = fakeCriteria();
    criteria.string_eq = {};
    const result = eqCriteriaSelected(criteria)("plant_stage", "planted");
    expect(result).toEqual(false);
  });

  it("returns other not selected", () => {
    const criteria = fakeCriteria();
    const result = eqCriteriaSelected(criteria)(
      "pullout_direction", false as unknown as string);
    expect(result).toEqual(false);
  });
});

describe("criteriaHasKey()", () => {
  it("has string_eq key", () => {
    const criteria = fakeCriteria();
    criteria.string_eq = { plant_stage: ["planted"] };
    const result = criteriaHasKey(criteria, ["string_eq"], "plant_stage");
    expect(result).toBeTruthy();
  });

  it("doesn't have key", () => {
    const criteria = fakeCriteria();
    criteria.string_eq = {};
    const result = criteriaHasKey(criteria, ["string_eq"], "plant_stage");
    expect(result).toBeFalsy();
  });

  it("has number_eq key", () => {
    const criteria = fakeCriteria();
    criteria.number_eq = { x: [0] };
    const result = criteriaHasKey(criteria, ["number_eq"], "x");
    expect(result).toBeTruthy();
  });
});
