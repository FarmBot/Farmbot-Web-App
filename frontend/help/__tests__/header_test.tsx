let mockPath = "/app/designer/";
jest.mock("../../history", () => ({
  push: jest.fn(),
  getPathArray: () => mockPath.split("/"),
}));

jest.mock("../../hotkeys", () => ({
  openHotkeyHelpOverlay: jest.fn(),
}));

import React from "react";
import { mount } from "enzyme";
import { HelpHeader } from "../header";
import { push } from "../../history";
import { openHotkeyHelpOverlay } from "../../hotkeys";

describe("<HelpHeader />", () => {
  it.each<[string, string]>([
    ["software documentation", "/app/designer/"],
    ["software documentation", "/app/designer/help"],
    ["developer documentation", "/app/designer/developer"],
    ["take a tour", "/app/designer/tours"],
    ["get help", "/app/designer/support"],
  ])("renders %s panel", (title, path) => {
    mockPath = path;
    const wrapper = mount(<HelpHeader />);
    expect(wrapper.text().toLowerCase()).toContain(title);
  });

  it("opens menu", () => {
    const wrapper = mount(<HelpHeader />);
    expect(wrapper.html()).toContain("fa-chevron-down");
    wrapper.find(".help-panel-header").simulate("click");
    expect(wrapper.html()).toContain("fa-chevron-up");
  });

  it("selects panel", () => {
    const wrapper = mount(<HelpHeader />);
    wrapper.find(".help-panel-header").simulate("click");
    wrapper.find("a").first().simulate("click");
    expect(push).toHaveBeenCalledWith("/app/designer/support");
  });

  it("opens hotkeys", () => {
    const wrapper = mount(<HelpHeader />);
    wrapper.find(".help-panel-header").simulate("click");
    wrapper.find("a").last().simulate("click");
    expect(push).not.toHaveBeenCalled();
    expect(openHotkeyHelpOverlay).toHaveBeenCalled();
  });
});
