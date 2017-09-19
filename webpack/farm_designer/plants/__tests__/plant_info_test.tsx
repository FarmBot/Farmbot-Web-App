jest.mock("react-redux", () => ({
  connect: jest.fn()
}));

import * as React from "react";
import { PlantInfo } from "../plant_info";
import { mount } from "enzyme";
import { fakePlant } from "../../../__test_support__/fake_state/resources";

describe("<PlantInfo />", () => {
  it("renders", () => {
    const dispatch = jest.fn();
    const wrapper = mount(
      <PlantInfo
        push={jest.fn()}
        dispatch={() => dispatch}
        findPlant={fakePlant} />);
    expect(wrapper.text()).toContain("Strawberry Plant 1");
    expect(wrapper.text().replace(/\s+/g, " "))
      .toContain("Plant Type: Strawberry");
    const buttons = wrapper.find("button");
    expect(buttons.first().props().hidden).toBeTruthy();
    expect(buttons.last().props().hidden).toBeTruthy();
  });
});
