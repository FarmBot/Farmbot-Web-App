import * as React from "react";
import { ToolForm } from "../tool_form";
import { mount } from "enzyme";
import { fakeTool } from "../../../__test_support__/fake_state/resources";
import { ToolFormProps } from "../../interfaces";
import { clickButton } from "../../../__test_support__/helpers";

describe("<ToolForm/>", () => {
  function fakeProps(): ToolFormProps {
    return {
      dispatch: jest.fn(),
      toggle: jest.fn(),
      tools: [fakeTool(), fakeTool()],
      isActive: jest.fn(),
    };
  }

  it("renders", () => {
    const p = fakeProps();
    const wrapper = mount<{}>(<ToolForm {...p} />);
    expect(wrapper.find("input").length).toEqual(p.tools.length);
  });

  it("adds stock tools", () => {
    const p = fakeProps();
    const wrapper = mount<{}>(<ToolForm {...p} />);
    clickButton(wrapper, 3, "stock tools");
    expect(p.dispatch).toHaveBeenCalledTimes(6);
  });

  it("has red delete button", () => {
    const p = fakeProps();
    p.isActive = () => false;
    const wrapper = mount<{}>(<ToolForm {...p} />);
    const delBtn = wrapper.find("button").last();
    expect(delBtn.hasClass("red")).toBeTruthy();
  });

  it("has gray delete button", () => {
    const p = fakeProps();
    p.isActive = () => true;
    const wrapper = mount<{}>(<ToolForm {...p} />);
    const delBtn = wrapper.find("button").last();
    expect(delBtn.hasClass("pseudo-disabled")).toBeTruthy();
    expect(delBtn.props().title).toContain("in slot");
  });
});
