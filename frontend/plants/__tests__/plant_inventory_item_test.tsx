jest.mock("../../farm_designer/map/actions", () => ({
  mapPointClickAction: jest.fn(() => jest.fn()),
  setHoveredPlant: jest.fn(),
  selectPoint: jest.fn(),
}));

import React from "react";
import {
  daysOldText,
  PlantInventoryItem, PlantInventoryItemProps,
} from "../plant_inventory_item";
import { shallow, mount } from "enzyme";
import {
  fakePlant, fakePlantTemplate,
} from "../../__test_support__/fake_state/resources";
import {
  mapPointClickAction, setHoveredPlant, selectPoint,
} from "../../farm_designer/map/actions";
import moment from "moment";
import { Path } from "../../internal_urls";

describe("<PlantInventoryItem />", () => {
  const fakeProps = (): PlantInventoryItemProps => ({
    plant: fakePlant(),
    dispatch: jest.fn(),
    hovered: false,
  });

  it("renders", () => {
    const wrapper = shallow(<PlantInventoryItem {...fakeProps()} />);
    expect(wrapper.text()).toEqual("Strawberry Plant 1planned");
    expect(wrapper.find("div").first().hasClass("hovered")).toBeFalsy();
  });

  it("handles missing plant name", () => {
    const p = fakeProps();
    const plant = fakePlant();
    plant.body.name = "";
    plant.body.planted_at = "" + moment().toISOString();
    p.plant = plant;
    const wrapper = shallow(<PlantInventoryItem {...p} />);
    expect(wrapper.text()).toEqual("Unknown plant1 day old");
    expect(wrapper.find("div").first().hasClass("hovered")).toBeFalsy();
  });

  it("renders hovered", () => {
    const p = fakeProps();
    p.hovered = true;
    const wrapper = shallow(<PlantInventoryItem {...p} />);
    expect(wrapper.find("div").first().hasClass("hovered")).toBeTruthy();
  });

  it("hover begin", () => {
    const p = fakeProps();
    const wrapper = shallow(<PlantInventoryItem {...p} />);
    wrapper.simulate("mouseEnter");
    expect(setHoveredPlant).toHaveBeenCalledWith(p.plant.uuid);
  });

  it("hover end", () => {
    const wrapper = shallow(<PlantInventoryItem {...fakeProps()} />);
    wrapper.simulate("mouseLeave");
    expect(setHoveredPlant).toHaveBeenCalledWith(undefined);
  });

  it("selects plant", () => {
    location.pathname = Path.mock(Path.plants());
    const p = fakeProps();
    const wrapper = shallow(<PlantInventoryItem {...p} />);
    wrapper.simulate("click");
    expect(mapPointClickAction).not.toHaveBeenCalled();
    expect(selectPoint).toHaveBeenCalledWith([p.plant.uuid]);
    expect(mockNavigate).toHaveBeenCalledWith(Path.plants(p.plant.body.id));
  });

  it("handles missing plant id", () => {
    const p = fakeProps();
    p.plant.body.id = 0;
    const wrapper = shallow(<PlantInventoryItem {...p} />);
    wrapper.simulate("click");
    expect(selectPoint).toHaveBeenCalledWith([p.plant.uuid]);
    expect(mockNavigate).toHaveBeenCalledWith(Path.plants("ERR_NO_PLANT_ID"));
  });

  it("removes item in box select mode", () => {
    location.pathname = Path.mock(Path.plants("select"));
    const p = fakeProps();
    const wrapper = shallow(<PlantInventoryItem {...p} />);
    wrapper.simulate("click");
    expect(mapPointClickAction).toHaveBeenCalledWith(
      expect.any(Function),
      expect.any(Function),
      p.plant.uuid);
    expect(mockNavigate).not.toHaveBeenCalled();
    expect(setHoveredPlant).toHaveBeenCalledWith(undefined);
  });

  it("selects plant template", () => {
    location.pathname = Path.mock(Path.plants());
    const p = fakeProps();
    p.plant = fakePlantTemplate();
    const wrapper = shallow(<PlantInventoryItem {...p} />);
    wrapper.simulate("click");
    expect(selectPoint).toHaveBeenCalledWith([p.plant.uuid]);
    expect(mockNavigate).toHaveBeenCalledWith(
      Path.savedGardens(`templates/${p.plant.body.id}`));
  });

  it("gets and sets cached icon", () => {
    const p = fakeProps();
    const wrapper = mount(<PlantInventoryItem {...p} />);
    wrapper.simulate("mouseEnter");
    expect(setHoveredPlant).toHaveBeenCalledWith(p.plant.uuid);
  });
});

describe("daysOldText()", () => {
  it("returns correct text", () => {
    expect(daysOldText({ age: 1 })).toEqual("1 day old");
    expect(daysOldText({ age: 0 })).toEqual("0 days old");
    expect(daysOldText({ age: 2 })).toEqual("2 days old");
    expect(daysOldText({ age: 2, stage: "planted" })).toEqual("2 days old");
    expect(daysOldText({ age: undefined, stage: "planned" })).toEqual("planned");
  });
});
