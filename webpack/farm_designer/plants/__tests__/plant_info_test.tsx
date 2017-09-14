import * as React from "react";
import { PlantInfo } from "../plant_info";
import { mount } from "enzyme";
import { fakePlant } from "../../../__test_support__/fake_state/resources";
import { createStore } from "redux";
import { reducers } from "../../../redux/root_reducer";

describe("<PlantInfo />", () => {
  it("redirects", () => {
    const dispatch = jest.fn();
    const wrapper = mount(
      <PlantInfo
        push={jest.fn()}
        dispatch={() => dispatch}
        findPlant={fakePlant} />,
      { context: { store: createStore(reducers) } });
    expect(wrapper.text()).toEqual("Redirecting...");
  });
});
