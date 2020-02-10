import * as React from "react";
import { mount } from "enzyme";
import { DesignerPanel, DesignerPanelHeader } from "../designer_panel";

describe("<DesignerPanel />", () => {
  it("renders default panel", () => {
    const wrapper = mount(<DesignerPanel panelName={"test-panel"} />);
    expect(wrapper.find("div").first().hasClass("gray-panel")).toBeTruthy();
  });
});

describe("<DesignerPanelHeader />", () => {
  it("renders default panel header", () => {
    const wrapper = mount(<DesignerPanelHeader panelName={"test-panel"} />);
    expect(wrapper.find("div").first().hasClass("gray-panel")).toBeTruthy();
  });

  it("goes back", () => {
    const wrapper = mount(<DesignerPanelHeader panelName={"test-panel"} />);
    history.back = jest.fn();
    wrapper.find("i").first().simulate("click");
    expect(history.back).toHaveBeenCalled();
  });
});
