let mockIsDesktop = true;

import React from "react";
import TestRenderer from "react-test-renderer";
import { render } from "@testing-library/react";
import { ZoomBeacons, ZoomBeaconsProps } from "../zoom_beacons";
import { clone } from "lodash";
import { INITIAL } from "../../config";
import * as screenSize from "../../../screen_size";

const originalDocumentQuerySelector = document.querySelector.bind(document);
let isDesktopSpy: jest.SpyInstance;

describe("<ZoomBeacons />", () => {
  beforeEach(() => {
    mockIsDesktop = true;
    window.location.href = "http://localhost:3000/app/designer";
    history.pushState = jest.fn();
    isDesktopSpy = jest.spyOn(screenSize, "isDesktop")
      .mockImplementation(() => mockIsDesktop);
  });

  afterEach(() => {
    Object.defineProperty(document, "querySelector", {
      value: originalDocumentQuerySelector,
      configurable: true,
    });
    isDesktopSpy.mockRestore();
  });

  const fakeProps = (): ZoomBeaconsProps => ({
    config: clone(INITIAL),
    activeFocus: "",
    setActiveFocus: jest.fn(),
  });

  it("renders", async () => {
    jest.useFakeTimers();
    const { container } = render(<ZoomBeacons {...fakeProps()} />);
    await jest.runAllTimers();
    expect(container.innerHTML).toContain("zoom-beacons");
    expect(container.innerHTML).not.toContain("debug-group");
    expect(container.innerHTML).toContain("60,12,12");
    jest.runAllTimers();
  });

  it("renders: debug", () => {
    const p = fakeProps();
    p.config.zoomBeaconDebug = true;
    p.config.sizePreset = "Genesis XL";
    p.config.animate = false;
    const { container } = render(<ZoomBeacons {...p} />);
    expect(container.innerHTML).toContain("debug-group");
  });

  it("renders mobile", () => {
    mockIsDesktop = false;
    const { container } = render(<ZoomBeacons {...fakeProps()} />);
    expect(container.innerHTML).toContain("80,12,12");
  });

  it("shows beacon", () => {
    const p = fakeProps();
    p.config.animate = false;
    const wrapper = TestRenderer.create(<ZoomBeacons {...p} />);
    const sphere = wrapper.root.findAll(node => node.props.name == "beacon-sphere")[0];
    sphere?.props.onPointerEnter();
    sphere?.props.onPointerLeave();
    sphere?.props.onClick();
    expect(p.setActiveFocus).toHaveBeenCalledWith("What you can grow");
    wrapper.unmount();
  });

  it("changes cursor", () => {
    const element = document.createElement("div");
    Object.defineProperty(document, "querySelector", {
      value: () => element,
      configurable: true,
    });
    const p = fakeProps();
    p.activeFocus = "What you can grow";
    p.config.animate = false;
    const wrapper = TestRenderer.create(<ZoomBeacons {...p} />);
    const sphere = wrapper.root.findAll(node => node.props.name == "beacon-sphere")[0];
    sphere?.props.onPointerEnter();
    expect((document.querySelector("") as HTMLElement).style.cursor)
      .toEqual("zoom-out");
    sphere?.props.onPointerLeave();
    expect((document.querySelector("") as HTMLElement).style.cursor).toEqual("");
    sphere?.props.onClick();
    expect((document.querySelector("") as HTMLElement).style.cursor).toEqual("");
    expect(p.setActiveFocus).toHaveBeenCalledWith("");
    wrapper.unmount();
  });

  it("changes cursor: zoom-in", () => {
    const element = document.createElement("div");
    Object.defineProperty(document, "querySelector", {
      value: () => element,
      configurable: true,
    });
    const p = fakeProps();
    p.activeFocus = "";
    p.config.animate = false;
    const wrapper = TestRenderer.create(<ZoomBeacons {...p} />);
    const sphere = wrapper.root.findAll(node => node.props.name == "beacon-sphere")[0];
    sphere?.props.onPointerEnter();
    expect((document.querySelector("") as HTMLElement).style.cursor)
      .toEqual("zoom-in");
    wrapper.unmount();
  });

  it("shows pop-up", () => {
    const p = fakeProps();
    p.activeFocus = "What you can grow";
    p.config.animate = false;
    const wrapper = TestRenderer.create(<ZoomBeacons {...p} />);
    const e = { stopPropagation: jest.fn() };
    const info = wrapper.root.findAll(node => node.props.className == "beacon-info")[0];
    info?.props.onPointerDown(e);
    info?.props.onPointerMove(e);
    expect(e.stopPropagation).toHaveBeenCalledTimes(2);
    wrapper.root.findAll(node => node.props.className == "exit-button")[0]
      ?.props.onClick();
    expect(p.setActiveFocus).toHaveBeenCalledWith("");
    wrapper.unmount();
  });
});
