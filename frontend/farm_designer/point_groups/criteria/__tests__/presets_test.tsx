jest.mock("../edit", () => ({
  togglePointTypeCriteria: jest.fn(),
  toggleAndEditEqCriteria: jest.fn(),
  clearCriteriaField: jest.fn(),
}));

import React from "react";
import { mount, shallow } from "enzyme";
import {
  CheckboxSelections, togglePointTypeCriteria, clearCriteriaField,
} from "..";
import { CheckboxSelectionsProps } from "../interfaces";
import {
  fakePointGroup,
} from "../../../../__test_support__/fake_state/resources";
import { Checkbox } from "../../../../ui";

describe("<CheckboxSelections />", () => {
  const fakeProps = (): CheckboxSelectionsProps => ({
    dispatch: jest.fn(),
    group: fakePointGroup(),
    slugs: ["mint"],
  });

  it("renders all criteria", () => {
    const STRINGS = [
      "planted", "mint",
      "farm designer", "radius", "green",
      "positive x",
    ];
    const wrapper = mount(<CheckboxSelections {...fakeProps()} />);
    STRINGS.map(string =>
      expect(wrapper.text().toLowerCase()).not.toContain(string.toLowerCase()));
    wrapper.setState({ Plant: true, GenericPointer: true, ToolSlot: true });
    STRINGS.map(string =>
      expect(wrapper.text().toLowerCase()).toContain(string.toLowerCase()));
  });

  it("clears sub criteria", () => {
    const p = fakeProps();
    p.group.body.criteria.string_eq = { plant_stage: ["planned"] };
    const wrapper = mount(<CheckboxSelections {...p} />);
    wrapper.setState({ Plant: true, GenericPointer: false, ToolSlot: false });
    wrapper.find(".plant-criteria-options")
      .find("input").first().simulate("change");
    expect(clearCriteriaField).toHaveBeenCalledWith(
      p.group, ["string_eq"], "plant_stage",
    );
  });

  it("toggles section", () => {
    const wrapper =
      shallow<CheckboxSelections>(<CheckboxSelections {...fakeProps()} />);
    expect(wrapper.state().Plant).toBeFalsy();
    wrapper.instance().toggleMore("Plant")();
    expect(wrapper.state().Plant).toBeTruthy();
  });

  it("toggles point type", () => {
    const p = fakeProps();
    const wrapper = mount(<CheckboxSelections {...p} />);
    wrapper.find("input").first().simulate("change");
    expect(togglePointTypeCriteria).toHaveBeenCalledWith(p.group, "Plant");
  });

  it("stops propagation", () => {
    const wrapper = mount(<CheckboxSelections {...fakeProps()} />);
    const e = { stopPropagation: jest.fn() };
    wrapper.find(".fb-checkbox").first().simulate("click", e);
    expect(e.stopPropagation).toHaveBeenCalled();
  });

  it("is not disabled", () => {
    const p = fakeProps();
    const wrapper = mount(<CheckboxSelections {...p} />);
    const pointTypeBoxes = wrapper.find(".point-type-checkbox").find("input");
    expect(pointTypeBoxes.first().props().disabled).toBeFalsy();
    expect(pointTypeBoxes.at(1).props().disabled).toBeFalsy();
    expect(pointTypeBoxes.last().props().disabled).toBeFalsy();
  });

  it("is disabled", () => {
    const p = fakeProps();
    p.group.body.criteria.string_eq = { plant_stage: ["planted"] };
    p.group.body.criteria.number_eq = { pullout_direction: [0] };
    p.group.body.criteria.number_gt = { radius: 0 };
    const wrapper = mount(<CheckboxSelections {...p} />);
    const pointTypeBoxes = wrapper.find(".point-type-checkbox").find(Checkbox);
    expect(pointTypeBoxes.first().props().disabled).toBeTruthy();
    expect(pointTypeBoxes.at(1).props().disabled).toBeTruthy();
    expect(pointTypeBoxes.last().props().disabled).toBeTruthy();
  });
});
