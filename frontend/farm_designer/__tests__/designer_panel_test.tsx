import React from "react";
import { mount } from "enzyme";
import { DesignerPanel, DesignerPanelHeader } from "../designer_panel";
import { act } from "react-dom/test-utils";
import { SpecialStatus } from "farmbot";

describe("<DesignerPanel />", () => {
  it("renders default panel", () => {
    const wrapper = mount(<DesignerPanel panelName={"test-panel"} />);
    expect(wrapper.find("div").first().hasClass("gray-panel")).toBeTruthy();
  });

  it("removes beacon", () => {
    jest.useFakeTimers();
    location.search = "?tour=gettingStarted?tourStep=plants";
    const wrapper = mount(<DesignerPanel panelName={"plants"} />);
    expect(wrapper.find("div").first().hasClass("beacon")).toBeTruthy();
    act(() => { jest.runAllTimers(); });
    wrapper.update();
    expect(wrapper.find("div").first().hasClass("beacon")).toBeFalsy();
  });
});

describe("<DesignerPanelHeader />", () => {
  it("renders default panel header", () => {
    const wrapper = mount(<DesignerPanelHeader panelName={"test-panel"} />);
    expect(wrapper.find("div").first().hasClass("gray-panel")).toBeTruthy();
  });

  it("renders saving indicator", () => {
    const wrapper = mount(<DesignerPanelHeader panelName={"test-panel"}
      specialStatus={SpecialStatus.DIRTY} />);
    expect(wrapper.text().toLowerCase()).toContain("saving");
  });

  it("goes back", () => {
    const wrapper = mount(<DesignerPanelHeader panelName={"test-panel"} />);
    history.back = jest.fn();
    wrapper.find("i").first().simulate("click");
    expect(history.back).toHaveBeenCalled();
  });
});
