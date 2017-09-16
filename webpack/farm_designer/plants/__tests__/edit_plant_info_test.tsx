jest.mock("react-redux", () => ({
  connect: jest.fn()
}));

const mockErr = jest.fn();
jest.mock("farmbot-toastr", () => ({ error: mockErr }));

import * as React from "react";
import { EditPlantInfo } from "../edit_plant_info";
import { mount } from "enzyme";
import { fakePlant } from "../../../__test_support__/fake_state/resources";

describe("<EditPlantInfo />", () => {

  it("renders", async () => {
    const wrapper = mount(
      <EditPlantInfo
        push={jest.fn()}
        dispatch={jest.fn()}
        findPlant={fakePlant} />);
    expect(wrapper.text()).toContain("Strawberry Plant 1");
    expect(wrapper.text().replace(/\s+/g, " "))
      .toContain("Plant Type: Strawberry");
  });

  it("deletes plant", async () => {
    const dispatch = jest.fn(() => { return Promise.resolve(); });
    const wrapper = mount(
      <EditPlantInfo
        push={jest.fn()}
        dispatch={dispatch}
        findPlant={fakePlant} />);
    expect(wrapper.find("button").props().hidden).toBeFalsy();
    wrapper.find("button").simulate("click");
    expect(dispatch).toHaveBeenCalled();
  });

});
