jest.mock("../edit", () => ({
  toggleAndEditEqCriteria: jest.fn(),
}));

import React from "react";
import { mount } from "enzyme";
import { toggleAndEditEqCriteria } from "..";
import { CheckboxListProps, SubCriteriaSectionProps } from "../interfaces";
import {
  fakePointGroup,
} from "../../../__test_support__/fake_state/resources";
import { CheckboxList, SubCriteriaSection } from "../subcriteria";

describe("<SubCriteriaSection />", () => {
  const fakeProps = (): SubCriteriaSectionProps => ({
    dispatch: jest.fn(),
    group: fakePointGroup(),
    disabled: false,
    pointerTypes: [],
    slugs: [],
  });

  it("doesn't return criteria", () => {
    const p = fakeProps();
    p.pointerTypes = [];
    const wrapper = mount(<SubCriteriaSection {...p} />);
    expect(wrapper.text()).toEqual("");
  });

  it("doesn't return incompatible criteria", () => {
    const p = fakeProps();
    p.pointerTypes = ["Plant", "Weed"];
    const wrapper = mount(<SubCriteriaSection {...p} />);
    expect(wrapper.text()).toEqual("");
  });

  it("returns plant criteria", () => {
    const p = fakeProps();
    p.pointerTypes = ["Plant"];
    p.slugs = ["strawberry-guava"];
    const wrapper = mount(<SubCriteriaSection {...p} />);
    expect(wrapper.text().toLowerCase()).toContain("stage");
    expect(wrapper.text()).toContain("Strawberry guava");
  });

  it("returns point criteria", () => {
    const p = fakeProps();
    p.pointerTypes = ["GenericPointer"];
    const wrapper = mount(<SubCriteriaSection {...p} />);
    expect(wrapper.text().toLowerCase()).toContain("color");
  });

  it("returns weed criteria", () => {
    const p = fakeProps();
    p.pointerTypes = ["Weed"];
    const wrapper = mount(<SubCriteriaSection {...p} />);
    expect(wrapper.text().toLowerCase()).toContain("source");
  });

  it("returns tool slot criteria", () => {
    const p = fakeProps();
    p.pointerTypes = ["ToolSlot"];
    const wrapper = mount(<SubCriteriaSection {...p} />);
    expect(wrapper.text().toLowerCase()).toContain("direction");
  });
});

describe("<CheckboxList />", () => {
  const fakeProps = (): CheckboxListProps<string> => ({
    criteriaKey: "openfarm_slug",
    list: [{ label: "label", value: "value" }],
    dispatch: jest.fn(),
    group: fakePointGroup(),
    pointerType: "Plant",
    disabled: false,
  });

  it("toggles criteria", () => {
    const p = fakeProps();
    const wrapper = mount(<CheckboxList {...p} />);
    expect(wrapper.text()).toContain("label");
    wrapper.find("input").first().simulate("change");
    expect(toggleAndEditEqCriteria).toHaveBeenCalledWith(
      p.group, "openfarm_slug", "value");
  });
});
