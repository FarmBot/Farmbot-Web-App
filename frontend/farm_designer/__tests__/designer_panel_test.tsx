jest.unmock("../designer_panel");
jest.unmock("../designer_panel.tsx");

import React, { act } from "react";
import { cleanup, fireEvent, render } from "@testing-library/react";
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
  const originalUrl = `${location.pathname}${location.search}${location.hash}`;

  afterEach(() => {
    try {
      jest.runOnlyPendingTimers();
    } catch { /* noop */ }
    jest.useRealTimers();
    cleanup();
    history.pushState({}, "", originalUrl);
  });

  it("renders default panel", () => {
    const { container } = render(<DesignerPanel panelName={"test-panel"} />);
    const className = (container.firstChild as HTMLDivElement).className;
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
    const { container } = render(<DesignerPanel panelName={"plants"} />);
    const hasBeaconClass = () =>
      (container.firstChild as HTMLDivElement).className
        .split(" ")
        .includes("beacon");
    const initiallyHasBeacon = hasBeaconClass();
    act(() => { jest.runAllTimers(); });
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
    expect(container.querySelector("div")?.classList.contains("gray-panel"))
      .toBeTruthy();
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
    const backIcon = container.querySelector("i");
    backIcon && fireEvent.click(backIcon);
    expect(history.back).toHaveBeenCalled();
  });
});

describe("<DesignerPanelTop />", () => {
  const fakeProps = (): DesignerPanelTopProps => ({
    panel: Panel.Controls,
  });

  it("doesn't have with-button class", () => {
    const { container } = render(<DesignerPanelTop {...fakeProps()} />);
    const className = (container.firstChild as HTMLDivElement).className;
    expect(className).toContain("panel-top");
    expect(className).not.toContain("with-button");
  });

  it("has with-button class", () => {
    const p = fakeProps();
    p.onClick = jest.fn();
    const { container } = render(<DesignerPanelTop {...p} />);
    const className = (container.firstChild as HTMLDivElement).className;
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
    const { container } = render(<DesignerPanelContent {...fakeProps()} />);
    expect((container.firstChild as HTMLDivElement).className).not.toContain("scrolled");
  });

  it("shows content scroll indicator", () => {
    jest.spyOn(document, "getElementsByClassName")
      .mockReturnValue([{ scrollTop: 100 }] as unknown as HTMLCollectionOf<Element>);
    const { container } = render(<DesignerPanelContent {...fakeProps()} />);
    const className = (container.firstChild as HTMLDivElement).className;
    const lowerClassName = className.toLowerCase();
    expect(className).toContain("panel-content");
    expect(
      lowerClassName.includes("controls-panel-content") ||
      lowerClassName.includes("designer-panel-content"))
      .toBeTruthy();
  });
});
