let mockIsDesktop = true;
jest.mock("../../../screen_size", () => ({
  isDesktop: () => mockIsDesktop,
}));

import React from "react";
import { mount } from "enzyme";
import { ZoomBeacons, ZoomBeaconsProps } from "../zoom_beacons";
import { clone } from "lodash";
import { INITIAL } from "../../config";

describe("<ZoomBeacons />", () => {
  beforeEach(() => {
    window.location.href = "http://localhost:3000/app/designer";
    history.pushState = jest.fn();
  });

  const fakeProps = (): ZoomBeaconsProps => ({
    config: clone(INITIAL),
    activeFocus: "",
    setActiveFocus: jest.fn(),
  });

  it("renders", async () => {
    jest.useFakeTimers();
    const wrapper = mount(<ZoomBeacons {...fakeProps()} />);
    await jest.runAllTimers();
    expect(wrapper.html()).toContain("zoom-beacons");
    expect(wrapper.html()).not.toContain("debug-group");
    expect(wrapper.html()).toContain("60,12,12");
    jest.runAllTimers();
  });

  it("renders: debug", () => {
    const p = fakeProps();
    p.config.zoomBeaconDebug = true;
    p.config.sizePreset = "Genesis XL";
    p.config.animate = false;
    const wrapper = mount(<ZoomBeacons {...p} />);
    expect(wrapper.html()).toContain("debug-group");
  });

  it("renders mobile", () => {
    mockIsDesktop = false;
    const wrapper = mount(<ZoomBeacons {...fakeProps()} />);
    expect(wrapper.html()).toContain("80,12,12");
  });

  it("shows beacon", () => {
    const p = fakeProps();
    const wrapper = mount(<ZoomBeacons {...p} />);
    const sphere = wrapper.find({ name: "beacon-sphere" }).first();
    sphere.simulate("pointerEnter");
    sphere.simulate("pointerLeave");
    sphere.simulate("click");
    expect(p.setActiveFocus).toHaveBeenCalledWith("What you can grow");
  });

  it("changes cursor", () => {
    const element = document.createElement("div");
    Object.defineProperty(document, "querySelector", {
      value: () => element,
      configurable: true,
    });
    const p = fakeProps();
    p.activeFocus = "What you can grow";
    const wrapper = mount(<ZoomBeacons {...p} />);
    const sphere = wrapper.find({ name: "beacon-sphere" }).first();
    sphere.simulate("pointerEnter");
    expect((document.querySelector("") as HTMLElement).style.cursor)
      .toEqual("zoom-out");
    sphere.simulate("pointerLeave");
    expect((document.querySelector("") as HTMLElement).style.cursor).toEqual("");
    sphere.simulate("click");
    expect((document.querySelector("") as HTMLElement).style.cursor).toEqual("");
    expect(p.setActiveFocus).toHaveBeenCalledWith("");
  });

  it("changes cursor: zoom-in", () => {
    const element = document.createElement("div");
    Object.defineProperty(document, "querySelector", {
      value: () => element,
      configurable: true,
    });
    const p = fakeProps();
    p.activeFocus = "";
    const wrapper = mount(<ZoomBeacons {...p} />);
    const sphere = wrapper.find({ name: "beacon-sphere" }).first();
    sphere.simulate("pointerEnter");
    expect((document.querySelector("") as HTMLElement).style.cursor)
      .toEqual("zoom-in");
  });

  it("shows pop-up", () => {
    const p = fakeProps();
    p.activeFocus = "What you can grow";
    const wrapper = mount(<ZoomBeacons {...p} />);
    const e = { stopPropagation: jest.fn() };
    wrapper.find(".beacon-info").first().simulate("pointerDown", e);
    wrapper.find(".beacon-info").first().simulate("pointerMove", e);
    expect(e.stopPropagation).toHaveBeenCalledTimes(2);
    wrapper.find(".exit-button").first().simulate("click");
    expect(p.setActiveFocus).toHaveBeenCalledWith("");
  });
});
