jest.mock("../edit", () => ({
  editCriteria: jest.fn(),
  editGtLtCriteriaField: jest.fn(() => jest.fn()),
  removeEqCriteriaValue: jest.fn(),
  clearCriteriaField: jest.fn(),
  clearLocationCriteria: jest.fn(),
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
  DEFAULT_CRITERIA,
  LocationSelectionProps,
  NumberLtGtInputProps,
  DaySelectionProps,
} from "../interfaces";
import {
  fakePointGroup,
} from "../../../__test_support__/fake_state/resources";
import { FBSelect, Checkbox } from "../../../ui";
import { Actions } from "../../../constants";

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
      ["x"],
    );
  });
});

describe("<DaySelection />", () => {
  const fakeProps = (): DaySelectionProps => ({
    criteria: DEFAULT_CRITERIA,
    group: fakePointGroup(),
    dispatch: jest.fn(),
    dayChanged: true,
    changeDay: jest.fn(),
    advanced: false,
  });

  it("shows label", () => {
    const p = fakeProps();
    p.advanced = true;
    const wrapper = shallow(<DaySelection {...p} />);
    expect(wrapper.html()).toContain("label");
  });

  it("changes operator", () => {
    const p = fakeProps();
    const wrapper = shallow(<DaySelection {...p} />);
    wrapper.find(FBSelect).simulate("change", { label: "", value: "<" });
    expect(editCriteria).toHaveBeenCalledWith(
      p.group,
      { day: { days_ago: 0, op: "<" } },
    );
  });

  it("changes day value", () => {
    const p = fakeProps();
    const wrapper = shallow(<DaySelection {...p} />);
    wrapper.find("input").last().simulate("change", {
      currentTarget: { value: "1" }
    });
    expect(editCriteria).toHaveBeenCalledWith(
      p.group,
      { day: { days_ago: 1, op: "<" } },
    );
  });

  it("resets day criteria to default", () => {
    const p = fakeProps();
    p.group.body.criteria.day = { op: ">", days_ago: 1 };
    const wrapper = shallow(<DaySelection {...p} />);
    wrapper.find(Checkbox).simulate("change");
    expect(editCriteria).toHaveBeenCalledWith(p.group, {
      day: { op: "<", days_ago: 0 }
    });
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
    );
  });
});

describe("<LocationSelection />", () => {
  const fakeProps = (): LocationSelectionProps => ({
    criteria: DEFAULT_CRITERIA,
    group: fakePointGroup(),
    dispatch: jest.fn(),
    editGroupAreaInMap: false,
    botSize: {
      x: { value: 3000, isDefault: true },
      y: { value: 1500, isDefault: true },
      z: { value: 400, isDefault: true },
    },
  });

  it("clears location criteria", () => {
    const p = fakeProps();
    const wrapper = mount(<LocationSelection {...p} />);
    wrapper.find("input").first().simulate("change");
    expect(clearCriteriaField).toHaveBeenCalledWith(
      p.group,
      ["number_lt", "number_gt"],
      ["x", "y"],
    );
  });

  it("toggles selection box behavior", () => {
    const p = fakeProps();
    const wrapper = mount(<LocationSelection {...p} />);
    wrapper.find("button").last().simulate("click");
    expect(p.dispatch).toHaveBeenCalledWith({
      type: Actions.EDIT_GROUP_AREA_IN_MAP,
      payload: true
    });
  });

  it("doesn't display selection warning", () => {
    const p = fakeProps();
    p.group.body.criteria.number_gt = {};
    p.group.body.criteria.number_gt = {};
    const wrapper = mount(<LocationSelection {...p} />);
    expect(wrapper.text().toLowerCase()).not.toContain("invalid selection");
  });

  it("displays selection warning", () => {
    const p = fakeProps();
    p.group.body.criteria.number_lt = { x: 100 };
    p.group.body.criteria.number_gt = { x: 200 };
    const wrapper = mount(<LocationSelection {...p} />);
    expect(wrapper.text().toLowerCase()).toContain("invalid selection");
  });
});
