import React, { act } from "react";
import { mount } from "enzyme";
import {
  DesignerPanel, DesignerPanelContent, DesignerPanelContentProps,
  DesignerPanelHeader, DesignerPanelTop, DesignerPanelTopProps,
} from "../designer_panel";
import { SpecialStatus } from "farmbot";
import { Panel } from "../panel_header";

describe("<DesignerPanel />", () => {
  it("renders default panel", () => {
    const wrapper = mount(<DesignerPanel panelName={"test-panel"} />);
    expect(wrapper.find("div").first().hasClass("gray-panel")).toBeTruthy();
  });

  it("removes beacon", () => {
    jest.useFakeTimers();
    location.search = "?tour=gettingStarted&tourStep=plants";
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

describe("<DesignerPanelTop />", () => {
  const fakeProps = (): DesignerPanelTopProps => ({
    panel: Panel.Controls,
  });

  it("doesn't have with-button class", () => {
    const wrapper = mount(<DesignerPanelTop {...fakeProps()} />);
    expect(wrapper.find("div").first().hasClass("with-button")).toBeFalsy();
  });

  it("has with-button class", () => {
    const p = fakeProps();
    p.onClick = jest.fn();
    const wrapper = mount(<DesignerPanelTop {...p} />);
    expect(wrapper.find("div").first().hasClass("with-button")).toBeTruthy();
  });
});

describe("<DesignerPanelContent />", () => {
  const fakeProps = (): DesignerPanelContentProps => ({
    panelName: Panel.Controls,
  });

  it("doesn't show content scroll indicator", () => {
    Object.defineProperty(document, "getElementsByClassName", {
      value: () => [{ scrollTop: 0 }],
      configurable: true
    });
    const wrapper = mount(<DesignerPanelContent {...fakeProps()} />);
    expect(wrapper.find("div").first().hasClass("scrolled")).toBeFalsy();
  });

  it("shows content scroll indicator", () => {
    Object.defineProperty(document, "getElementsByClassName", {
      value: () => [{ scrollTop: 100 }],
      configurable: true
    });
    const wrapper = mount(<DesignerPanelContent {...fakeProps()} />);
    expect(wrapper.find("div").first().hasClass("scrolled")).toBeTruthy();

  });
});
