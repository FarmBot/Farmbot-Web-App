import * as React from "react";
import { mount } from "enzyme";
import { DesignerPanel, DesignerPanelHeader } from "../designer_panel";

describe("<DesignerPanel />", () => {
  it("renders default panel", () => {
    const wrapper = mount(<DesignerPanel panelName={"test-panel"} />);
    expect(wrapper.find("div").hasClass("gray-panel")).toBeTruthy();
  });
});

describe("<DesignerPanelHeader />", () => {
  it("renders default panel header", () => {
    const wrapper = mount(<DesignerPanelHeader panelName={"test-panel"} />);
    expect(wrapper.find("div").hasClass("gray-panel")).toBeTruthy();
  });
});
