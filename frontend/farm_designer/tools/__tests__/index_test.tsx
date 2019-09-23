jest.mock("react-redux", () => ({ connect: jest.fn(() => (x: {}) => x) }));

jest.mock("../../../history", () => ({
  history: { push: jest.fn() },
  getPathArray: () => "/app/designer/tools".split("/"),
}));

import * as React from "react";
import { mount, shallow } from "enzyme";
import { RawTools as Tools, ToolsProps, mapStateToProps } from "../index";
import {
  fakeTool, fakeToolSlot
} from "../../../__test_support__/fake_state/resources";
import { history } from "../../../history";
import { fakeState } from "../../../__test_support__/fake_state";
import { buildResourceIndex } from "../../../__test_support__/resource_index_builder";

describe("<Tools />", () => {
  const fakeProps = (): ToolsProps => ({
    tools: [],
    toolSlots: [],
    dispatch: jest.fn(),
  });

  it("renders with no tools", () => {
    const wrapper = mount(<Tools {...fakeProps()} />);
    expect(wrapper.text()).toContain("Add a tool");
  });

  it("renders with tools", () => {
    const p = fakeProps();
    p.tools = [fakeTool()];
    p.tools[0].body.id = 1;
    p.tools[0].body.status = "inactive";
    p.toolSlots = [fakeToolSlot()];
    p.toolSlots[0].body.x = 1;
    const wrapper = mount(<Tools {...p} />);
    expect(wrapper.text()).toContain("Foo");
    expect(wrapper.text()).toContain("(1, 0, 0)");
  });

  it("navigates to tool", () => {
    const p = fakeProps();
    p.tools = [fakeTool()];
    p.tools[0].body.id = 1;
    p.tools[0].body.status = "inactive";
    p.toolSlots = [fakeToolSlot()];
    p.toolSlots[0].body.tool_id = 2;
    const wrapper = mount(<Tools {...p} />);
    wrapper.find("p").first().simulate("click");
    expect(history.push).toHaveBeenCalledWith("/app/designer/tools/2");
    wrapper.find("p").last().simulate("click");
    expect(history.push).toHaveBeenCalledWith("/app/designer/tools/1");
  });

  it("changes search term", () => {
    const p = fakeProps();
    p.tools = [fakeTool(), fakeTool()];
    p.tools[0].body.name = "tool 0";
    p.tools[1].body.name = "tool 1";
    const wrapper = shallow<Tools>(<Tools {...p} />);
    wrapper.find("input").first().simulate("change",
      { currentTarget: { value: "0" } });
    expect(wrapper.state().searchTerm).toEqual("0");
  });

  it("filters tools", () => {
    const p = fakeProps();
    p.tools = [fakeTool(), fakeTool()];
    p.tools[0].body.name = "tool 0";
    p.tools[1].body.name = "tool 1";
    const wrapper = mount(<Tools {...p} />);
    wrapper.setState({ searchTerm: "0" });
    expect(wrapper.text()).not.toContain("tool 1");
  });
});

describe("mapStateToProps()", () => {
  it("returns props", () => {
    const state = fakeState();
    const tool = fakeTool();
    state.resources = buildResourceIndex([tool]);
    const props = mapStateToProps(state);
    expect(props.tools).toEqual([tool]);
  });
});
