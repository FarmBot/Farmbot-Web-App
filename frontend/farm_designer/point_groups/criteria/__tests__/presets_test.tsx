const mockToggle = jest.fn();
jest.mock("../edit", () => ({
  togglePointSelection: jest.fn(() => mockToggle),
  toggleStringCriteria: jest.fn(),
}));

import React from "react";
import { mount } from "enzyme";
import {
  CheckboxSelections, togglePointSelection, criteriaSelected,
} from "..";
import { CheckboxSelectionsProps } from "../interfaces";
import {
  fakePointGroup,
} from "../../../../__test_support__/fake_state/resources";
import { PointGroup } from "farmbot/dist/resources/api_resources";

describe("<CheckboxSelections />", () => {
  const fakeProps = (): CheckboxSelectionsProps => ({
    dispatch: jest.fn(),
    group: fakePointGroup(),
  });

  it("renders", () => {
    const p = fakeProps();
    p.group.body.criteria = undefined as unknown as PointGroup["criteria"];
    const wrapper = mount(<CheckboxSelections {...p} />);
    ["planted plants", "detected weeds", "created points", "created weeds",
    ].map(string =>
      expect(wrapper.text()).toContain(string));
  });

  it("changes criteria", () => {
    const p = fakeProps();
    const wrapper = mount(<CheckboxSelections {...p} />);
    wrapper.find("input").first().simulate("change");
    expect(togglePointSelection).toHaveBeenCalledWith(p.group);
    expect(mockToggle).toHaveBeenCalledWith({
      plant_stage: "planted", pointer_type: "Plant"
    });
  });
});

describe("criteriaSelected()", () => {
  it("returns selection state: false", () => {
    const result = criteriaSelected(undefined)({ pointer_type: "Plant" });
    expect(result).toEqual(false);
  });

  it("returns selection state: true", () => {
    const result = criteriaSelected({
      pointer_type: ["Plant"]
    })({ pointer_type: "Plant" });
    expect(result).toEqual(true);
  });
});
