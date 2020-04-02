jest.mock("../../../open_farm/cached_crop", () => ({
  maybeGetCachedPlantIcon: jest.fn(),
}));

let mockPath = "/app/designer/plants";
jest.mock("../../../history", () => ({
  push: jest.fn(),
  getPathArray: () => mockPath.split("/"),
}));

jest.mock("../../map/actions", () => ({
  mapPointClickAction: jest.fn(() => jest.fn()),
  setHoveredPlant: jest.fn(),
  selectPoint: jest.fn(),
}));

import * as React from "react";
import {
  PlantInventoryItem, PlantInventoryItemProps,
} from "../plant_inventory_item";
import { shallow, mount } from "enzyme";
import {
  fakePlant, fakePlantTemplate,
} from "../../../__test_support__/fake_state/resources";
import { push } from "../../../history";
import { maybeGetCachedPlantIcon } from "../../../open_farm/cached_crop";
import {
  mapPointClickAction, setHoveredPlant, selectPoint,
} from "../../map/actions";

describe("<PlantInventoryItem />", () => {
  const fakeProps = (): PlantInventoryItemProps => ({
    plant: fakePlant(),
    dispatch: jest.fn(),
    hovered: false,
  });

  it("renders", () => {
    const wrapper = shallow(<PlantInventoryItem {...fakeProps()} />);
    expect(wrapper.text()).toEqual("Strawberry Plant 11 days old");
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
    expect(setHoveredPlant).toBeCalledWith(p.plant.uuid, "");
  });

  it("hover end", () => {
    const wrapper = shallow(<PlantInventoryItem {...fakeProps()} />);
    wrapper.simulate("mouseLeave");
    expect(setHoveredPlant).toBeCalledWith(undefined, "");
  });

  it("selects plant", () => {
    mockPath = "/app/designer/plants";
    const p = fakeProps();
    const wrapper = shallow(<PlantInventoryItem {...p} />);
    wrapper.simulate("click");
    expect(mapPointClickAction).not.toHaveBeenCalled();
    expect(selectPoint).toBeCalledWith([p.plant.uuid]);
    expect(push).toHaveBeenCalledWith("/app/designer/plants/" + p.plant.body.id);
  });

  it("removes item in box select mode", () => {
    mockPath = "/app/designer/plants/select";
    const p = fakeProps();
    const wrapper = shallow(<PlantInventoryItem {...p} />);
    wrapper.simulate("click");
    expect(mapPointClickAction).toHaveBeenCalledWith(expect.any(Function),
      p.plant.uuid);
    expect(push).not.toHaveBeenCalled();
    expect(setHoveredPlant).toHaveBeenCalledWith(undefined, "");
  });

  it("selects plant template", () => {
    mockPath = "/app/designer/plants";
    const p = fakeProps();
    p.plant = fakePlantTemplate();
    const wrapper = shallow(<PlantInventoryItem {...p} />);
    wrapper.simulate("click");
    expect(selectPoint).toBeCalledWith([p.plant.uuid]);
    expect(push).toHaveBeenCalledWith(
      "/app/designer/gardens/templates/" + p.plant.body.id);
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
