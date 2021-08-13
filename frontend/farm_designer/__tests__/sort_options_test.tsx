import { PopoverProps } from "../../ui/popover";
jest.mock("../../ui/popover", () => ({
  Popover: ({ target, content }: PopoverProps) => <div>{target}{content}</div>,
}));

import React from "react";
import { mount } from "enzyme";
import { fakePoint } from "../../__test_support__/fake_state/resources";
import {
  PointSortMenu, orderedPoints, PointSortMenuProps,
} from "../sort_options";

describe("orderedPoints()", () => {
  it("orders points", () => {
    const point0 = fakePoint();
    point0.body.name = "point 0";
    point0.body.radius = 1;
    const point1 = fakePoint();
    point1.body.name = "point 1";
    point1.body.radius = 1000;
    const point2 = fakePoint();
    point2.body.name = "point 2";
    point2.body.radius = 100;
    const result = orderedPoints([point0, point1, point2],
      { sortBy: "radius", reverse: true });
    expect(result).toEqual([point1, point2, point0]);
  });
});

describe("<PointSortMenu />", () => {
  const fakeProps = (): PointSortMenuProps => ({
    sortOptions: { sortBy: undefined, reverse: false },
    onChange: jest.fn(),
  });

  it("changes sort type: default", () => {
    const p = fakeProps();
    const wrapper = mount(<PointSortMenu {...p} />);
    wrapper.find("i.fa-sort").simulate("click");
    expect(p.onChange).toHaveBeenCalledWith({
      sortBy: undefined, reverse: false
    });
  });

  it("changes sort type: by age", () => {
    const p = fakeProps();
    const wrapper = mount(<PointSortMenu {...p} />);
    wrapper.find("i.fa-calendar").simulate("click");
    expect(p.onChange).toHaveBeenCalledWith({
      sortBy: "created_at", reverse: false
    });
  });

  it("changes sort type: by name", () => {
    const p = fakeProps();
    const wrapper = mount(<PointSortMenu {...p} />);
    wrapper.find("i.fa-font").simulate("click");
    expect(p.onChange).toHaveBeenCalledWith({
      sortBy: "name", reverse: false
    });
  });

  it("changes sort type: by size", () => {
    const p = fakeProps();
    const wrapper = mount(<PointSortMenu {...p} />);
    wrapper.find("i.fa-sort-amount-desc").simulate("click");
    expect(p.onChange).toHaveBeenCalledWith({
      sortBy: "radius", reverse: true
    });
  });

  it("changes sort type: by z", () => {
    const p = fakeProps();
    const wrapper = mount(<PointSortMenu {...p} />);
    wrapper.find("i.z").simulate("click");
    expect(p.onChange).toHaveBeenCalledWith({
      sortBy: "z", reverse: true
    });
  });

  it("shows selected sort method: default", () => {
    const p = fakeProps();
    p.sortOptions = { sortBy: undefined, reverse: false };
    const wrapper = mount(<PointSortMenu {...p} />);
    expect(wrapper.find("i.fa-sort").hasClass("selected")).toBeTruthy();
    expect(wrapper.find("i.fa-sort-amount-desc").hasClass("selected"))
      .toBeFalsy();
  });

  it("shows selected sort method: age", () => {
    const p = fakeProps();
    p.sortOptions = { sortBy: "created_at", reverse: false };
    const wrapper = mount(<PointSortMenu {...p} />);
    expect(wrapper.find("i.fa-sort").hasClass("selected")).toBeFalsy();
    expect(wrapper.find("i.fa-calendar").hasClass("selected")).toBeTruthy();
  });

  it("shows selected sort method: name", () => {
    const p = fakeProps();
    p.sortOptions = { sortBy: "name", reverse: false };
    const wrapper = mount(<PointSortMenu {...p} />);
    expect(wrapper.find("i.fa-sort").hasClass("selected")).toBeFalsy();
    expect(wrapper.find("i.fa-font").hasClass("selected")).toBeTruthy();
  });

  it("shows selected sort method: size", () => {
    const p = fakeProps();
    p.sortOptions = { sortBy: "radius", reverse: true };
    const wrapper = mount(<PointSortMenu {...p} />);
    expect(wrapper.find("i.fa-sort").hasClass("selected")).toBeFalsy();
    expect(wrapper.find("i.fa-sort-amount-desc").hasClass("selected"))
      .toBeTruthy();
  });

  it("shows selected sort method: z", () => {
    const p = fakeProps();
    p.sortOptions = { sortBy: "z", reverse: true };
    const wrapper = mount(<PointSortMenu {...p} />);
    expect(wrapper.find("i.fa-sort").hasClass("selected")).toBeFalsy();
    expect(wrapper.find("i.z").hasClass("selected")).toBeTruthy();
  });
});
