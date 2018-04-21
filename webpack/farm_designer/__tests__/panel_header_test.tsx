let mockPath = "/app/designer/plants";
jest.mock("../../history", () => ({
  getPathArray: jest.fn(() => { return mockPath.split("/"); }),
}));

import * as React from "react";
import { DesignerNavTabs } from "../panel_header";
import { shallow } from "enzyme";

describe("<DesignerNavTabs />", () => {
  it("renders for map", () => {
    mockPath = "/app/designer";
    const wrapper = shallow(<DesignerNavTabs />);
    expect(wrapper.hasClass("gray-panel")).toBeTruthy();
    expect(wrapper.find("Link").at(0).hasClass("active")).toBeTruthy();
  });

  it("renders for plants", () => {
    mockPath = "/app/designer/plants";
    const wrapper = shallow(<DesignerNavTabs />);
    expect(wrapper.hasClass("green-panel")).toBeTruthy();
    expect(wrapper.find("Link").at(1).hasClass("active")).toBeTruthy();
  });

  it("renders for farm events", () => {
    mockPath = "/app/designer/farm_events";
    const wrapper = shallow(<DesignerNavTabs />);
    expect(wrapper.hasClass("magenta-panel")).toBeTruthy();
    expect(wrapper.find("Link").at(2).hasClass("active")).toBeTruthy();
  });
});
