jest.mock("../../../api/crud", () => ({
  init: jest.fn(),
  saveAll: jest.fn(),
  destroy: jest.fn(),
  edit: jest.fn(),
}));

import * as React from "react";
import { ToolForm } from "../tool_form";
import { mount, shallow } from "enzyme";
import { fakeTool } from "../../../__test_support__/fake_state/resources";
import { ToolListAndFormProps } from "../../interfaces";
import { clickButton } from "../../../__test_support__/helpers";
import { init, saveAll, destroy, edit } from "../../../api/crud";

describe("<ToolForm/>", () => {
  function fakeProps(): ToolListAndFormProps {
    return {
      dispatch: jest.fn(),
      toggle: jest.fn(),
      tools: [fakeTool(), fakeTool()],
      isActive: jest.fn(),
    };
  }

  it("renders", () => {
    const p = fakeProps();
    const wrapper = mount(<ToolForm {...p} />);
    expect(wrapper.find("input").length).toEqual(p.tools.length);
  });

  it("saves tools", () => {
    const wrapper = mount(<ToolForm {...fakeProps()} />);
    clickButton(wrapper, 1, "saved", { partial_match: true });
    expect(saveAll).toHaveBeenCalledTimes(1);
  });

  it("adds new tool", () => {
    const wrapper = mount(<ToolForm {...fakeProps()} />);
    expect(wrapper.props().tools.length).toEqual(2);
    clickButton(wrapper, 2, "");
    expect(init).toHaveBeenCalledWith("Tool", { name: "Tool 3" });
  });

  it("adds stock tools", () => {
    const wrapper = mount(<ToolForm {...fakeProps()} />);
    clickButton(wrapper, 3, "stock tools");
    expect(init).toHaveBeenCalledTimes(6);
  });

  it("changes tool name", () => {
    const p = fakeProps();
    const wrapper = shallow(<ToolForm {...p} />);
    wrapper.find("BlurableInput").first().simulate("commit", {
      currentTarget: { value: "New Tool Name" }
    });
    expect(edit).toHaveBeenCalledWith(p.tools[0], { name: "New Tool Name" });
  });

  it("has red delete button", () => {
    const p = fakeProps();
    p.isActive = () => false;
    const wrapper = mount(<ToolForm {...p} />);
    const delBtn = wrapper.find("button").last();
    expect(delBtn.hasClass("red")).toBeTruthy();
  });

  it("deletes tool", () => {
    const p = fakeProps();
    p.isActive = () => false;
    const wrapper = mount(<ToolForm {...p} />);
    const delBtn = wrapper.find("button").last();
    delBtn.simulate("click");
    expect(destroy).toHaveBeenCalledWith(p.tools[1].uuid);
  });

  it("has gray delete button", () => {
    const p = fakeProps();
    p.isActive = () => true;
    const wrapper = mount(<ToolForm {...p} />);
    const delBtn = wrapper.find("button").last();
    expect(delBtn.hasClass("pseudo-disabled")).toBeTruthy();
    expect(delBtn.props().title).toContain("in slot");
  });
});
