jest.mock("../zoom_beacons_constants", () => ({
  setUrlParam: jest.fn(),
}));

import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { mount } from "enzyme";
import {
  PublicOverlay, OverlayProps, PrivateOverlay, maybeAddParam,
} from "../config_overlays";
import { INITIAL, PRESETS } from "../config";
import { clone } from "lodash";
import { setUrlParam } from "../zoom_beacons_constants";

describe("<PublicOverlay />", () => {
  const fakeProps = (): OverlayProps => ({
    config: clone(INITIAL),
    setConfig: jest.fn(),
    toolTip: { timeoutId: 0, text: "" },
    setToolTip: jest.fn(),
    activeFocus: "",
    setActiveFocus: jest.fn(),
  });

  it("renders", () => {
    const wrapper = mount(<PublicOverlay {...fakeProps()} />);
    expect(wrapper.html()).toContain("settings-bar");
  });

  it("changes preset", () => {
    const p = fakeProps();
    const wrapper = mount(<PublicOverlay {...p} />);
    wrapper.find("button").at(1).simulate("click");
    expect(p.setConfig).toHaveBeenCalledWith({
      ...p.config,
      ...PRESETS["Genesis XL"],
    });
  });

  it("changes preset with ref", () => {
    const p = fakeProps();
    p.startTimeRef = { current: 0 };
    render(<PublicOverlay {...p} />);
    const radio = screen.getByText("Winter");
    fireEvent.click(radio);
    expect(p.startTimeRef.current).not.toEqual(0);
  });

  it("doesn't allow mobile XL", () => {
    const p = fakeProps();
    p.config.sizePreset = "Genesis XL";
    const wrapper = mount(<PublicOverlay {...p} />);
    jest.useFakeTimers();
    wrapper.find("button").at(7).simulate("click");
    expect(p.setConfig).not.toHaveBeenCalled();
    expect(p.setToolTip).toHaveBeenCalledWith({
      timeoutId: 1000000000000,
      text: "Mobile beds are not recommended for Genesis XL machines",
    });
    jest.runAllTimers();
    expect(p.setToolTip).toHaveBeenCalledWith({
      timeoutId: 0,
      text: "",
    });
  });

  it("sets buy button url and text", () => {
    const p = fakeProps();
    p.config.sizePreset = "Genesis XL";
    p.config.kitVersion = "v1.8";
    const wrapper = mount(<PublicOverlay {...p} />);
    const buyButton = wrapper.find(".buy-button").first();
    expect(buyButton.props().href).toContain("genesis-xl-v1-8");
    expect(buyButton.text()).toContain("GenesisXLv1.8");
  });
});

describe("<PrivateOverlay />", () => {
  const fakeProps = (): OverlayProps => ({
    config: clone(INITIAL),
    setConfig: jest.fn(),
    toolTip: { timeoutId: 0, text: "" },
    setToolTip: jest.fn(),
    activeFocus: "",
    setActiveFocus: jest.fn(),
  });

  it("renders", () => {
    const wrapper = mount(<PrivateOverlay {...fakeProps()} />);
    expect(wrapper.html()).toContain("all-configs");
  });

  it("changes value: number", () => {
    const p = fakeProps();
    const wrapper = mount(<PrivateOverlay {...p} />);
    wrapper.find({ type: "number" }).first().simulate("change",
      { target: { value: "123" } });
    expect(p.setConfig).toHaveBeenCalledWith({
      ...p.config,
      x: 123,
    });
    expect(p.setConfig).not.toHaveBeenCalledWith(p.config);
  });

  it("doesn't change value: number", () => {
    const p = fakeProps();
    const wrapper = mount(<PrivateOverlay {...p} />);
    wrapper.find({ type: "number" }).first().simulate("change",
      { target: { value: "nope" } });
    expect(p.setConfig).not.toHaveBeenCalled();
  });

  it("changes value: toggle", () => {
    const p = fakeProps();
    const wrapper = mount(<PrivateOverlay {...p} />);
    wrapper.find({ type: "checkbox" }).at(1).simulate("change",
      { target: { checked: false } });
    expect(p.setConfig).toHaveBeenCalledWith({
      ...p.config,
      promoInfo: false,
    });
    expect(p.setConfig).not.toHaveBeenCalledWith(p.config);
  });

  it("changes value: radio", () => {
    const p = fakeProps();
    const wrapper = mount(<PrivateOverlay {...p} />);
    wrapper.find({ type: "radio" }).at(7).simulate("change",
      { target: { value: "Jr" } });
    expect(p.setConfig).toHaveBeenCalledWith({
      ...p.config,
      ...PRESETS["Jr"],
      x: 100,
      y: 100,
      z: 50,
    });
    expect(p.setConfig).not.toHaveBeenCalledWith(p.config);
  });

  it("changes value: radio with ref", () => {
    const p = fakeProps();
    p.startTimeRef = { current: 0 };
    render(<PrivateOverlay {...p} />);
    const radio = screen.getByTitle("plants Winter");
    fireEvent.click(radio);
    expect(p.startTimeRef.current).not.toEqual(0);
    expect(p.setConfig).not.toHaveBeenCalledWith(p.config);
  });

  it("closes the config menu", () => {
    const p = fakeProps();
    const wrapper = mount(<PrivateOverlay {...p} />);
    wrapper.find(".close").first().simulate("click");
    expect(p.setConfig).toHaveBeenCalledWith({
      ...p.config,
      config: false,
    });
  });

  it("removes url param", () => {
    location.search = "?urlParamAutoAdd=true";
    const p = fakeProps();
    const wrapper = mount(<PrivateOverlay {...p} />);
    wrapper.find(".x").first().simulate("click");
    expect(setUrlParam).toHaveBeenCalledWith("urlParamAutoAdd", "");
  });
});

describe("maybeAddParam()", () => {
  it("doesn't add param", () => {
    maybeAddParam(false, "x", "1");
    expect(setUrlParam).not.toHaveBeenCalled();
  });

  it("adds param", () => {
    maybeAddParam(true, "x", "1");
    expect(setUrlParam).toHaveBeenCalledWith("x", "1");
  });
});
