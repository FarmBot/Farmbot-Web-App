import { ToolTip, ToolTipProps } from "../tooltip";
import { mount } from "enzyme";
import React from "react";

describe("<ToolTip />", () => {
  const fakeProps = (): ToolTipProps => {
    return {
      helpText: "such help",
      docPage: "weed-detection"
    };
  };
  const p = fakeProps();
  const wrapper = mount(<ToolTip {...p} />);

  it("renders correct text", () => {
    expect(wrapper.find(".title-help-text").html()).toContain("such help");
  });

  it("Has a false initial state", () => {
    expect(wrapper.state("isOpen")).toBeFalsy();
  });

  it("Text invisible when closed", () => {
    expect(wrapper.find(".title-help-text").length).toEqual(1);
    expect(wrapper.find(".title-help-text.open").length).toEqual(0);
  });

  it("Toggles state", () => {
    const parent = wrapper.find(".fa-question-circle");
    parent.simulate("click");
    expect(wrapper.state("isOpen")).toBeTruthy();
    expect(wrapper.find(".title-help-text.open").length).toEqual(1);
  });

  it("renders doc link", () => {
    expect(wrapper.text()).toContain("Documentation");
    expect(wrapper.find("i").at(2).html()).toContain("fa-external-link");
    expect(wrapper.find("a").html())
      .toContain("https://software.farm.bot/docs/weed-detection");
  });
});
