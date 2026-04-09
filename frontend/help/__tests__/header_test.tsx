import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { HelpHeader } from "../header";
import * as hotkeys from "../../hotkeys";
import { Path } from "../../internal_urls";

const setWindowWidth = (width: number) => {
  Object.defineProperty(window, "innerWidth", { configurable: true, value: width });
};

describe("<HelpHeader />", () => {
  let toggleHotkeyHelpOverlaySpy: jest.SpyInstance;

  beforeEach(() => {
    setWindowWidth(1000);
    toggleHotkeyHelpOverlaySpy = jest.spyOn(hotkeys, "toggleHotkeyHelpOverlay")
      .mockImplementation(() => false);
  });

  afterEach(() => {
    toggleHotkeyHelpOverlaySpy.mockRestore();
  });

  it.each<[string, string]>([
    ["software documentation", Path.designer()],
    ["software documentation", Path.help()],
    ["developer documentation", Path.developer()],
    ["genesis documentation", Path.designer("genesis")],
    ["express documentation", Path.designer("express")],
    ["business documentation", Path.designer("business")],
    ["education documentation", Path.designer("education")],
    ["take a tour", Path.tours()],
    ["get help", Path.support()],
  ])("renders %s panel", (title, path) => {
    location.pathname = Path.mock(path);
    const { container } = render(<HelpHeader />);
    expect(container.textContent?.toLowerCase()).toContain(title);
  });

  it("hides hotkeys menu item", () => {
    setWindowWidth(400);
    const { container } = render(<HelpHeader />);
    fireEvent.click(container.querySelector(".help-panel-header") as Element);
    expect(container.textContent?.toLowerCase()).not.toContain("hotkeys");
  });

  it("opens menu", () => {
    const { container } = render(<HelpHeader />);
    expect(container.querySelector(".fa-chevron-down")).toBeTruthy();
    fireEvent.click(container.querySelector(".help-panel-header") as Element);
    expect(container.querySelector(".fa-chevron-up")).toBeTruthy();
    expect(container.textContent?.toLowerCase()).toContain("hotkeys");
  });

  it("selects panel", () => {
    const { container } = render(<HelpHeader />);
    fireEvent.click(container.querySelector(".help-panel-header") as Element);
    const supportLink = screen.getByTitle("Get Help");
    fireEvent.click(supportLink);
    expect(mockNavigate).toHaveBeenCalledWith(Path.support());
  });

  it("opens hotkeys", () => {
    const { container } = render(<HelpHeader />);
    fireEvent.click(container.querySelector(".help-panel-header") as Element);
    fireEvent.click(screen.getByTitle("Hotkeys"));
    expect(mockNavigate).not.toHaveBeenCalled();
    expect(toggleHotkeyHelpOverlaySpy).toHaveBeenCalled();
  });
});
