jest.mock("react-redux", () => ({
  connect: jest.fn()
}));

const mockErr = jest.fn();
jest.mock("farmbot-toastr", () => ({ error: mockErr }));

import * as React from "react";
import { EditPlantInfo } from "../edit_plant_info";
import { mount } from "enzyme";
import { fakePlant } from "../../../__test_support__/fake_state/resources";
import { EditPlantInfoProps } from "../../interfaces";

describe("<EditPlantInfo />", () => {
  beforeEach(function () {
    jest.clearAllMocks();
  });

  const fakeProps = (): EditPlantInfoProps => {
    return {
      push: jest.fn(),
      dispatch: jest.fn(),
      findPlant: fakePlant,
    };
  };

  it("renders", async () => {
    const wrapper = mount(<EditPlantInfo {...fakeProps()} />);
    expect(wrapper.text()).toContain("Strawberry Plant 1");
    expect(wrapper.text().replace(/\s+/g, " "))
      .toContain("Plant Type: Strawberry");
  });

  it("deletes plant", async () => {
    const p = fakeProps();
    p.dispatch = jest.fn(() => { return Promise.resolve(); });
    const wrapper = mount(<EditPlantInfo {...p} />);
    const deleteButton = wrapper.find("button").at(1);
    expect(deleteButton.props().hidden).toBeFalsy();
    expect(deleteButton.text()).toEqual("Delete");
    deleteButton.simulate("click");
    expect(p.dispatch).toHaveBeenCalled();
  });
});
