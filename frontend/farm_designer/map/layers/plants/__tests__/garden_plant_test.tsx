import React from "react";
import { GardenPlant } from "../garden_plant";
import { shallow } from "enzyme";
import { GardenPlantProps } from "../../../interfaces";
import { fakePlant } from "../../../../../__test_support__/fake_state/resources";
import { Actions } from "../../../../../constants";
import {
  fakeMapTransformProps,
} from "../../../../../__test_support__/map_transform_props";
import { SpecialStatus } from "farmbot";

describe("<GardenPlant />", () => {
  const fakeProps = (): GardenPlantProps => ({
    mapTransformProps: fakeMapTransformProps(),
    plant: fakePlant(),
    current: false,
    selected: false,
    editing: false,
    dragging: false,
    dispatch: jest.fn(),
    zoomLvl: 1.8,
    activeDragXY: { x: undefined, y: undefined, z: undefined },
    uuid: "plantUuid",
    animate: false,
    hovered: false,
    hoveredSpread: undefined,
  });

  it("renders plant", () => {
    const p = fakeProps();
    p.selected = true;
    p.animate = false;
    const wrapper = shallow(<GardenPlant {...p} />);
    expect(wrapper.find("image").length).toEqual(1);
    expect(wrapper.find("image").props().opacity).toEqual(1);
    expect(wrapper.find("image").props().visibility).toEqual("visible");
    expect(wrapper.find("image").props().opacity).toEqual(1.0);
    expect(wrapper.find("image").props().filter).toEqual("");
    expect(wrapper.find("text").length).toEqual(0);
    expect(wrapper.find("rect").length).toBeLessThanOrEqual(1);
    expect(wrapper.find("use").length).toEqual(0);
    expect(wrapper.find(".soil-cloud").length).toEqual(0);
    expect(wrapper.find("Circle").props().className).not.toContain("animate");
  });

  it("renders plant animations", () => {
    const p = fakeProps();
    p.animate = true;
    p.selected = true;
    const wrapper = shallow(<GardenPlant {...p} />);
    expect(wrapper.find(".soil-cloud").length).toEqual(1);
    expect(wrapper.find(".soil-cloud").props().r).toEqual(20);
    expect(wrapper.find(".animate").length).toEqual(2);
    expect(wrapper.find("Circle").props().className).toContain("animate");
  });

  it("renders hovered spread size", () => {
    const p = fakeProps();
    p.current = true;
    p.animate = true;
    p.hoveredSpread = 1000;
    p.selected = true;
    const wrapper = shallow(<GardenPlant {...p} />);
    expect(wrapper.find(".soil-cloud").length).toEqual(1);
    expect(wrapper.find(".soil-cloud").props().r).toEqual(100);
  });

  it("calls the onClick callback", () => {
    const p = fakeProps();
    const wrapper = shallow(<GardenPlant {...p} />);
    wrapper.find("image").at(0).simulate("click");
    expect(p.dispatch).toHaveBeenCalledWith(expect.any(Function));
  });

  it("begins hover", () => {
    const p = fakeProps();
    const wrapper = shallow(<GardenPlant {...p} />);
    wrapper.find("image").at(0).simulate("mouseEnter");
    expect(p.dispatch).toHaveBeenCalledWith({
      type: Actions.HOVER_PLANT_LIST_ITEM,
      payload: p.uuid
    });
  });

  it("ends hover", () => {
    const p = fakeProps();
    const wrapper = shallow(<GardenPlant {...p} />);
    wrapper.find("image").at(0).simulate("mouseLeave");
    expect(p.dispatch).toHaveBeenCalledWith({
      type: Actions.HOVER_PLANT_LIST_ITEM,
      payload: undefined
    });
  });

  it("doesn't render the indicator circle", () => {
    const p = fakeProps();
    const wrapper = shallow(<GardenPlant {...p} />);
    expect(wrapper.find(".plant-indicator").length).toEqual(0);
  });

  it("renders the indicator circle", () => {
    const p = fakeProps();
    p.selected = true;
    const wrapper = shallow(<GardenPlant {...p} />);
    expect(wrapper.find(".plant-indicator").length).toEqual(1);
    expect(wrapper.find("Circle").length).toEqual(1);
  });

  it("doesn't render indicator circle twice", () => {
    const p = fakeProps();
    p.selected = true;
    p.hovered = true;
    const wrapper = shallow(<GardenPlant {...p} />);
    expect(wrapper.find(".plant-indicator").length).toEqual(0);
    expect(wrapper.find("Circle").length).toEqual(0);
  });

  it("renders while dragging", () => {
    const p = fakeProps();
    p.dragging = true;
    const wrapper = shallow(<GardenPlant {...p} />);
    expect(wrapper.find("image").props().visibility).toEqual("hidden");
    expect(wrapper.find("image").props().opacity).toEqual(0.4);
  });

  it("renders grayscale", () => {
    const p = fakeProps();
    const plant = fakePlant();
    plant.specialStatus = SpecialStatus.DIRTY;
    plant.body.meta = { gridId: "fake grid uuid" };
    p.plant = plant;
    const wrapper = shallow(<GardenPlant {...p} />);
    expect(wrapper.find("image").props().filter).toEqual("url(#grayscale)");
  });
});
