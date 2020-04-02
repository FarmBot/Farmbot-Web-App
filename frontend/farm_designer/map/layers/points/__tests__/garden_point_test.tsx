jest.mock("../../../../../history", () => ({
  history: { push: jest.fn() },
  getPathArray: jest.fn(),
}));

import * as React from "react";
import { GardenPoint } from "../garden_point";
import { GardenPointProps } from "../../../interfaces";
import { fakePoint } from "../../../../../__test_support__/fake_state/resources";
import {
  fakeMapTransformProps,
} from "../../../../../__test_support__/map_transform_props";
import { Actions } from "../../../../../constants";
import { history } from "../../../../../history";
import { svgMount } from "../../../../../__test_support__/svg_mount";

describe("<GardenPoint/>", () => {
  const fakeProps = (): GardenPointProps => ({
    mapTransformProps: fakeMapTransformProps(),
    point: fakePoint(),
    hovered: false,
    dispatch: jest.fn(),
  });

  it("renders point", () => {
    const wrapper = svgMount(<GardenPoint {...fakeProps()} />);
    expect(wrapper.find("#point-radius").props().r).toEqual(100);
    expect(wrapper.find("#point-center").props().r).toEqual(2);
    expect(wrapper.find("#point-radius").props().fill).toEqual("transparent");
  });

  it("hovers point", () => {
    const p = fakeProps();
    const wrapper = svgMount(<GardenPoint {...p} />);
    wrapper.find("g").simulate("mouseEnter");
    expect(p.dispatch).toHaveBeenCalledWith({
      type: Actions.TOGGLE_HOVERED_POINT,
      payload: p.point.uuid
    });
  });

  it("is hovered", () => {
    const p = fakeProps();
    p.hovered = true;
    const wrapper = svgMount(<GardenPoint {...p} />);
    expect(wrapper.find("#point-radius").props().fill).toEqual("green");
  });

  it("un-hovers point", () => {
    const p = fakeProps();
    const wrapper = svgMount(<GardenPoint {...p} />);
    wrapper.find("g").simulate("mouseLeave");
    expect(p.dispatch).toHaveBeenCalledWith({
      type: Actions.TOGGLE_HOVERED_POINT,
      payload: undefined
    });
  });

  it("opens point info", () => {
    const p = fakeProps();
    const wrapper = svgMount(<GardenPoint {...p} />);
    wrapper.find("g").simulate("click");
    expect(history.push).toHaveBeenCalledWith(
      `/app/designer/points/${p.point.body.id}`);
  });
});
