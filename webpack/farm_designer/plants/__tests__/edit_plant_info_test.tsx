jest.mock("react-redux", () => ({
  connect: jest.fn()
}));

jest.mock("../../../history", () => ({
  history: {
    push: jest.fn(),
  },
  getPathArray: () => ""
}));

import * as React from "react";
import { EditPlantInfo } from "../edit_plant_info";
import { mount } from "enzyme";
import { fakePlant } from "../../../__test_support__/fake_state/resources";
import { EditPlantInfoProps } from "../../interfaces";

describe("<EditPlantInfo />", () => {
  const fakeProps = (): EditPlantInfoProps => {
    return {
      push: jest.fn(),
      dispatch: jest.fn(),
      findPlant: fakePlant,
      openedSavedGarden: undefined,
      timeOffset: 0,
    };
  };

  it("renders", async () => {
    const wrapper = mount(<EditPlantInfo {...fakeProps()} />);
    ["Strawberry Plant 1", "Plant Type", "Strawberry"].map(string =>
      expect(wrapper.text().toLowerCase()).toContain(string.toLowerCase()));
    const buttons = wrapper.find("button");
    expect(buttons.at(1).text()).toEqual("Move FarmBot to this plant");
    expect(buttons.at(1).props().hidden).toBeTruthy();
  });

  it("deletes plant", async () => {
    const p = fakeProps();
    p.dispatch = jest.fn(() => { return Promise.resolve(); });
    const wrapper = mount(<EditPlantInfo {...p} />);
    const deleteButton = wrapper.find("button").at(2);
    expect(deleteButton.text()).toEqual("Delete");
    expect(deleteButton.props().hidden).toBeFalsy();
    deleteButton.simulate("click");
    expect(p.dispatch).toHaveBeenCalled();
  });
});
