jest.mock("../../../../api/crud", () => ({
  overwrite: jest.fn(),
  save: jest.fn(),
}));

import {
  editCriteria, toggleEqCriteria,
  togglePointSelection, toggleStringCriteria, editGtLtCriteria
} from "..";
import {
  fakePointGroup
} from "../../../../__test_support__/fake_state/resources";
import { overwrite, save } from "../../../../api/crud";
import { cloneDeep } from "lodash";
import { PointGroup } from "farmbot/dist/resources/api_resources";
import { DEFAULT_CRITERIA } from "../interfaces";

describe("editCriteria()", () => {
  it("edits criteria: all empty", () => {
    const group = fakePointGroup();
    group.body.criteria = undefined as unknown as PointGroup["criteria"];
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
    const criteria: PointGroup["criteria"] = {
      day: { days_ago: 1, op: "<" },
      string_eq: { openfarm_slug: ["slug"] },
      number_eq: { x: [0] },
      number_gt: { x: 0 },
      number_lt: { x: 10 },
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
    const result = toggleEqCriteria({})("openfarm_slug", "slug");
    expect(result).toEqual({ openfarm_slug: ["slug"] });
  });

  it("removes criteria", () => {
    const result = toggleEqCriteria({ openfarm_slug: ["slug"] })(
      "openfarm_slug", "slug");
    expect(result).toEqual({});
  });
});

const dispatch = jest.fn(x => x(jest.fn()));

describe("togglePointSelection()", () => {
  it("adds criteria", () => {
    const group = fakePointGroup();
    togglePointSelection(group)({ openfarm_slug: "slug" })(dispatch);
    const expectedBody = cloneDeep(group.body);
    expectedBody.criteria.string_eq = { openfarm_slug: ["slug"] };
    expect(overwrite).toHaveBeenCalledWith(group, expectedBody);
    expect(save).toHaveBeenCalledWith(group.uuid);
  });
});

describe("toggleStringCriteria()", () => {
  it("adds criteria", () => {
    const group = fakePointGroup();
    toggleStringCriteria(group, "openfarm_slug", "slug")(dispatch);
    const expectedBody = cloneDeep(group.body);
    expectedBody.criteria.string_eq = { openfarm_slug: ["slug"] };
    expect(overwrite).toHaveBeenCalledWith(group, expectedBody);
    expect(save).toHaveBeenCalledWith(group.uuid);
  });

  it("handles missing criteria", () => {
    const group = fakePointGroup();
    group.body.criteria = undefined as unknown as PointGroup["criteria"];
    toggleStringCriteria(group, "openfarm_slug", "slug")(dispatch);
    const expectedBody = cloneDeep(group.body);
    expectedBody.criteria = cloneDeep(DEFAULT_CRITERIA);
    expectedBody.criteria.string_eq = { openfarm_slug: ["slug"] };
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

  it("handles missing criteria", () => {
    const group = fakePointGroup();
    group.body.criteria = undefined as unknown as PointGroup["criteria"];
    const box = { x0: 1, y0: 2, x1: 3, y1: 4 };
    editGtLtCriteria(group, box)(dispatch);
    const expectedBody = cloneDeep(group.body);
    expectedBody.criteria = cloneDeep(DEFAULT_CRITERIA);
    expectedBody.criteria.number_gt = { x: 1, y: 2 };
    expectedBody.criteria.number_lt = { x: 3, y: 4 };
    expect(overwrite).toHaveBeenCalledWith(group, expectedBody);
    expect(save).toHaveBeenCalledWith(group.uuid);
  });
});
