jest.mock("../edit", () => ({
  editCriteria: jest.fn(),
  editGtLtCriteriaField: jest.fn(() => jest.fn()),
  removeEqCriteriaValue: jest.fn(),
  clearCriteriaField: jest.fn(),
}));

import React from "react";
import { mount, shallow } from "enzyme";
import {
  EqCriteriaSelection,
  NumberCriteriaSelection,
  DaySelection,
  LocationSelection,
  NumberLtGtInput,
  removeEqCriteriaValue,
  clearCriteriaField,
  editCriteria,
  editGtLtCriteriaField,
} from "..";
import {
  EqCriteriaSelectionProps,
  NumberCriteriaProps,
  CriteriaSelectionProps,
  DEFAULT_CRITERIA,
  LocationSelectionProps,
  NumberLtGtInputProps,
} from "../interfaces";
import {
  fakePointGroup,
} from "../../../../__test_support__/fake_state/resources";
import { FBSelect } from "../../../../ui";
import { Actions } from "../../../../constants";

describe("<EqCriteriaSelection<string> />", () => {
  const fakeProps = (): EqCriteriaSelectionProps<string> => ({
    criteria: DEFAULT_CRITERIA,
    group: fakePointGroup(),
    dispatch: jest.fn(),
    type: "string",
    eqCriteria: {},
    criteriaKey: "string_eq",
  });

  it("renders", () => {
    const p = fakeProps();
    const wrapper = mount(<EqCriteriaSelection<string> {...p} />);
    expect(wrapper.text()).toContain("=");
  });

  it("removes criteria", () => {
    const p = fakeProps();
    p.eqCriteria = { openfarm_slug: ["slug"] };
    const wrapper = mount(<EqCriteriaSelection<string> {...p} />);
    wrapper.find("button").last().simulate("click");
    expect(removeEqCriteriaValue).toHaveBeenCalledWith(
      p.group,
      { openfarm_slug: ["slug"] },
      "string_eq",
      "openfarm_slug",
      "slug",
    );
  });
});

describe("<NumberCriteriaSelection />", () => {
  const fakeProps = (): NumberCriteriaProps => ({
    criteria: DEFAULT_CRITERIA,
    group: fakePointGroup(),
    dispatch: jest.fn(),
    criteriaKey: "number_lt",
  });

  it("renders", () => {
    const p = fakeProps();
    p.criteria.number_lt = { x: 1 };
    const wrapper = mount(<NumberCriteriaSelection {...p} />);
    expect(wrapper.text()).toContain("<");
  });

  it("removes criteria", () => {
    const p = fakeProps();
    p.criteriaKey = "number_gt";
    p.criteria.number_gt = { x: 1 };
    const wrapper = mount(<NumberCriteriaSelection {...p} />);
    expect(wrapper.text()).toContain(">");
    wrapper.find("button").last().simulate("click");
    expect(clearCriteriaField).toHaveBeenCalledWith(
      p.group,
      ["number_gt"],
      "x",
    );
  });
});

describe("<DaySelection />", () => {
  const fakeProps = (): CriteriaSelectionProps => ({
    criteria: DEFAULT_CRITERIA,
    group: fakePointGroup(),
    dispatch: jest.fn(),
  });

  it("changes operator", () => {
    const p = fakeProps();
    p.criteria.day = { days_ago: 0, op: ">" };
    const wrapper = shallow(<DaySelection {...p} />);
    wrapper.find(FBSelect).simulate("change", { label: "", value: "<" });
    expect(editCriteria).toHaveBeenCalledWith(
      p.group,
      { day: { days_ago: 0, op: "<" } },
    );
  });

  it("changes day value", () => {
    const p = fakeProps();
    p.criteria.day = { days_ago: 0, op: "<" };
    const wrapper = shallow(<DaySelection {...p} />);
    wrapper.find("input").last().simulate("change", {
      currentTarget: { value: "1" }
    });
    expect(editCriteria).toHaveBeenCalledWith(
      p.group,
      { day: { days_ago: 1, op: "<" } },
    );
  });

  it("changes operator from undefined", () => {
    const p = fakeProps();
    p.criteria.day = undefined;
    const wrapper = shallow(<DaySelection {...p} />);
    const opSelect = wrapper.find(FBSelect);
    expect(opSelect.props().selectedItem).toEqual({
      label: "Select one", value: "",
    });
    opSelect.simulate("change", { label: "", value: "<" });
    expect(editCriteria).toHaveBeenCalledWith(
      p.group,
      { day: { days_ago: 0, op: "<" } },
    );
  });

  it("changes day value from undefined", () => {
    const p = fakeProps();
    p.criteria.day = undefined;
    const wrapper = shallow(<DaySelection {...p} />);
    const dayInput = wrapper.find("input").last();
    expect(dayInput.props().value).toEqual("");
    dayInput.simulate("change", {
      currentTarget: { value: "1" }
    });
    expect(editCriteria).toHaveBeenCalledWith(
      p.group,
      { day: { days_ago: 1, op: "<" } },
    );
  });
});

describe("<NumberLtGtInput />", () => {
  const fakeProps = (): NumberLtGtInputProps => ({
    criteriaKey: "x",
    group: fakePointGroup(),
    dispatch: jest.fn(),
  });

  it("changes number_gt", () => {
    const p = fakeProps();
    const wrapper = shallow(<NumberLtGtInput {...p} />);
    wrapper.find("input").first().simulate("blur", {
      currentTarget: { value: "1" }
    });
    expect(editGtLtCriteriaField).toHaveBeenCalledWith(
      p.group,
      "number_gt",
      "x",
      undefined,
    );
  });

  it("changes number_lt", () => {
    const p = fakeProps();
    const wrapper = shallow(<NumberLtGtInput {...p} />);
    wrapper.find("input").last().simulate("blur", {
      currentTarget: { value: "1" }
    });
    expect(editGtLtCriteriaField).toHaveBeenCalledWith(
      p.group,
      "number_lt",
      "x",
      undefined,
    );
  });
});

describe("<LocationSelection />", () => {
  const fakeProps = (): LocationSelectionProps => ({
    criteria: DEFAULT_CRITERIA,
    group: fakePointGroup(),
    dispatch: jest.fn(),
    editGroupAreaInMap: false,
  });

  it("toggles selection box behavior", () => {
    const p = fakeProps();
    const wrapper = mount(<LocationSelection {...p} />);
    wrapper.find("button").first().simulate("click");
    expect(p.dispatch).toHaveBeenCalledWith({
      type: Actions.EDIT_GROUP_AREA_IN_MAP,
      payload: true
    });
  });
});
