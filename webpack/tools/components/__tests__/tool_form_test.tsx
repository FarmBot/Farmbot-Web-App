import * as React from "react";
import { ToolForm } from "../tool_form";
import { mount } from "enzyme";
import { fakeTool } from "../../../__test_support__/fake_state/resources";

describe("<ToolForm/>", () => {
  function fakeProps() {
    return {
      dispatch: jest.fn(),
      toggle: jest.fn(),
      tools: [fakeTool(), fakeTool()]
    };
  }

  it("renders", () => {
    const p = fakeProps();
    const wrapper = mount(<ToolForm {...p} />);
    expect(wrapper.find("input").length).toEqual(p.tools.length);
  });

  it("adds stock tools", () => {
    const p = fakeProps();
    const wrapper = mount(<ToolForm {...p} />);
    const add = wrapper.find("button").at(3);
    expect(add.text()).toEqual("Stock Tools");
    add.simulate("click");
    expect(p.dispatch).toHaveBeenCalledTimes(6);
  });

});
