jest.mock("react-redux", () => ({
  connect: jest.fn()
}));

jest.mock("../../../history", () => ({
  getPathArray: jest.fn(() => { return []; }),
  history: { push: jest.fn() }
}));

import * as React from "react";
import { PlantInfo } from "../plant_info";
import { mount } from "enzyme";
import { fakePlant } from "../../../__test_support__/fake_state/resources";
import { EditPlantInfoProps } from "../../interfaces";
import { history } from "../../../history";

describe("<PlantInfo />", () => {
  function fakeProps(): EditPlantInfoProps {
    return {
      push: jest.fn(),
      findPlant: fakePlant,
      dispatch: jest.fn()
    };
  }

  it("renders", () => {
    const wrapper = mount(<PlantInfo {...fakeProps()} />);
    expect(wrapper.text()).toContain("Strawberry Plant 1");
    expect(wrapper.text().replace(/\s+/g, " "))
      .toContain("Plant Type: Strawberry");
    const buttons = wrapper.find("button");
    expect(buttons.first().props().hidden).toBeTruthy();
    expect(buttons.last().props().hidden).toBeTruthy();
  });

  it("renders: no plant", () => {
    const p = fakeProps();
    p.findPlant = () => undefined;
    const wrapper = mount(<PlantInfo {...p} />);
    expect(wrapper.text().toLowerCase()).toContain("redirecting...");
    expect(history.push).toHaveBeenCalledWith("/app/designer/plants");
  });
});
