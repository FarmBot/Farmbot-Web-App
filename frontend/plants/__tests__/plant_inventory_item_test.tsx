jest.mock("../../open_farm/cached_crop", () => ({
  maybeGetCachedPlantIcon: jest.fn(),
}));

import { Path } from "../../internal_urls";
let mockPath = Path.mock(Path.plants());
jest.mock("../../history", () => ({
  push: jest.fn(),
  getPathArray: () => mockPath.split("/"),
}));

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
import { push } from "../../history";
import { maybeGetCachedPlantIcon } from "../../open_farm/cached_crop";
import {
  mapPointClickAction, setHoveredPlant, selectPoint,
} from "../../farm_designer/map/actions";

describe("<PlantInventoryItem />", () => {
  const fakeProps = (): PlantInventoryItemProps => ({
    plant: fakePlant(),
    dispatch: jest.fn(),
    hovered: false,
  });

  it("renders", () => {
    const wrapper = shallow(<PlantInventoryItem {...fakeProps()} />);
    expect(wrapper.text()).toEqual("Strawberry Plant 11 day old");
    expect(wrapper.find("div").first().hasClass("hovered")).toBeFalsy();
  });

  it("handles missing plant name", () => {
    const p = fakeProps();
    p.plant.body.name = "";
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
    expect(setHoveredPlant).toHaveBeenCalledWith(p.plant.uuid, "");
  });

  it("hover end", () => {
    const wrapper = shallow(<PlantInventoryItem {...fakeProps()} />);
    wrapper.simulate("mouseLeave");
    expect(setHoveredPlant).toHaveBeenCalledWith(undefined, "");
  });

  it("selects plant", () => {
    mockPath = Path.mock(Path.plants());
    const p = fakeProps();
    const wrapper = shallow(<PlantInventoryItem {...p} />);
    wrapper.simulate("click");
    expect(mapPointClickAction).not.toHaveBeenCalled();
    expect(selectPoint).toHaveBeenCalledWith([p.plant.uuid]);
    expect(push).toHaveBeenCalledWith(Path.plants(p.plant.body.id));
  });

  it("handles missing plant id", () => {
    const p = fakeProps();
    p.plant.body.id = 0;
    const wrapper = shallow(<PlantInventoryItem {...p} />);
    wrapper.simulate("click");
    expect(selectPoint).toHaveBeenCalledWith([p.plant.uuid]);
    expect(push).toHaveBeenCalledWith(Path.plants("ERR_NO_PLANT_ID"));
  });

  it("removes item in box select mode", () => {
    mockPath = Path.mock(Path.plants("select"));
    const p = fakeProps();
    const wrapper = shallow(<PlantInventoryItem {...p} />);
    wrapper.simulate("click");
    expect(mapPointClickAction).toHaveBeenCalledWith(expect.any(Function),
      p.plant.uuid);
    expect(push).not.toHaveBeenCalled();
    expect(setHoveredPlant).toHaveBeenCalledWith(undefined, "");
  });

  it("selects plant template", () => {
    mockPath = Path.mock(Path.plants());
    const p = fakeProps();
    p.plant = fakePlantTemplate();
    const wrapper = shallow(<PlantInventoryItem {...p} />);
    wrapper.simulate("click");
    expect(selectPoint).toHaveBeenCalledWith([p.plant.uuid]);
    expect(push).toHaveBeenCalledWith(
      Path.savedGardens(`templates/${p.plant.body.id}`));
  });

  it("gets cached icon", () => {
    const wrapper =
      mount<PlantInventoryItem>(<PlantInventoryItem {...fakeProps()} />);
    const img = wrapper.find("img");
    img.simulate("load");
    expect(maybeGetCachedPlantIcon).toHaveBeenCalledWith("strawberry",
      img.instance(), expect.any(Function));
  });

  it("sets icon", () => {
    const wrapper =
      mount<PlantInventoryItem>(<PlantInventoryItem {...fakeProps()} />);
    expect(wrapper.state().icon).toEqual("");
    wrapper.instance().updateStateIcon("fake icon");
    expect(wrapper.state().icon).toEqual("fake icon");
  });
});

describe("daysOldText()", () => {
  it("returns correct text", () => {
    expect(daysOldText(1)).toEqual("1 day old");
    expect(daysOldText(0)).toEqual("0 days old");
    expect(daysOldText(2)).toEqual("2 days old");
  });
});
