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
        dispatch={jest.fn()}
        hoveredPlantListItem={undefined} />);
    ["Map",
      "Plants",
      "Events",
      "Strawberry Plant",
      "11 days old"
    ].map(string => expect(wrapper.text()).toContain(string));
    expect(wrapper.find("input").props().placeholder)
      .toEqual("Search your plants...");
  });
});
