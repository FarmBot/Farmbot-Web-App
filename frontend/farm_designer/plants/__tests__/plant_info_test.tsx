jest.mock("react-redux", () => ({ connect: jest.fn() }));

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
import { fakeTimeSettings } from "../../../__test_support__/fake_time_settings";

describe("<PlantInfo />", () => {
  const fakeProps = (): EditPlantInfoProps => ({
    push: jest.fn(),
    findPlant: fakePlant,
    dispatch: jest.fn(),
    openedSavedGarden: undefined,
    timeSettings: fakeTimeSettings(),
  });

  it("renders", () => {
    const wrapper = mount(<PlantInfo {...fakeProps()} />);
    ["Strawberry Plant 1", "Plant Type", "Strawberry"].map(string =>
      expect(wrapper.text().toLowerCase()).toContain(string.toLowerCase()));
    const buttons = wrapper.find("button");
    expect(buttons.at(1).text()).toEqual("Move FarmBot to this plant");
    expect(buttons.at(1).props().hidden).toBeFalsy();
  });

  it("renders: no plant", () => {
    const p = fakeProps();
    p.findPlant = () => undefined;
    const wrapper = mount(<PlantInfo {...p} />);
    expect(wrapper.text().toLowerCase()).toContain("redirecting...");
    expect(history.push).toHaveBeenCalledWith("/app/designer/plants");
  });

  it("has link to plants", () => {
    const p = fakeProps();
    p.openedSavedGarden = undefined;
    const wrapper = mount(<PlantInfo {...p} />);
    expect(wrapper.find("Link").first().props().to)
      .toContain("/app/designer/plants");
  });
});
