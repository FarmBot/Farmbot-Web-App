let mockPath = "/app/designer/plants/1";
jest.mock("../../history", () => ({
  getPathArray: jest.fn(() => mockPath.split("/")),
  push: jest.fn(),
}));

jest.mock("../../api/crud", () => ({
  destroy: jest.fn(),
  save: jest.fn(),
  edit: jest.fn(),
}));

import React from "react";
import { RawPlantInfo as PlantInfo } from "../plant_info";
import { mount, shallow } from "enzyme";
import { fakePlant } from "../../__test_support__/fake_state/resources";
import { EditPlantInfoProps } from "../../farm_designer/interfaces";
import { push } from "../../history";
import { fakeTimeSettings } from "../../__test_support__/fake_time_settings";
import { edit, save, destroy } from "../../api/crud";
import { DesignerPanelHeader } from "../../farm_designer/designer_panel";

describe("<PlantInfo />", () => {
  const fakeProps = (): EditPlantInfoProps => ({
    push: jest.fn(),
    findPlant: fakePlant,
    dispatch: jest.fn(),
    openedSavedGarden: undefined,
    timeSettings: fakeTimeSettings(),
    getConfigValue: jest.fn(),
    farmwareEnvs: [],
    soilHeightPoints: [],
  });

  it("renders", () => {
    const wrapper = mount(<PlantInfo {...fakeProps()} />);
    ["Strawberry Plant 1", "Plant Type", "Strawberry"].map(string =>
      expect(wrapper.text().toLowerCase()).toContain(string.toLowerCase()));
    const buttons = wrapper.find("button");
    expect(buttons.at(0).text()).toEqual("Move FarmBot to this plant");
    expect(buttons.at(1).text()).toEqual("Planned");
  });

  it("renders: no plant", () => {
    mockPath = "/app/designer/plants/nope";
    const p = fakeProps();
    p.findPlant = () => undefined;
    const wrapper = mount(<PlantInfo {...p} />);
    expect(wrapper.text().toLowerCase()).toContain("redirecting...");
    expect(push).toHaveBeenCalledWith("/app/designer/plants");
  });

  it("renders: no plant template", () => {
    mockPath = "/app/designer/gardens/templates/nope";
    const p = fakeProps();
    p.findPlant = () => undefined;
    const wrapper = mount(<PlantInfo {...p} />);
    expect(wrapper.text().toLowerCase()).toContain("redirecting...");
    expect(push).toHaveBeenCalledWith("/app/designer/plants");
  });

  it("doesn't redirect", () => {
    mockPath = "/app/logs";
    const p = fakeProps();
    p.findPlant = () => undefined;
    const wrapper = mount(<PlantInfo {...p} />);
    expect(wrapper.text().toLowerCase()).toContain("redirecting...");
    expect(push).not.toHaveBeenCalled();
  });

  it("has link to plants", () => {
    const p = fakeProps();
    p.openedSavedGarden = undefined;
    const wrapper = mount(<PlantInfo {...p} />);
    expect(wrapper.find("Link").first().props().to)
      .toContain("/app/designer/plants");
  });

  it("gets plant id", () => {
    mockPath = "/app/designer/plants/1";
    const p = fakeProps();
    p.openedSavedGarden = undefined;
    const wrapper = mount<PlantInfo>(<PlantInfo {...p} />);
    expect(wrapper.instance().stringyID).toEqual("1");
  });

  it("gets template id", () => {
    mockPath = "/app/designer/gardens/templates/2";
    const p = fakeProps();
    p.openedSavedGarden = "uuid";
    const wrapper = mount<PlantInfo>(<PlantInfo {...p} />);
    expect(wrapper.instance().stringyID).toEqual("2");
  });

  it("handles missing plant id", () => {
    mockPath = "/app/designer/plants";
    const p = fakeProps();
    p.openedSavedGarden = undefined;
    const wrapper = mount<PlantInfo>(<PlantInfo {...p} />);
    expect(wrapper.instance().stringyID).toEqual("");
  });

  it("updates plant", () => {
    const wrapper = mount<PlantInfo>(<PlantInfo {...fakeProps()} />);
    wrapper.instance().updatePlant("uuid", {});
    expect(edit).toHaveBeenCalled();
    expect(save).toHaveBeenCalledWith("uuid");
  });

  it("handles missing plant", () => {
    const p = fakeProps();
    p.findPlant = jest.fn();
    const wrapper = mount<PlantInfo>(<PlantInfo {...p} />);
    wrapper.instance().updatePlant("uuid", {});
    expect(edit).not.toHaveBeenCalled();
  });

  it("saves", () => {
    mockPath = "/app/designer/weeds/1";
    const p = fakeProps();
    const plant = fakePlant();
    plant.body.id = 1;
    p.findPlant = () => plant;
    const wrapper = shallow(<PlantInfo {...p} />);
    wrapper.find(DesignerPanelHeader).simulate("save");
    expect(save).toHaveBeenCalledWith(plant.uuid);
  });

  it("doesn't save", () => {
    mockPath = "/app/designer/logs";
    const p = fakeProps();
    const plant = fakePlant();
    plant.body.id = 1;
    p.findPlant = () => undefined;
    const wrapper = shallow(<PlantInfo {...p} />);
    wrapper.find(DesignerPanelHeader).simulate("save");
    expect(save).not.toHaveBeenCalled();
  });

  it("destroys plant", () => {
    const wrapper = mount<PlantInfo>(<PlantInfo {...fakeProps()} />);
    wrapper.instance().destroy("uuid");
    expect(destroy).toHaveBeenCalledWith("uuid", false);
  });

  it("force destroys plant", () => {
    const p = fakeProps();
    p.getConfigValue = jest.fn(() => false);
    const wrapper = mount<PlantInfo>(<PlantInfo {...p} />);
    wrapper.instance().destroy("uuid");
    expect(destroy).toHaveBeenCalledWith("uuid", true);
  });
});
