jest.mock("../../../../../history", () => ({
  history: { push: jest.fn() },
  getPathArray: jest.fn(),
}));

import * as React from "react";
import { GardenWeed } from "../garden_weed";
import { GardenWeedProps } from "../../../interfaces";
import { fakeWeed } from "../../../../../__test_support__/fake_state/resources";
import {
  fakeMapTransformProps,
} from "../../../../../__test_support__/map_transform_props";
import { Actions } from "../../../../../constants";
import { history } from "../../../../../history";
import { svgMount } from "../../../../../__test_support__/svg_mount";

describe("<GardenWeed />", () => {
  const fakeProps = (): GardenWeedProps => ({
    mapTransformProps: fakeMapTransformProps(),
    weed: fakeWeed(),
    hovered: false,
    dispatch: jest.fn(),
    current: false,
    selected: false,
    animate: false,
    spreadVisible: true,
  });

  it("renders weed", () => {
    const p = fakeProps();
    p.weed.body.meta.color = undefined;
    const wrapper = svgMount(<GardenWeed {...p} />);
    expect(wrapper.find("#weed-radius").props().r).toEqual(100);
    expect(wrapper.find("#weed-radius").props().opacity).toEqual(0.5);
    expect(wrapper.find("stop").first().props().stopColor).toEqual("red");
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
    const wrapper = svgMount(<GardenWeed {...p} />);
    expect(wrapper.find(".soil-cloud").length).toEqual(1);
    expect(wrapper.find("image").hasClass("animate")).toBeTruthy();
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
    expect(history.push).toHaveBeenCalledWith(
      `/app/designer/weeds/${p.weed.body.id}`);
  });
});
