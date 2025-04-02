import React from "react";
import { mount } from "enzyme";
import { ToolTip, ToolTipProps } from "../tooltip";

describe("<ToolTip />", () => {
  const fakeProps = (): ToolTipProps => ({
    helpText: "such help",
    docPage: "weed-detection",
    dispatch: jest.fn(),
  });

  const p = fakeProps();
  const wrapper = mount(<ToolTip {...p} />);

  it("renders correct text", () => {
    expect(wrapper.find(".title-help-text").html()).toContain("such help");
  });

  it("has a closed initial state", () => {
    expect(wrapper.find(".title-help-text").hasClass("open")).toBeFalsy();
  });

  it("doesn't show text when closed", () => {
    expect(wrapper.find(".title-help-text").length).toEqual(1);
    expect(wrapper.find(".title-help-text.open").length).toEqual(0);
  });

  it("toggles open state", () => {
    wrapper.find(".fa-question-circle").simulate("click");
    expect(wrapper.find(".title-help-text").hasClass("open")).toBeTruthy();
  });

  it("renders doc link", () => {
    expect(wrapper.text()).toContain("Documentation");
    expect(wrapper.find("i").at(2).html()).toContain("fa-external-link");
    wrapper.find("a").simulate("click");
    expect(mockNavigate).toHaveBeenCalledWith(
      expect.stringContaining("weed-detection"));
  });

  it("stops propagation", () => {
    const e = { stopPropagation: jest.fn() };
    wrapper.find(".title-help").simulate("click", e);
    expect(e.stopPropagation).toHaveBeenCalled();
  });
});
