import React from "react";
import { RawPlantInfo as PlantInfo } from "../plant_info";
import { mount, shallow } from "enzyme";
import { fakePlant } from "../../__test_support__/fake_state/resources";
import { EditPlantInfoProps } from "../../farm_designer/interfaces";
import { fakeTimeSettings } from "../../__test_support__/fake_time_settings";
import * as crud from "../../api/crud";
import { DesignerPanelHeader } from "../../farm_designer/designer_panel";
import {
  fakeBotSize, fakeMovementState,
} from "../../__test_support__/fake_bot_data";
import { Path } from "../../internal_urls";

beforeEach(() => {
  jest.spyOn(crud, "edit").mockImplementation(jest.fn());
  jest.spyOn(crud, "save").mockImplementation(jest.fn());
  jest.spyOn(crud, "destroy").mockImplementation(jest.fn());
});

afterEach(() => {
  jest.restoreAllMocks();
});
describe("<PlantInfo />", () => {
  const fakeProps = (): EditPlantInfoProps => ({
    findPlant: fakePlant,
    dispatch: jest.fn(),
    openedSavedGarden: undefined,
    timeSettings: fakeTimeSettings(),
    getConfigValue: jest.fn(),
    farmwareEnvs: [],
    soilHeightPoints: [],
    arduinoBusy: false,
    currentBotLocation: { x: 0, y: 0, z: 0 },
    botOnline: true,
    movementState: fakeMovementState(),
    sourceFbosConfig: () => ({ value: 0, consistent: true }),
    botSize: fakeBotSize(),
    curves: [],
    plants: [],
  });

  it("renders", () => {
    const wrapper = mount(<PlantInfo {...fakeProps()} />);
    ["Strawberry Plant 1", "Plant Type", "Strawberry"].map(string =>
      expect(wrapper.text().toLowerCase()).toContain(string.toLowerCase()));
    const buttons = wrapper.find("button");
    expect(buttons.at(0).text()).toEqual("Planned");
    expect(buttons.at(1).text()).toEqual("GO (X, Y)");
  });

  it("renders: no plant", () => {
    location.pathname = Path.mock(Path.plants("nope"));
    const p = fakeProps();
    p.findPlant = () => undefined;
    const wrapper = mount(<PlantInfo {...p} />);
    expect(wrapper.text().toLowerCase()).toContain("redirecting...");
    expect(mockNavigate).toHaveBeenCalledWith(Path.plants());
  });

  it("renders: no plant template", () => {
    location.pathname = Path.mock(Path.plantTemplates("nope"));
    const p = fakeProps();
    p.findPlant = () => undefined;
    const wrapper = mount(<PlantInfo {...p} />);
    expect(wrapper.text().toLowerCase()).toContain("redirecting...");
    expect(mockNavigate).toHaveBeenCalledWith(Path.plants());
  });

  it("doesn't redirect", () => {
    location.pathname = Path.mock(Path.logs());
    const p = fakeProps();
    p.findPlant = () => undefined;
    const wrapper = mount(<PlantInfo {...p} />);
    expect(wrapper.text().toLowerCase()).toContain("redirecting...");
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it("has link to plants", () => {
    const p = fakeProps();
    p.openedSavedGarden = undefined;
    const wrapper = mount(<PlantInfo {...p} />);
    expect(wrapper.find("Link").first().props().to)
      .toContain(Path.plants());
  });

  it("gets plant id", () => {
    location.pathname = Path.mock(Path.plants(1));
    const p = fakeProps();
    p.openedSavedGarden = undefined;
    const wrapper = mount<PlantInfo>(<PlantInfo {...p} />);
    expect(wrapper.instance().stringyID).toEqual("1");
  });

  it("gets template id", () => {
    location.pathname = Path.mock(Path.plantTemplates(2));
    const p = fakeProps();
    p.openedSavedGarden = 1;
    const wrapper = mount<PlantInfo>(<PlantInfo {...p} />);
    expect(wrapper.instance().stringyID).toEqual("2");
  });

  it("handles missing plant id", () => {
    location.pathname = Path.mock(Path.plants());
    const p = fakeProps();
    p.openedSavedGarden = undefined;
    const wrapper = mount<PlantInfo>(<PlantInfo {...p} />);
    expect(wrapper.instance().stringyID).toEqual("");
  });

  it("updates plant", () => {
    const wrapper = mount<PlantInfo>(<PlantInfo {...fakeProps()} />);
    wrapper.instance().updatePlant("uuid", {});
    expect(crud.edit).toHaveBeenCalled();
    expect(crud.save).toHaveBeenCalledWith("uuid");
  });

  it("handles missing plant", () => {
    const p = fakeProps();
    p.findPlant = jest.fn();
    const wrapper = mount<PlantInfo>(<PlantInfo {...p} />);
    wrapper.instance().updatePlant("uuid", {});
    expect(crud.edit).not.toHaveBeenCalled();
  });

  it("saves", () => {
    location.pathname = Path.mock(Path.plants(1));
    const p = fakeProps();
    const plant = fakePlant();
    plant.body.id = 1;
    p.findPlant = () => plant;
    const wrapper = shallow(<PlantInfo {...p} />);
    wrapper.find(DesignerPanelHeader).simulate("save");
    expect(crud.save).toHaveBeenCalledWith(plant.uuid);
  });

  it("doesn't save", () => {
    location.pathname = Path.mock(Path.logs());
    const p = fakeProps();
    const plant = fakePlant();
    plant.body.id = 1;
    p.findPlant = () => undefined;
    const wrapper = shallow(<PlantInfo {...p} />);
    wrapper.find(DesignerPanelHeader).simulate("save");
    expect(crud.save).not.toHaveBeenCalled();
  });

  it("destroys plant", () => {
    const wrapper = mount<PlantInfo>(<PlantInfo {...fakeProps()} />);
    wrapper.instance().destroy("uuid")();
    expect(crud.destroy).toHaveBeenCalledWith("uuid", false);
  });

  it("force destroys plant", () => {
    const p = fakeProps();
    p.getConfigValue = jest.fn(() => false);
    const wrapper = mount<PlantInfo>(<PlantInfo {...p} />);
    wrapper.instance().destroy("uuid")();
    expect(crud.destroy).toHaveBeenCalledWith("uuid", true);
  });
});
