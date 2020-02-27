jest.mock("../../../../api/crud", () => ({
  overwrite: jest.fn(),
  save: jest.fn(),
}));

import React from "react";
import { mount, shallow } from "enzyme";
import {
  EqCriteriaSelection,
  NumberCriteriaSelection, DaySelection, LocationSelection, AddCriteria,
} from "..";
import {
  EqCriteriaSelectionProps,
  NumberCriteriaProps,
  CriteriaSelectionProps,
  DEFAULT_CRITERIA,
  LocationSelectionProps,
  GroupCriteriaProps
} from "../interfaces";
import {
  fakePointGroup
} from "../../../../__test_support__/fake_state/resources";
import { overwrite } from "../../../../api/crud";
import { cloneDeep } from "lodash";
import { FBSelect } from "../../../../ui";
import { PointGroup } from "farmbot/dist/resources/api_resources";

describe("<EqCriteriaSelection<string> />", () => {
  const fakeProps = (): EqCriteriaSelectionProps<string> => ({
    criteria: DEFAULT_CRITERIA,
    group: fakePointGroup(),
    dispatch: jest.fn(x => x(jest.fn())),
    type: "string",
    criteriaField: {},
    criteriaKey: "string_eq",
  });

  it("renders", () => {
    const p = fakeProps();
    const wrapper = mount(<EqCriteriaSelection<string> {...p} />);
    expect(wrapper.text()).toContain("=");
  });

  it("removes criteria", () => {
    const p = fakeProps();
    p.criteriaField = { openfarm_slug: ["slug"] };
    const wrapper = mount(<EqCriteriaSelection<string> {...p} />);
    wrapper.find("button").last().simulate("click");
    const expectedBody = cloneDeep(p.group.body);
    expectedBody.criteria.string_eq = {};
    expect(overwrite).toHaveBeenCalledWith(p.group, expectedBody);
  });
});

describe("<NumberCriteriaSelection />", () => {
  const fakeProps = (): NumberCriteriaProps => ({
    criteria: DEFAULT_CRITERIA,
    group: fakePointGroup(),
    dispatch: jest.fn(x => x(jest.fn())),
    criteriaKey: "number_lt",
  });

  it("renders", () => {
    const p = fakeProps();
    const wrapper = mount(<NumberCriteriaSelection {...p} />);
    expect(wrapper.text()).toContain("<");
  });

  it("removes criteria", () => {
    const p = fakeProps();
    p.criteria.number_lt = { x: 1 };
    const wrapper = mount(<NumberCriteriaSelection {...p} />);
    wrapper.find("button").last().simulate("click");
    const expectedBody = cloneDeep(p.group.body);
    expectedBody.criteria.number_lt = {};
    expect(overwrite).toHaveBeenCalledWith(p.group, expectedBody);
  });
});

describe("<DaySelection />", () => {
  const fakeProps = (): CriteriaSelectionProps => ({
    criteria: DEFAULT_CRITERIA,
    group: fakePointGroup(),
    dispatch: jest.fn(x => x(jest.fn())),
  });

  it("changes operator", () => {
    const p = fakeProps();
    const wrapper = shallow(<DaySelection {...p} />);
    wrapper.find(FBSelect).simulate("change", { label: "", value: "<" });
    const expectedBody = cloneDeep(p.group.body);
    expectedBody.criteria.day.op = "<";
    expect(overwrite).toHaveBeenCalledWith(p.group, expectedBody);
  });

  it("changes day value", () => {
    const p = fakeProps();
    const wrapper = shallow(<DaySelection {...p} />);
    wrapper.find("input").last().simulate("change", {
      currentTarget: { value: "1" }
    });
    const expectedBody = cloneDeep(p.group.body);
    expectedBody.criteria.day.days_ago = 1;
    expect(overwrite).toHaveBeenCalledWith(p.group, expectedBody);
  });

  it("handles missing criteria", () => {
    const p = fakeProps();
    p.criteria = {} as PointGroup["criteria"];
    const wrapper = shallow(<DaySelection {...p} />);
    expect(wrapper.find("input").last().props().value).toEqual(0);
  });
});

describe("<LocationSelection />", () => {
  const fakeProps = (): LocationSelectionProps => ({
    criteria: DEFAULT_CRITERIA,
    group: fakePointGroup(),
    dispatch: jest.fn(x => x(jest.fn())),
  });

  it("changes number_gt", () => {
    const p = fakeProps();
    const wrapper = shallow(<LocationSelection {...p} />);
    wrapper.find("input").first().simulate("blur", {
      currentTarget: { value: "1" }
    });
    const expectedBody = cloneDeep(p.group.body);
    expectedBody.criteria.number_gt = { x: 1 };
    expect(overwrite).toHaveBeenCalledWith(p.group, expectedBody);
  });

  it("changes number_lt", () => {
    const p = fakeProps();
    const wrapper = shallow(<LocationSelection {...p} />);
    wrapper.find("input").last().simulate("blur", {
      currentTarget: { value: "1" }
    });
    const expectedBody = cloneDeep(p.group.body);
    expectedBody.criteria.number_lt = { x: 1, y: 1 };
    expect(overwrite).toHaveBeenCalledWith(p.group, expectedBody);
  });

  it("handles missing criteria", () => {
    const p = fakeProps();
    p.criteria = {} as PointGroup["criteria"];
    const wrapper = shallow(<LocationSelection {...p} />);
    expect(wrapper.find("input").first().props().defaultValue).toEqual(undefined);
    expect(wrapper.find("input").last().props().defaultValue).toEqual(undefined);
  });
});

describe("<AddCriteria />", () => {
  const fakeProps = (): GroupCriteriaProps => ({
    slugs: [],
    group: fakePointGroup(),
    dispatch: jest.fn(x => x(jest.fn(y => y(jest.fn())))),
  });

  it("renders", () => {
    const p = fakeProps();
    p.group.body.criteria.string_eq = {
      openfarm_slug: ["slug"],
      pointer_type: ["Plant"],
      plant_stage: ["planted"],
    };
    const wrapper = mount(<AddCriteria {...p} />);
    expect(wrapper.find("input").at(0).props().value).toEqual("Plant Type");
    expect(wrapper.find("input").at(1).props().value).toEqual("Slug");
    expect(wrapper.find("input").at(2).props().value).toEqual("Point Type");
    expect(wrapper.find("input").at(3).props().value).toEqual("Plants");
    expect(wrapper.find("input").at(4).props().value).toEqual("Plant Status");
    expect(wrapper.find("input").at(5).props().value).toEqual("Planted");
  });

  it("removes criteria", () => {
    const p = fakeProps();
    p.group.body.criteria.string_eq = {
      openfarm_slug: ["slug"],
      pointer_type: ["Plant"],
      plant_stage: ["planted"],
    };
    const wrapper = mount(<AddCriteria {...p} />);
    wrapper.find("button").last().simulate("click");
    const expectedBody = cloneDeep(p.group.body);
    expectedBody.criteria.string_eq = {
      openfarm_slug: ["slug"],
      pointer_type: ["Plant"],
    };
    expect(overwrite).toHaveBeenCalledWith(p.group, expectedBody);
  });

  it("handles missing criteria", () => {
    const p = fakeProps();
    p.group.body.criteria = undefined as unknown as PointGroup["criteria"];
    const wrapper = mount(<AddCriteria {...p} />);
    expect(wrapper.text()).toEqual("SelectNone");
  });
});
