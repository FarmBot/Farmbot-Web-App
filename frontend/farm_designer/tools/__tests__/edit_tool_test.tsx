jest.mock("../../../api/crud", () => ({
  edit: jest.fn(),
  save: jest.fn(),
  destroy: jest.fn(),
}));

let mockPath = "/app/designer/tools/1";
jest.mock("../../../history", () => ({
  history: { push: jest.fn() },
  getPathArray: () => mockPath.split("/"),
}));

import * as React from "react";
import { mount, shallow } from "enzyme";
import {
  RawEditTool as EditTool, EditToolProps, mapStateToProps, isActive,
} from "../edit_tool";
import { fakeTool, fakeToolSlot } from "../../../__test_support__/fake_state/resources";
import { fakeState } from "../../../__test_support__/fake_state";
import {
  buildResourceIndex, fakeDevice,
} from "../../../__test_support__/resource_index_builder";
import { SaveBtn } from "../../../ui";
import { history } from "../../../history";
import { edit, destroy } from "../../../api/crud";
import { clickButton } from "../../../__test_support__/helpers";

describe("<EditTool />", () => {
  beforeEach(() => {
    mockPath = "/app/designer/tools/1";
  });

  const fakeProps = (): EditToolProps => ({
    findTool: jest.fn(() => fakeTool()),
    dispatch: jest.fn(),
    mountedToolId: undefined,
    isActive: jest.fn(),
  });

  it("renders", () => {
    const wrapper = mount(<EditTool {...fakeProps()} />);
    expect(wrapper.text()).toContain("Edit tool");
  });

  it("handles missing tool name", () => {
    const p = fakeProps();
    const tool = fakeTool();
    tool.body.name = undefined;
    p.findTool = () => tool;
    const wrapper = mount<EditTool>(<EditTool {...p} />);
    expect(wrapper.state().toolName).toEqual("");
  });

  it("redirects", () => {
    mockPath = "/app/designer/tools/";
    const p = fakeProps();
    p.findTool = jest.fn(() => undefined);
    const wrapper = mount<EditTool>(<EditTool {...p} />);
    expect(wrapper.instance().stringyID).toEqual("");
    expect(wrapper.text()).toContain("Redirecting...");
    expect(history.push).toHaveBeenCalledWith("/app/designer/tools");
  });

  it("edits tool name", () => {
    const wrapper = shallow<EditTool>(<EditTool {...fakeProps()} />);
    wrapper.find("input").simulate("change",
      { currentTarget: { value: "new name" } });
    expect(wrapper.state().toolName).toEqual("new name");
  });

  it("saves", () => {
    const wrapper = shallow(<EditTool {...fakeProps()} />);
    wrapper.find(SaveBtn).simulate("click");
    expect(edit).toHaveBeenCalledWith(expect.any(Object), { name: "Foo" });
    expect(history.push).toHaveBeenCalledWith("/app/designer/tools");
  });

  it("removes tool", () => {
    const p = fakeProps();
    const tool = fakeTool();
    tool.body.id = 1;
    p.findTool = () => tool;
    p.isActive = () => false;
    p.mountedToolId = undefined;
    const wrapper = shallow(<EditTool {...p} />);
    clickButton(wrapper, 0, "delete");
    expect(destroy).toHaveBeenCalledWith(tool.uuid);
  });

  it("doesn't remove tool: active", () => {
    const p = fakeProps();
    const tool = fakeTool();
    tool.body.id = 1;
    p.findTool = () => tool;
    p.isActive = () => true;
    p.mountedToolId = undefined;
    const wrapper = shallow(<EditTool {...p} />);
    clickButton(wrapper, 0, "delete");
    expect(destroy).not.toHaveBeenCalledWith(tool.uuid);
  });

  it("doesn't remove tool: mounted", () => {
    const p = fakeProps();
    const tool = fakeTool();
    tool.body.id = 1;
    p.findTool = () => tool;
    p.isActive = () => false;
    p.mountedToolId = tool.body.id;
    const wrapper = shallow(<EditTool {...p} />);
    clickButton(wrapper, 0, "delete");
    expect(destroy).not.toHaveBeenCalledWith(tool.uuid);
  });
});

describe("mapStateToProps()", () => {
  it("returns props", () => {
    const state = fakeState();
    const tool = fakeTool();
    tool.body.id = 123;
    state.resources = buildResourceIndex([tool, fakeDevice()]);
    const props = mapStateToProps(state);
    expect(props.findTool("" + tool.body.id)).toEqual(tool);
  });
});

describe("isActive()", () => {
  it("returns tool state", () => {
    const toolSlot = fakeToolSlot();
    toolSlot.body.tool_id = 1;
    const active = isActive([toolSlot]);
    expect(active(1)).toEqual(true);
    expect(active(2)).toEqual(false);
    expect(active(undefined)).toEqual(false);
  });
});
