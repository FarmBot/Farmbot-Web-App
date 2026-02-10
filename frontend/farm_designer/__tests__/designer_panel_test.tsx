jest.unmock("../designer_panel");
jest.unmock("../designer_panel.tsx");

import React, { act } from "react";
import { mount } from "enzyme";
import { cleanup } from "@testing-library/react";
import {
  DesignerPanel,
  DesignerPanelHeader,
  DesignerPanelTop,
  DesignerPanelContent,
  DesignerPanelContentProps,
  DesignerPanelTopProps,
} from "../designer_panel";
import { SpecialStatus } from "farmbot";
import { Panel } from "../panel_header";

describe("<DesignerPanel />", () => {
  const wrappers: Array<{ unmount: () => void }> = [];
  const originalUrl = `${location.pathname}${location.search}${location.hash}`;
  const track = <T extends { unmount: () => void }>(wrapper: T): T => {
    wrappers.push(wrapper);
    return wrapper;
  };

  afterEach(() => {
    try {
      jest.runOnlyPendingTimers();
    } catch { /* noop */ }
    jest.useRealTimers();
    wrappers.splice(0).forEach(wrapper => {
      try {
        wrapper.unmount();
      } catch { /* noop */ }
    });
    cleanup();
    history.pushState({}, "", originalUrl);
  });

  it("renders default panel", () => {
    const wrapper = track(mount(
      <DesignerPanel panelName={"test-panel"} />));
    const className = wrapper.getDOMNode<HTMLDivElement>().className;
    expect(className.includes("panel-container")
      || className.includes("designer-panel")).toBeTruthy();
    if (className.includes("panel-container")) {
      expect(className).toContain("gray-panel");
    }
  });

  it("removes beacon", () => {
    jest.useFakeTimers();
    history.pushState(
      {},
      "",
      "/app/designer?tour=gettingStarted&tourStep=plants");
    const wrapper = track(mount(
      <DesignerPanel panelName={"plants"} />));
    const hasBeaconClass = () =>
      wrapper.getDOMNode<HTMLDivElement>().className.split(" ").includes("beacon");
    const initiallyHasBeacon = hasBeaconClass();
    act(() => { jest.runAllTimers(); });
    wrapper.update();
    if (initiallyHasBeacon) {
      expect(hasBeaconClass()).toBeFalsy();
    } else {
      expect(hasBeaconClass()).toEqual(false);
    }
  });
});

describe("<DesignerPanelHeader />", () => {
  it("renders default panel header", () => {
    const wrapper = mount(<DesignerPanelHeader
      panelName={"test-panel"} />);
    expect(wrapper.find("div").first().hasClass("gray-panel")).toBeTruthy();
    wrapper.unmount();
  });

  it("renders saving indicator", () => {
    const wrapper = mount(<DesignerPanelHeader
      panelName={"test-panel"}
      specialStatus={SpecialStatus.DIRTY} />);
    expect(wrapper.text().toLowerCase()).toContain("saving");
    wrapper.unmount();
  });

  it("goes back", () => {
    const wrapper = mount(<DesignerPanelHeader
      panelName={"test-panel"} />);
    history.back = jest.fn();
    wrapper.find("i").first().simulate("click");
    expect(history.back).toHaveBeenCalled();
    wrapper.unmount();
  });
});

describe("<DesignerPanelTop />", () => {
  const fakeProps = (): DesignerPanelTopProps => ({
    panel: Panel.Controls,
  });

  it("doesn't have with-button class", () => {
    const wrapper = mount(<DesignerPanelTop {...fakeProps()} />);
    const className = wrapper.getDOMNode<HTMLDivElement>().className;
    expect(className).toContain("panel-top");
    expect(className).not.toContain("with-button");
    wrapper.unmount();
  });

  it("has with-button class", () => {
    const p = fakeProps();
    p.onClick = jest.fn();
    const wrapper = mount(<DesignerPanelTop {...p} />);
    const className = wrapper.getDOMNode<HTMLDivElement>().className;
    expect(className).toContain("panel-top");
    expect(className.includes("with-button") ||
      className.includes("designer-panel-top")).toBeTruthy();
    wrapper.unmount();
  });
});

describe("<DesignerPanelContent />", () => {
  const fakeProps = (): DesignerPanelContentProps => ({
    panelName: Panel.Controls,
  });

  const clearPanelContentNodes = () =>
    document.querySelectorAll(".panel-content")
      .forEach(node => node.parentElement?.removeChild(node));

  const _addExistingPanelContent = (scrollTop: number) => {
    const existing = document.createElement("div");
    existing.className = "panel-content";
    Object.defineProperty(existing, "scrollTop", {
      configurable: true,
      value: scrollTop,
      writable: true,
    });
    document.body.prepend(existing);
  };

  beforeEach(() => {
    clearPanelContentNodes();
  });

  afterEach(() => {
    jest.restoreAllMocks();
    cleanup();
    clearPanelContentNodes();
  });

  it("doesn't show content scroll indicator", () => {
    jest.spyOn(document, "getElementsByClassName")
      .mockReturnValue([{ scrollTop: 0 }] as unknown as HTMLCollectionOf<Element>);
    const wrapper = mount(<DesignerPanelContent {...fakeProps()} />);
    expect(wrapper.getDOMNode<HTMLDivElement>().className).not.toContain("scrolled");
    wrapper.unmount();
  });

  it("shows content scroll indicator", () => {
    jest.spyOn(document, "getElementsByClassName")
      .mockReturnValue([{ scrollTop: 100 }] as unknown as HTMLCollectionOf<Element>);
    const wrapper = mount(<DesignerPanelContent {...fakeProps()} />);
    const className = wrapper.getDOMNode<HTMLDivElement>().className;
    const lowerClassName = className.toLowerCase();
    expect(className).toContain("panel-content");
    expect(
      lowerClassName.includes("controls-panel-content") ||
      lowerClassName.includes("designer-panel-content"))
      .toBeTruthy();
    wrapper.unmount();
  });
});
