import React from "react";
import { mount } from "enzyme";
import { Bot, FarmbotModelProps } from "../bot";
import { INITIAL } from "../../config";
import { clone } from "lodash";
import { SVGLoader } from "three/examples/jsm/Addons";

describe("<Bot />", () => {
  const fakeProps = (): FarmbotModelProps => {
    const config = clone(INITIAL);
    config.bot = true;
    config.tracks = true;
    config.cableCarriers = true;
    return {
      config,
      activeFocus: "",
    };
  };

  it("renders", () => {
    const p = fakeProps();
    p.config.sizePreset = "Genesis";
    p.config.tracks = true;
    p.config.trail = true;
    const wrapper = mount(<Bot {...p} />);
    expect(wrapper.html()).toContain("bot");
    expect(wrapper.html()).toContain("water-tube");
    expect(wrapper.find({ name: "slot" }).last().props().position)
      .toEqual([-1350, 200, 60]);
  });

  it("renders: Jr", () => {
    const p = fakeProps();
    p.config.sizePreset = "Jr";
    p.config.tracks = false;
    p.config.trail = false;
    const wrapper = mount(<Bot {...p} />);
    expect(wrapper.html()).toContain("bot");
    expect(wrapper.find({ name: "slot" }).last().props().position)
      .toEqual([-1350, 100, 60]);
  });

  it("renders: v1.7", () => {
    const p = fakeProps();
    p.config.kitVersion = "v1.7";
    const wrapper = mount(<Bot {...p} />);
    expect(wrapper.find({ name: "button-group" }).length).toEqual(15); // 5 * 3
  });

  it("renders: v1.8", () => {
    const p = fakeProps();
    p.config.kitVersion = "v1.8";
    const wrapper = mount(<Bot {...p} />);
    expect(wrapper.find({ name: "button-group" }).length).toEqual(9); // 3 * 3
  });

  it("loads shapes", () => {
    const p = fakeProps();
    mount(<Bot {...p} />);
    expect(SVGLoader.createShapes).toHaveBeenCalledTimes(15);
  });
});
