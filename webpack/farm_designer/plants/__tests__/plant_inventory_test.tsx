jest.mock("react-redux", () => ({
  connect: jest.fn()
}));

import * as React from "react";
import { Plants } from "../plant_inventory";
import { mount } from "enzyme";
import { fakePlant } from "../../../__test_support__/fake_state/resources";

describe("<PlantInventory />", () => {
  it("renders", () => {
    const wrapper = mount(
      <Plants
        plants={[fakePlant()]}
        dispatch={jest.fn()} />);
    expect(wrapper.text()).toContain("DesignerPlantsFarm Events");
    expect(wrapper.text()).toContain("Strawberry Plant 11 days old");
    expect(wrapper.find("input").props().placeholder)
      .toEqual("Search your plants...");
  });
});
