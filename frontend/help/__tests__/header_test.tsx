import React from "react";
import { mount } from "enzyme";
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
      .mockImplementation(jest.fn(() => jest.fn()));
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
    const wrapper = mount(<HelpHeader />);
    expect(wrapper.text().toLowerCase()).toContain(title);
  });

  it("hides hotkeys menu item", () => {
    setWindowWidth(400);
    const wrapper = mount(<HelpHeader />);
    wrapper.find(".help-panel-header").simulate("click");
    expect(wrapper.text().toLowerCase()).not.toContain("hotkeys");
  });

  it("opens menu", () => {
    const wrapper = mount(<HelpHeader />);
    expect(wrapper.html()).toContain("fa-chevron-down");
    wrapper.find(".help-panel-header").simulate("click");
    expect(wrapper.html()).toContain("fa-chevron-up");
    expect(wrapper.text().toLowerCase()).toContain("hotkeys");
  });

  it("selects panel", () => {
    const wrapper = mount(<HelpHeader />);
    wrapper.find(".help-panel-header").simulate("click");
    const supportLink = wrapper.find("a")
      .filterWhere(node =>
        String(node.prop("title")).toLowerCase().includes("get help"))
      .first();
    expect(supportLink.exists()).toBeTruthy();
    supportLink.simulate("click");
    expect(mockNavigate).toHaveBeenCalledWith(Path.support());
  });

  it("opens hotkeys", () => {
    const wrapper = mount(<HelpHeader />);
    wrapper.find(".help-panel-header").simulate("click");
    wrapper.find("a").last().simulate("click");
    expect(mockNavigate).not.toHaveBeenCalled();
    expect(toggleHotkeyHelpOverlaySpy).toHaveBeenCalled();
  });
});
