jest.mock("../../../../api/crud", () => ({
  overwrite: jest.fn(),
  save: jest.fn(),
}));

import {
  editCriteria, toggleEqCriteria,
  editGtLtCriteria,
  togglePointTypeCriteria,
  toggleAndEditEqCriteria,
  clearCriteriaField,
  removeEqCriteriaValue,
  editGtLtCriteriaField,
} from "..";
import {
  fakePointGroup,
} from "../../../../__test_support__/fake_state/resources";
import { overwrite, save } from "../../../../api/crud";
import { cloneDeep } from "lodash";
import { DEFAULT_CRITERIA, PointGroupCriteria } from "../interfaces";
import { inputEvent } from "../../../../__test_support__/fake_html_events";

describe("editCriteria()", () => {
  it("edits criteria: all empty", () => {
    const group = fakePointGroup();
    group.body.criteria = DEFAULT_CRITERIA;
    editCriteria(group, {})(jest.fn());
    const expectedBody = cloneDeep(group.body);
    expectedBody.criteria = DEFAULT_CRITERIA;
    expect(overwrite).toHaveBeenCalledWith(group, expectedBody);
    expect(save).toHaveBeenCalledWith(group.uuid);
  });

  it("edits criteria: empty update", () => {
    const group = fakePointGroup();
    editCriteria(group, {})(jest.fn());
    expect(overwrite).toHaveBeenCalledWith(group, group.body);
    expect(save).toHaveBeenCalledWith(group.uuid);
  });

  it("edits criteria: full update", () => {
    const group = fakePointGroup();
    const criteria: PointGroupCriteria = {
      day: { days_ago: 1, op: "<" },
      string_eq: { openfarm_slug: ["slug"] },
      number_eq: { x: [0] },
      number_gt: { x: 0 },
      number_lt: { x: 10 },
      boolean_eq: { gantry_mounted: [true] },
    };
    editCriteria(group, criteria)(jest.fn());
    const expectedBody = cloneDeep(group.body);
    expectedBody.criteria = criteria;
    expect(overwrite).toHaveBeenCalledWith(group, expectedBody);
    expect(save).toHaveBeenCalledWith(group.uuid);
  });
});

describe("toggleEqCriteria()", () => {
  it("adds criteria", () => {
    const eqCriteria = {};
    toggleEqCriteria(eqCriteria)("openfarm_slug", "slug");
    expect(eqCriteria).toEqual({ openfarm_slug: ["slug"] });
  });

  it("removes criteria", () => {
    const eqCriteria = { openfarm_slug: ["slug"] };
    toggleEqCriteria(eqCriteria)(
      "openfarm_slug", "slug");
    expect(eqCriteria).toEqual({});
  });

  it("toggles on", () => {
    const eqCriteria = { openfarm_slug: ["slug"] };
    toggleEqCriteria(eqCriteria, "on")(
      "openfarm_slug", "slug");
    expect(eqCriteria).toEqual({ openfarm_slug: ["slug"] });
  });

  it("toggles off", () => {
    const eqCriteria = {};
    toggleEqCriteria(eqCriteria, "off")("openfarm_slug", "slug");
    expect(eqCriteria).toEqual({});
  });
});

const dispatch = jest.fn(x => x(jest.fn()));

describe("toggleAndEditEqCriteria()", () => {
  it("toggles criteria on", () => {
    const group = fakePointGroup();
    const expectedBody = cloneDeep(group.body);
    expectedBody.criteria.string_eq = { openfarm_slug: ["mint"] };
    toggleAndEditEqCriteria(group, "openfarm_slug", "mint")(dispatch);
    expect(overwrite).toHaveBeenCalledWith(group, expectedBody);
    expect(save).toHaveBeenCalledWith(group.uuid);
  });

  it("toggles criteria on for point type", () => {
    const group = fakePointGroup();
    const expectedBody = cloneDeep(group.body);
    group.body.criteria.string_eq = {
      pointer_type: ["GenericPointer", "Plant", "ToolSlot"],
      openfarm_slug: ["apple"],
      "meta.color": ["red"],
    };
    group.body.criteria.number_eq = {
      pullout_direction: [0]
    };
    expectedBody.criteria.string_eq = {
      pointer_type: ["Plant"],
      openfarm_slug: ["apple", "mint"],
    };
    expectedBody.criteria.number_eq = {};
    toggleAndEditEqCriteria(group, "openfarm_slug", "mint", "Plant")(dispatch);
    expect(overwrite).toHaveBeenCalledWith(group, expectedBody);
    expect(save).toHaveBeenCalledWith(group.uuid);
  });

  it("toggles off", () => {
    const group = fakePointGroup();
    group.body.criteria.string_eq = {
      pointer_type: ["GenericPointer", "Plant", "ToolSlot"],
      openfarm_slug: ["mint"],
      "meta.color": ["red"],
    };
    group.body.criteria.number_eq = {
      pullout_direction: [0],
    };
    const expectedBody = cloneDeep(group.body);
    delete expectedBody.criteria.string_eq.openfarm_slug;
    toggleAndEditEqCriteria(group, "openfarm_slug", "mint", "Plant")(dispatch);
    expect(overwrite).toHaveBeenCalledWith(group, expectedBody);
    expect(save).toHaveBeenCalledWith(group.uuid);
  });

  it("toggles on: empty criteria", () => {
    const group = fakePointGroup();
    group.body.criteria.string_eq = {
      openfarm_slug: undefined,
      "meta.color": undefined,
    };
    group.body.criteria.number_eq = {
      pullout_direction: undefined,
    };
    const expectedBody = cloneDeep(group.body);
    expectedBody.criteria.number_eq = { pullout_direction: [0] };
    toggleAndEditEqCriteria(group, "pullout_direction", 0, "ToolSlot")(dispatch);
    expect(overwrite).toHaveBeenCalledWith(group, expectedBody);
    expect(save).toHaveBeenCalledWith(group.uuid);
  });
});

describe("togglePointTypeCriteria()", () => {
  it("toggles on", () => {
    const group = fakePointGroup();
    group.body.criteria.string_eq = {
      pointer_type: ["GenericPointer"],
      openfarm_slug: ["mint"],
      "meta.color": ["red"],
    };
    const expectedBody = cloneDeep(group.body);
    expectedBody.criteria.string_eq.pointer_type?.push("Plant");
    togglePointTypeCriteria(group, "Plant")(dispatch);
    expect(overwrite).toHaveBeenCalledWith(group, expectedBody);
    expect(save).toHaveBeenCalledWith(group.uuid);
  });

  it("toggles off", () => {
    const group = fakePointGroup();
    const expectedBody = cloneDeep(group.body);
    group.body.criteria.string_eq = {
      pointer_type: ["GenericPointer", "Plant"],
      openfarm_slug: ["mint"],
      "meta.color": ["red"],
    };
    expectedBody.criteria.string_eq = {
      pointer_type: ["GenericPointer"],
      "meta.color": ["red"],
    };
    togglePointTypeCriteria(group, "Plant")(dispatch);
    expect(overwrite).toHaveBeenCalledWith(group, expectedBody);
    expect(save).toHaveBeenCalledWith(group.uuid);
  });

  it("toggles on: empty criteria", () => {
    const group = fakePointGroup();
    group.body.criteria.string_eq = {};
    const expectedBody = cloneDeep(group.body);
    expectedBody.criteria.string_eq = { pointer_type: ["Plant"] };
    togglePointTypeCriteria(group, "Plant")(dispatch);
    expect(overwrite).toHaveBeenCalledWith(group, expectedBody);
    expect(save).toHaveBeenCalledWith(group.uuid);
  });

  it("toggles off: empty criteria", () => {
    const group = fakePointGroup();
    group.body.criteria.string_eq = { pointer_type: ["ToolSlot"] };
    group.body.criteria.number_eq = {
      pullout_direction: undefined,
    };
    const expectedBody = cloneDeep(group.body);
    expectedBody.criteria.string_eq = {};
    togglePointTypeCriteria(group, "ToolSlot")(dispatch);
    expect(overwrite).toHaveBeenCalledWith(group, expectedBody);
    expect(save).toHaveBeenCalledWith(group.uuid);
  });
});

describe("clearCriteriaField()", () => {
  it("clears field", () => {
    const group = fakePointGroup();
    const expectedBody = cloneDeep(group.body);
    group.body.criteria.string_eq = { plant_stage: ["planted"] };
    expectedBody.criteria.string_eq = {};
    clearCriteriaField(group, ["string_eq"], "plant_stage")(dispatch);
    expect(overwrite).toHaveBeenCalledWith(group, expectedBody);
    expect(save).toHaveBeenCalledWith(group.uuid);
  });
});

describe("editGtLtCriteria()", () => {
  it("adds criteria", () => {
    const group = fakePointGroup();
    const box = { x0: 0, y0: 2, x1: 3, y1: 4 };
    editGtLtCriteria(group, box)(dispatch);
    const expectedBody = cloneDeep(group.body);
    expectedBody.criteria.number_gt = { x: 0, y: 2 };
    expectedBody.criteria.number_lt = { x: 3, y: 4 };
    expect(overwrite).toHaveBeenCalledWith(group, expectedBody);
    expect(save).toHaveBeenCalledWith(group.uuid);
  });

  it("doesn't edit criteria", () => {
    const group = fakePointGroup();
    const box = { x0: undefined, y0: 2, x1: 3, y1: 4 };
    editGtLtCriteria(group, box)(dispatch);
    expect(overwrite).not.toHaveBeenCalled();
    expect(save).not.toHaveBeenCalled();
  });
});

describe("removeEqCriteriaValue()", () => {
  it("removes value", () => {
    const group = fakePointGroup();
    group.body.criteria.string_eq = { plant_stage: ["planted", "planned"] };
    removeEqCriteriaValue(group, group.body.criteria.string_eq,
      "string_eq", "plant_stage", "planned")(dispatch);
    const expectedBody = cloneDeep(group.body);
    expectedBody.criteria.string_eq = { plant_stage: ["planted"] };
    expect(overwrite).toHaveBeenCalledWith(group, expectedBody);
    expect(save).toHaveBeenCalledWith(group.uuid);
  });
});

describe("editGtLtCriteriaField()", () => {
  it("changes value", () => {
    const group = fakePointGroup();
    const e = inputEvent("1");
    editGtLtCriteriaField(group, "number_lt", "radius")(e)(dispatch);
    const expectedBody = cloneDeep(group.body);
    expectedBody.criteria.number_lt = { radius: 1 };
    expect(overwrite).toHaveBeenCalledWith(group, expectedBody);
    expect(save).toHaveBeenCalledWith(group.uuid);
  });

  it("clears incompatible criteria", () => {
    const group = fakePointGroup();
    const expectedBody = cloneDeep(group.body);
    group.body.criteria.string_eq = { plant_stage: ["planted"] };
    const e = inputEvent("1");
    editGtLtCriteriaField(
      group, "number_lt", "radius", "GenericPointer",
    )(e)(dispatch);
    expectedBody.criteria.number_lt = { radius: 1 };
    expect(overwrite).toHaveBeenCalledWith(group, expectedBody);
    expect(save).toHaveBeenCalledWith(group.uuid);
  });
});
