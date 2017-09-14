import * as React from "react";
import { Plants } from "../plant_inventory";
import { mount } from "enzyme";
import { fakePlant } from "../../../__test_support__/fake_state/resources";
import { createStore } from "redux";
import { reducers } from "../../../redux/root_reducer";

describe("<PlantInventory />", () => {
  it("renders", () => {
    const wrapper = mount(
      <Plants
        plants={[fakePlant()]}
        dispatch={jest.fn()} />,
      { context: { store: createStore(reducers) } });
    expect(wrapper.text()).toEqual("DesignerPlantsFarm Events");
    expect(wrapper.find("input").props().placeholder)
      .toEqual("Search your plants...");
  });
});
