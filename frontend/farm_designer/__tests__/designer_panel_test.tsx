import React from "react";
import { mount } from "enzyme";
import { DesignerPanel, DesignerPanelHeader } from "../designer_panel";
import { act } from "react-dom/test-utils";

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

  it("goes back", () => {
    const wrapper = mount(<DesignerPanelHeader panelName={"test-panel"} />);
    history.back = jest.fn();
    wrapper.find("i").first().simulate("click");
    expect(history.back).toHaveBeenCalled();
  });
});
