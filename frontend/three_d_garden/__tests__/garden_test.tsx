let mockIsDesktop = false;
jest.mock("../../screen_size", () => ({
  isDesktop: () => mockIsDesktop,
}));

import React from "react";
import { mount } from "enzyme";
import { GardenModelProps, GardenModel } from "../garden";
import { clone } from "lodash";
import { INITIAL } from "../config";

describe("<GardenModel />", () => {
  const fakeProps = (): GardenModelProps => ({
    config: clone(INITIAL),
    activeFocus: "",
    setActiveFocus: jest.fn(),
  });

  it("renders", () => {
    const wrapper = mount(<GardenModel {...fakeProps()} />);
    expect(wrapper.html()).toContain("zoom-beacons");
    expect(wrapper.html()).not.toContain("stats");
    expect(wrapper.html()).toContain("darkgreen");
  });

  it("renders other options", () => {
    mockIsDesktop = false;
    const p = fakeProps();
    p.config.perspective = false;
    p.config.plants = "";
    p.config.labels = true;
    p.config.labelsOnHover = false;
    p.config.sizePreset = "Genesis XL";
    p.config.stats = true;
    p.config.viewCube = true;
    p.config.lab = true;
    p.activeFocus = "plant";
    const wrapper = mount(<GardenModel {...p} />);
    expect(wrapper.html()).toContain("gray");
    expect(wrapper.html()).toContain("stats");
  });

  it("sets hover", () => {
    const p = fakeProps();
    p.config.labelsOnHover = true;
    const wrapper = mount(<GardenModel {...p} />);
    const e = {
      stopPropagation: jest.fn(),
      intersections: [{ object: { name: "obj" } }],
    };
    wrapper.find({ name: "plants" }).first().simulate("pointerEnter", e);
    expect(e.stopPropagation).toHaveBeenCalled();
  });

  it("sets hover: buttons", () => {
    const p = fakeProps();
    p.config.labelsOnHover = true;
    const wrapper = mount(<GardenModel {...p} />);
    const e = {
      stopPropagation: jest.fn(),
      buttons: true,
    };
    wrapper.find({ name: "plants" }).first().simulate("pointerEnter", e);
    expect(e.stopPropagation).toHaveBeenCalled();
  });

  it("un-sets hover", () => {
    const p = fakeProps();
    p.config.labelsOnHover = true;
    const wrapper = mount(<GardenModel {...p} />);
    const e = {
      stopPropagation: jest.fn(),
      intersections: [{ object: { name: "obj" } }],
    };
    wrapper.find({ name: "plants" }).first().simulate("pointerLeave", e);
    expect(e.stopPropagation).toHaveBeenCalled();
  });

  it("doesn't set hover", () => {
    const p = fakeProps();
    p.config.labels = true;
    p.config.labelsOnHover = false;
    const wrapper = mount(<GardenModel {...p} />);
    const e = { stopPropagation: jest.fn() };
    wrapper.find({ name: "plants" }).first().simulate("pointerEnter", e);
    expect(e.stopPropagation).not.toHaveBeenCalled();
  });

  it("logs debug event", () => {
    console.log = jest.fn();
    const p = fakeProps();
    p.config.eventDebug = true;
    const wrapper = mount(<GardenModel {...p} />);
    wrapper.simulate("pointerMove", {
      intersections: [
        { object: { name: "1" } },
        { object: { name: "2" } },
      ],
    });
    expect(console.log).toHaveBeenCalledWith(["1", "2"]);
  });
});
