let mockPath = "/app/designer/plants";
jest.mock("../../history", () => ({
  getPathArray: jest.fn(() => mockPath.split("/")),
}));

let mockDev = false;
jest.mock("../../settings/dev/dev_support", () => ({
  DevSettings: {
    futureFeaturesEnabled: () => mockDev,
  }
}));

import React from "react";
import { DesignerNavTabs, Panel, NavTab, NavTabProps } from "../panel_header";
import { shallow } from "enzyme";

describe("<DesignerNavTabs />", () => {
  it("renders for map", () => {
    mockPath = "/app/designer";
    mockDev = false;
    const wrapper = shallow(<DesignerNavTabs />);
    expect(wrapper.hasClass("gray-panel")).toBeTruthy();
    expect(wrapper.html()).toContain("active");
  });

  it("renders for plants", () => {
    mockPath = "/app/designer/plants";
    mockDev = false;
    const wrapper = shallow(<DesignerNavTabs />);
    expect(wrapper.hasClass("green-panel")).toBeTruthy();
    expect(wrapper.html()).toContain("active");
  });

  it("renders for groups", () => {
    mockPath = "/app/designer/groups";
    mockDev = false;
    const wrapper = shallow(<DesignerNavTabs />);
    expect(wrapper.hasClass("blue-panel")).toBeTruthy();
    expect(wrapper.html()).toContain("active");
  });

  it("renders for saved gardens", () => {
    mockPath = "/app/designer/gardens";
    mockDev = false;
    const wrapper = shallow(<DesignerNavTabs />);
    expect(wrapper.hasClass("navy-panel")).toBeTruthy();
    expect(wrapper.html()).toContain("active");
  });

  it("renders for sequences", () => {
    mockPath = "/app/designer/sequences";
    mockDev = true;
    const wrapper = shallow(<DesignerNavTabs />);
    expect(wrapper.hasClass("gray-panel")).toBeTruthy();
    expect(wrapper.html()).toContain("active");
  });

  it("renders for regimens", () => {
    mockPath = "/app/designer/regimens";
    mockDev = true;
    const wrapper = shallow(<DesignerNavTabs />);
    expect(wrapper.hasClass("gray-panel")).toBeTruthy();
    expect(wrapper.html()).toContain("active");
  });

  it("renders for farm events", () => {
    mockPath = "/app/designer/events";
    mockDev = false;
    const wrapper = shallow(<DesignerNavTabs />);
    expect(wrapper.hasClass("yellow-panel")).toBeTruthy();
    expect(wrapper.html()).toContain("active");
  });

  it("renders for zones", () => {
    mockPath = "/app/designer/zones";
    mockDev = true;
    const wrapper = shallow(<DesignerNavTabs />);
    expect(wrapper.hasClass("brown-panel")).toBeTruthy();
    expect(wrapper.html()).toContain("active");
  });

  it("renders for points", () => {
    mockPath = "/app/designer/points";
    mockDev = false;
    const wrapper = shallow(<DesignerNavTabs />);
    expect(wrapper.hasClass("teal-panel")).toBeTruthy();
    expect(wrapper.html()).toContain("active");
  });

  it("renders for weeds", () => {
    mockPath = "/app/designer/weeds";
    mockDev = false;
    const wrapper = shallow(<DesignerNavTabs />);
    expect(wrapper.hasClass("red-panel")).toBeTruthy();
    expect(wrapper.html()).toContain("active");
  });

  it("renders for controls", () => {
    mockPath = "/app/designer/controls";
    mockDev = true;
    const wrapper = shallow(<DesignerNavTabs />);
    expect(wrapper.hasClass("gray-panel")).toBeTruthy();
    expect(wrapper.html()).toContain("active");
  });

  it("renders for sensors", () => {
    mockPath = "/app/designer/sensors";
    mockDev = true;
    const wrapper = shallow(<DesignerNavTabs />);
    expect(wrapper.hasClass("gray-panel")).toBeTruthy();
    expect(wrapper.html()).toContain("active");
  });

  it("renders for photos", () => {
    mockPath = "/app/designer/photos";
    mockDev = false;
    const wrapper = shallow(<DesignerNavTabs />);
    expect(wrapper.hasClass("gray-panel")).toBeTruthy();
    expect(wrapper.html()).toContain("active");
  });

  it("renders for farmware", () => {
    mockPath = "/app/designer/farmware";
    mockDev = false;
    const wrapper = shallow(<DesignerNavTabs />);
    expect(wrapper.hasClass("gray-panel")).toBeTruthy();
    expect(wrapper.html()).toContain("active");
  });

  it("renders for tools", () => {
    mockPath = "/app/designer/tools";
    mockDev = false;
    const wrapper = shallow(<DesignerNavTabs />);
    expect(wrapper.hasClass("gray-panel")).toBeTruthy();
    expect(wrapper.html()).toContain("active");
  });

  it("renders for messages", () => {
    mockPath = "/app/designer/messages";
    mockDev = true;
    const wrapper = shallow(<DesignerNavTabs />);
    expect(wrapper.hasClass("gray-panel")).toBeTruthy();
    expect(wrapper.html()).toContain("active");
  });

  it("renders for help", () => {
    mockPath = "/app/designer/help";
    mockDev = true;
    const wrapper = shallow(<DesignerNavTabs />);
    expect(wrapper.hasClass("gray-panel")).toBeTruthy();
    expect(wrapper.html()).toContain("active");
  });

  it("renders for settings", () => {
    mockPath = "/app/designer/settings";
    mockDev = false;
    const wrapper = shallow(<DesignerNavTabs />);
    expect(wrapper.hasClass("gray-panel")).toBeTruthy();
    expect(wrapper.html()).toContain("active");
  });

  it("renders scroll indicator", () => {
    Object.defineProperty(document, "getElementsByClassName", {
      value: () => [{}, { scrollWidth: 100, scrollLeft: 0, clientWidth: 75 }],
      configurable: true
    });
    const wrapper = shallow(<DesignerNavTabs />);
    expect(wrapper.html()).toContain("scroll-indicator");
  });

  it("doesn't render scroll indicator when wide", () => {
    Object.defineProperty(document, "getElementsByClassName", {
      value: () => [{}, { scrollWidth: 500, scrollLeft: 0, clientWidth: 75 }],
      configurable: true
    });
    const wrapper = shallow(<DesignerNavTabs />);
    expect(wrapper.html()).not.toContain("scroll-indicator");
  });

  it("doesn't render scroll indicator when at end", () => {
    Object.defineProperty(document, "getElementsByClassName", {
      value: () => [{}, { scrollWidth: 100, scrollLeft: 25, clientWidth: 75 }],
      configurable: true
    });
    const wrapper = shallow(<DesignerNavTabs />);
    expect(wrapper.html()).not.toContain("scroll-indicator");
  });
});

describe("<NavTab />", () => {
  const fakeProps = (): NavTabProps => ({
    panel: Panel.Map,
    desktopHide: true,
  });

  it("renders icon", () => {
    const wrapper = shallow(<NavTab {...fakeProps()} />);
    expect(wrapper.html()).toContain("desktop-hide");
  });
});
