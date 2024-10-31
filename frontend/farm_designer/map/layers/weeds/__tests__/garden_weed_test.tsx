import React from "react";
import { GardenWeed } from "../garden_weed";
import { GardenWeedProps } from "../../../interfaces";
import { fakeWeed } from "../../../../../__test_support__/fake_state/resources";
import {
  fakeMapTransformProps,
} from "../../../../../__test_support__/map_transform_props";
import { Actions } from "../../../../../constants";
import { svgMount } from "../../../../../__test_support__/svg_mount";
import { Path } from "../../../../../internal_urls";

describe("<GardenWeed />", () => {
  const fakeProps = (): GardenWeedProps => ({
    mapTransformProps: fakeMapTransformProps(),
    weed: fakeWeed(),
    hovered: false,
    dispatch: jest.fn(),
    current: false,
    selected: false,
    animate: false,
    radiusVisible: true,
  });

  it("renders weed", () => {
    const p = fakeProps();
    p.weed.body.meta.color = undefined;
    const wrapper = svgMount(<GardenWeed {...p} />);
    expect(wrapper.find("#weed-radius").props().r).toEqual(100);
    expect(wrapper.find("#weed-radius").props().opacity).toEqual(0.5);
    expect(wrapper.find("stop").first().props().stopColor).toEqual("red");
    expect(wrapper.find(".new").length).toEqual(0);
  });

  it("renders weed with no id", () => {
    const p = fakeProps();
    p.weed.body.id = 0;
    p.weed.body.meta.color = undefined;
    const wrapper = svgMount(<GardenWeed {...p} />);
    expect(wrapper.find(".new").length).toEqual(1);
  });

  it("renders weed color", () => {
    const p = fakeProps();
    p.weed.body.meta.color = "orange";
    const wrapper = svgMount(<GardenWeed {...p} />);
    expect(wrapper.find("#weed-radius").props().r).toEqual(100);
    expect(wrapper.find("#weed-radius").props().opacity).toEqual(0.5);
    expect(wrapper.find("stop").first().props().stopColor).toEqual("orange");
  });

  it("animates", () => {
    const p = fakeProps();
    p.animate = true;
    p.selected = true;
    const wrapper = svgMount(<GardenWeed {...p} />);
    expect(wrapper.find(".soil-cloud").length).toEqual(1);
    expect(wrapper.find("image").hasClass("animate")).toBeTruthy();
    expect(wrapper.find("circle").last().hasClass("weed-indicator")).toBeTruthy();
    expect(wrapper.find("circle").last().hasClass("animate")).toBeTruthy();
  });

  it("hovers weed", () => {
    const p = fakeProps();
    const wrapper = svgMount(<GardenWeed {...p} />);
    wrapper.find("g").first().simulate("mouseEnter");
    expect(p.dispatch).toHaveBeenCalledWith({
      type: Actions.TOGGLE_HOVERED_POINT,
      payload: p.weed.uuid
    });
  });

  it("is hovered", () => {
    const p = fakeProps();
    p.hovered = true;
    const wrapper = svgMount(<GardenWeed {...p} />);
    expect(wrapper.find("#weed-radius").props().opacity).toEqual(1);
  });

  it("un-hovers weed", () => {
    const p = fakeProps();
    const wrapper = svgMount(<GardenWeed {...p} />);
    wrapper.find("g").first().simulate("mouseLeave");
    expect(p.dispatch).toHaveBeenCalledWith({
      type: Actions.TOGGLE_HOVERED_POINT,
      payload: undefined
    });
  });

  it("opens weed info", () => {
    const p = fakeProps();
    const wrapper = svgMount(<GardenWeed {...p} />);
    wrapper.find("g").first().simulate("click");
    expect(mockNavigate).toHaveBeenCalledWith(Path.weeds(p.weed.body.id));
    expect(p.dispatch).toHaveBeenCalledWith({
      type: Actions.SELECT_POINT,
      payload: [p.weed.uuid],
    });
  });

  it("doesn't show selection indicator", () => {
    const p = fakeProps();
    p.selected = false;
    p.current = false;
    const wrapper = svgMount(<GardenWeed {...p} />);
    expect(wrapper.html()).not.toContain("weed-indicator");
  });

  it("shows selection indicator", () => {
    const p = fakeProps();
    p.selected = true;
    p.current = false;
    const wrapper = svgMount(<GardenWeed {...p} />);
    expect(wrapper.html()).toContain("weed-indicator");
  });

  it("doesn't render selection indicator when icon is hovered", () => {
    const p = fakeProps();
    p.hovered = true;
    p.selected = false;
    p.current = false;
    const wrapper = svgMount(<GardenWeed {...p} />);
    wrapper.find(GardenWeed).simulate("mouseEnter");
    expect(wrapper.html()).not.toContain("weed-indicator");
  });
});
