jest.mock("../../actions", () => ({ overwriteGroup: jest.fn() }));

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
} from "../../../__test_support__/fake_state/resources";
import { cloneDeep } from "lodash";
import { DEFAULT_CRITERIA, PointGroupCriteria } from "../interfaces";
import { inputEvent } from "../../../__test_support__/fake_html_events";
import { error } from "../../../toast/toast";
import { overwriteGroup } from "../../actions";

describe("editCriteria()", () => {
  it("edits criteria: all empty", () => {
    const group = fakePointGroup();
    group.body.criteria = DEFAULT_CRITERIA;
    editCriteria(group, {})(jest.fn());
    const expectedBody = cloneDeep(group.body);
    expectedBody.criteria = DEFAULT_CRITERIA;
    expect(overwriteGroup).toHaveBeenCalledWith(group, expectedBody);
  });

  it("edits criteria: empty update", () => {
    const group = fakePointGroup();
    editCriteria(group, {})(jest.fn());
    expect(overwriteGroup).toHaveBeenCalledWith(group, group.body);
  });

  it("edits criteria: full update", () => {
    const group = fakePointGroup();
    const criteria: PointGroupCriteria = {
      day: { days_ago: 1, op: "<" },
      string_eq: { openfarm_slug: ["slug"] },
      number_eq: { x: [0] },
      number_gt: { x: 0 },
      number_lt: { x: 10 },
    };
    editCriteria(group, criteria)(jest.fn());
    const expectedBody = cloneDeep(group.body);
    expectedBody.criteria = criteria;
    expect(overwriteGroup).toHaveBeenCalledWith(group, expectedBody);
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
    expect(overwriteGroup).toHaveBeenCalledWith(group, expectedBody);
  });

  it("toggles criteria on for point type", () => {
    const group = fakePointGroup();
    const expectedBody = cloneDeep(group.body);
    group.body.criteria.string_eq = {
      pointer_type: ["GenericPointer", "Plant", "ToolSlot", "Weed"],
      openfarm_slug: ["apple"],
      "meta.color": ["red"],
    };
    group.body.criteria.number_eq = {
      pullout_direction: [0]
    };
    expectedBody.criteria.string_eq = {
      pointer_type: ["GenericPointer", "Plant", "ToolSlot", "Weed"],
      openfarm_slug: ["apple", "mint"],
    };
    expectedBody.criteria.number_eq = {};
    toggleAndEditEqCriteria(group, "openfarm_slug", "mint", "Plant")(dispatch);
    expect(overwriteGroup).toHaveBeenCalledWith(group, expectedBody);
  });

  it("toggles off", () => {
    const group = fakePointGroup();
    group.body.criteria.string_eq = {
      pointer_type: ["GenericPointer", "Plant", "ToolSlot", "Weed"],
      openfarm_slug: ["mint"],
      "meta.color": ["red"],
    };
    group.body.criteria.number_eq = {
      pullout_direction: [0],
    };
    const expectedBody = cloneDeep(group.body);
    delete expectedBody.criteria.string_eq.openfarm_slug;
    toggleAndEditEqCriteria(group, "openfarm_slug", "mint", "Plant")(dispatch);
    expect(overwriteGroup).toHaveBeenCalledWith(group, expectedBody);
  });

  it("toggles on: empty criteria", () => {
    const group = fakePointGroup();
    group.body.criteria.string_eq = {
      openfarm_slug: undefined,
      "meta.color": undefined,
    };
    group.body.criteria.number_lt = { radius: 10 };
    group.body.criteria.number_gt = { radius: 1 };
    group.body.criteria.number_eq = {
      pullout_direction: undefined,
    };
    const expectedBody = cloneDeep(group.body);
    expectedBody.criteria.string_eq = {};
    expectedBody.criteria.number_lt = {};
    expectedBody.criteria.number_gt = {};
    expectedBody.criteria.number_eq = { pullout_direction: [0] };
    toggleAndEditEqCriteria(group, "pullout_direction", 0, "ToolSlot")(dispatch);
    expect(overwriteGroup).toHaveBeenCalledWith(group, expectedBody);
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
    expectedBody.criteria.string_eq = {
      pointer_type: ["GenericPointer", "Plant"],
      openfarm_slug: ["mint"],
    };
    togglePointTypeCriteria(group, "Plant")(dispatch);
    expect(overwriteGroup).toHaveBeenCalledWith(group, expectedBody);
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
      openfarm_slug: ["mint"],
    };
    togglePointTypeCriteria(group, "Plant")(dispatch);
    expect(overwriteGroup).toHaveBeenCalledWith(group, expectedBody);
  });

  it("toggles on: empty criteria", () => {
    const group = fakePointGroup();
    group.body.criteria.string_eq = {};
    const expectedBody = cloneDeep(group.body);
    expectedBody.criteria.string_eq = { pointer_type: ["Plant"] };
    togglePointTypeCriteria(group, "Plant")(dispatch);
    expect(overwriteGroup).toHaveBeenCalledWith(group, expectedBody);
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
    expect(overwriteGroup).toHaveBeenCalledWith(group, expectedBody);
  });

  it("clears other pointer types", () => {
    const group = fakePointGroup();
    group.body.criteria.string_eq = {
      pointer_type: ["Plant", "ToolSlot"],
      "openfarm_slug": ["mint"],
    };
    const expectedBody = cloneDeep(group.body);
    expectedBody.criteria.string_eq = { pointer_type: ["Weed"] };
    togglePointTypeCriteria(group, "Weed", true)(dispatch);
    expect(overwriteGroup).toHaveBeenCalledWith(group, expectedBody);
  });
});

describe("clearCriteriaField()", () => {
  it("clears field", () => {
    const group = fakePointGroup();
    const expectedBody = cloneDeep(group.body);
    group.body.criteria.string_eq = { plant_stage: ["planted"] };
    expectedBody.criteria.string_eq = {};
    clearCriteriaField(group, ["string_eq"], ["plant_stage"])(dispatch);
    expect(overwriteGroup).toHaveBeenCalledWith(group, expectedBody);
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
    expect(overwriteGroup).toHaveBeenCalledWith(group, expectedBody);
  });

  it("doesn't edit criteria", () => {
    const group = fakePointGroup();
    const box = { x0: undefined, y0: 2, x1: 3, y1: 4 };
    editGtLtCriteria(group, box)(dispatch);
    expect(overwriteGroup).not.toHaveBeenCalled();
  });
});

describe("removeEqCriteriaValue()", () => {
  it("removes value", () => {
    const group = fakePointGroup();
    group.body.criteria.string_eq = { plant_stage: ["planted", "planned"] };
    removeEqCriteriaValue<string>(group, group.body.criteria.string_eq,
      "string_eq", "plant_stage", "planned")(dispatch);
    const expectedBody = cloneDeep(group.body);
    expectedBody.criteria.string_eq = { plant_stage: ["planted"] };
    expect(overwriteGroup).toHaveBeenCalledWith(group, expectedBody);
  });
});

describe("editGtLtCriteriaField()", () => {
  it("changes value", () => {
    const group = fakePointGroup();
    const e = inputEvent("1");
    editGtLtCriteriaField(group, "number_lt", "radius")(e)(dispatch);
    const expectedBody = cloneDeep(group.body);
    expectedBody.criteria.number_lt = { radius: 1 };
    expect(error).not.toHaveBeenCalled();
    expect(overwriteGroup).toHaveBeenCalledWith(group, expectedBody);
  });

  it("errors when changing value: lt", () => {
    const group = fakePointGroup();
    group.body.criteria.number_gt = { radius: 1 };
    const e = inputEvent("0");
    editGtLtCriteriaField(group, "number_lt", "radius")(e)(dispatch);
    expect(error).toHaveBeenCalledWith("Value must be greater than 1.");
    expect(overwriteGroup).not.toHaveBeenCalled();
  });

  it("errors when changing value: gt", () => {
    const group = fakePointGroup();
    group.body.criteria.number_lt = { radius: 0 };
    const e = inputEvent("1");
    editGtLtCriteriaField(group, "number_gt", "radius")(e)(dispatch);
    expect(error).toHaveBeenCalledWith("Value must be less than 0.");
    expect(overwriteGroup).not.toHaveBeenCalled();
  });

  it("doesn't error when removing value", () => {
    const group = fakePointGroup();
    group.body.criteria.number_lt = { radius: 0 };
    const e = inputEvent("");
    editGtLtCriteriaField(group, "number_gt", "radius")(e)(dispatch);
    const expectedBody = cloneDeep(group.body);
    expectedBody.criteria.number_gt = { radius: undefined };
    expect(error).not.toHaveBeenCalled();
    expect(overwriteGroup).toHaveBeenCalledWith(group, expectedBody);
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
    expect(error).not.toHaveBeenCalled();
    expect(overwriteGroup).toHaveBeenCalledWith(group, expectedBody);
  });
});
