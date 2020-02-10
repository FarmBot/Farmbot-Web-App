let mockPath = "/app/designer/plants";
jest.mock("../../history", () => ({
  getPathArray: jest.fn(() => mockPath.split("/")),
}));

let mockDev = false;
jest.mock("../../account/dev/dev_support", () => ({
  DevSettings: {
    futureFeaturesEnabled: () => mockDev,
  }
}));

import * as React from "react";
import { DesignerNavTabs } from "../panel_header";
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

  it("renders for farm events", () => {
    mockPath = "/app/designer/events";
    mockDev = false;
    const wrapper = shallow(<DesignerNavTabs />);
    expect(wrapper.hasClass("yellow-panel")).toBeTruthy();
    expect(wrapper.html()).toContain("active");
  });

  it("renders for saved gardens", () => {
    mockPath = "/app/designer/gardens";
    mockDev = false;
    const wrapper = shallow(<DesignerNavTabs />);
    expect(wrapper.hasClass("navy-panel")).toBeTruthy();
    expect(wrapper.html()).toContain("active");
  });

  it("renders for points", () => {
    mockPath = "/app/designer/points";
    mockDev = false;
    const wrapper = shallow(<DesignerNavTabs />);
    expect(wrapper.hasClass("teal-panel")).toBeTruthy();
    expect(wrapper.html()).toContain("active");
  });

  it("renders for groups", () => {
    mockPath = "/app/designer/groups";
    mockDev = false;
    const wrapper = shallow(<DesignerNavTabs />);
    expect(wrapper.hasClass("blue-panel")).toBeTruthy();
    expect(wrapper.html()).toContain("active");
  });

  it("renders for weeds", () => {
    mockPath = "/app/designer/weeds";
    mockDev = false;
    const wrapper = shallow(<DesignerNavTabs />);
    expect(wrapper.hasClass("red-panel")).toBeTruthy();
    expect(wrapper.html()).toContain("active");
  });

  it("renders for zones", () => {
    mockPath = "/app/designer/zones";
    mockDev = true;
    const wrapper = shallow(<DesignerNavTabs />);
    expect(wrapper.hasClass("brown-panel")).toBeTruthy();
    expect(wrapper.html()).toContain("active");
  });

  it("renders for settings", () => {
    mockPath = "/app/designer/settings";
    mockDev = false;
    const wrapper = shallow(<DesignerNavTabs />);
    expect(wrapper.hasClass("gray-panel")).toBeTruthy();
    expect(wrapper.html()).toContain("active");
  });
});
