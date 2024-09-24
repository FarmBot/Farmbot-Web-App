import React from "react";
import { mount } from "enzyme";
import { Bot, FarmbotModelProps } from "../bot";
import { INITIAL } from "../config";
import { clone } from "lodash";
import { SVGLoader } from "three/examples/jsm/Addons";

describe("<Bot />", () => {
  const fakeProps = (): FarmbotModelProps => ({
    config: clone(INITIAL),
    activeFocus: "",
  });

  it("renders", () => {
    const p = fakeProps();
    p.config.sizePreset = "Genesis";
    p.config.tracks = true;
    p.config.trail = true;
    const wrapper = mount(<Bot {...p} />);
    expect(wrapper.html()).toContain("bot");
    expect(wrapper.html()).toContain("water-tube");
    expect(wrapper.find({ name: "wateringNozzle" }).first().props().position)
      .toEqual([-1344, 210, 75]);
  });

  it("renders: Jr", () => {
    const p = fakeProps();
    p.config.sizePreset = "Jr";
    p.config.tracks = false;
    p.config.trail = false;
    const wrapper = mount(<Bot {...p} />);
    expect(wrapper.html()).toContain("bot");
    expect(wrapper.find({ name: "wateringNozzle" }).first().props().position)
      .toEqual([-1344, 110, 75]);
  });

  it("loads shapes", () => {
    const p = fakeProps();
    mount(<Bot {...p} />);
    expect(SVGLoader.createShapes).toHaveBeenCalledTimes(15);
  });
});
