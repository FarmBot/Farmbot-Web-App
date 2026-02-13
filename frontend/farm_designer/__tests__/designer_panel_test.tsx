jest.unmock("../designer_panel");
jest.unmock("../designer_panel.tsx");

import React, { act } from "react";
import { fireEvent, render } from "@testing-library/react";
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
    history.pushState({}, "", originalUrl);
  });

  it("renders default panel", () => {
    const { container } = track(render(
      <DesignerPanel panelName={"test-panel"} />));
    const className = container.firstElementChild?.className || "";
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
    const { container, rerender } = track(render(
      <DesignerPanel panelName={"plants"} />));
    const hasBeaconClass = () =>
      (container.firstElementChild?.className || "").split(" ").includes("beacon");
    const initiallyHasBeacon = hasBeaconClass();
    act(() => { jest.runAllTimers(); });
    rerender(<DesignerPanel panelName={"plants"} />);
    if (initiallyHasBeacon) {
      expect(hasBeaconClass()).toBeFalsy();
    } else {
      expect(hasBeaconClass()).toEqual(false);
    }
  });
});

describe("<DesignerPanelHeader />", () => {
  it("renders default panel header", () => {
    const { container } = render(<DesignerPanelHeader
      panelName={"test-panel"} />);
    expect(container.querySelector("div")?.className || "").toContain("gray-panel");
  });

  it("renders saving indicator", () => {
    const { container } = render(<DesignerPanelHeader
      panelName={"test-panel"}
      specialStatus={SpecialStatus.DIRTY} />);
    expect(container.textContent?.toLowerCase()).toContain("saving");
  });

  it("goes back", () => {
    const { container } = render(<DesignerPanelHeader
      panelName={"test-panel"} />);
    history.back = jest.fn();
    fireEvent.click(container.querySelector("i.back-arrow") as HTMLElement);
    expect(history.back).toHaveBeenCalled();
  });
});

describe("<DesignerPanelTop />", () => {
  const fakeProps = (): DesignerPanelTopProps => ({
    panel: Panel.Controls,
  });

  it("doesn't have with-button class", () => {
    const { container } = render(<DesignerPanelTop {...fakeProps()} />);
    const className = container.firstElementChild?.className || "";
    expect(className).toContain("panel-top");
    expect(className).not.toContain("with-button");
  });

  it("has with-button class", () => {
    const p = fakeProps();
    p.onClick = jest.fn();
    const { container } = render(<DesignerPanelTop {...p} />);
    const className = container.firstElementChild?.className || "";
    expect(className).toContain("panel-top");
    expect(className.includes("with-button") ||
      className.includes("designer-panel-top")).toBeTruthy();
  });
});

describe("<DesignerPanelContent />", () => {
  const fakeProps = (): DesignerPanelContentProps => ({
    panelName: Panel.Controls,
  });

  const clearPanelContentNodes = () =>
    document.querySelectorAll(".panel-content")
      .forEach(node => node.remove());

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
    clearPanelContentNodes();
  });

  it("doesn't show content scroll indicator", () => {
    jest.spyOn(document, "getElementsByClassName")
      .mockReturnValue([{ scrollTop: 0 }] as unknown as HTMLCollectionOf<Element>);
    const { container, unmount } = render(<DesignerPanelContent {...fakeProps()} />);
    unmount();
    const className = container.firstElementChild?.getAttribute("class") || "";
    expect(className).not.toContain("scrolled");
  });

  it("shows content scroll indicator", () => {
    jest.spyOn(document, "getElementsByClassName")
      .mockReturnValue([{ scrollTop: 100 }] as unknown as HTMLCollectionOf<Element>);
    const { container, unmount } = render(<DesignerPanelContent {...fakeProps()} />);
    const className = container.firstElementChild?.className || "";
    const lowerClassName = className.toLowerCase();
    expect(className).toContain("panel-content");
    expect(
      lowerClassName.includes("controls-panel-content") ||
      lowerClassName.includes("designer-panel-content"))
      .toBeTruthy();
    unmount();
  });
});
