import React from "react";
import { mount } from "enzyme";
import {
  ColorPicker,
  ColorPickerProps,
  ColorPickerCluster,
  ColorPickerClusterProps,
} from "../color_picker";

describe("<ColorPicker />", () => {
  const fakeProps = (): ColorPickerProps => ({
    current: "green",
    onChange: jest.fn(),
  });

  it("renders saucers", () => {
    const wrapper = mount(<ColorPicker {...fakeProps()} />);
    expect(wrapper.find(".saucer").length).toEqual(1);
    expect(wrapper.find(".green").length).toEqual(1);
  });

  it("renders icon saucers", () => {
    const p = fakeProps();
    p.saucerIcon = "fa-check";
    const wrapper = mount(<ColorPicker {...p} />);
    expect(wrapper.find(".icon-saucer").length).toEqual(1);
    expect(wrapper.find(".green").length).toEqual(1);
  });
});

describe("<ColorPickerCluster />", () => {
  const fakeProps = (): ColorPickerClusterProps => ({
    current: "green",
    onChange: jest.fn(),
  });

  it("renders saucers", () => {
    const wrapper = mount(<ColorPickerCluster {...fakeProps()} />);
    expect(wrapper.find(".saucer").length).toEqual(8);
  });

  it("renders icon saucers", () => {
    const p = fakeProps();
    p.saucerIcon = "fa-check";
    const wrapper = mount(<ColorPickerCluster {...p} />);
    expect(wrapper.find("i").length).toEqual(8);
  });

  it("changes color", () => {
    const p = fakeProps();
    const wrapper = mount(<ColorPickerCluster {...p} />);
    wrapper.find("div").at(1).simulate("click");
    expect(p.onChange).toHaveBeenCalledWith("blue");
  });
});
