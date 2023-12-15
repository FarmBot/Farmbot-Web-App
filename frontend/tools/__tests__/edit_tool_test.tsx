jest.mock("../../api/crud", () => ({
  edit: jest.fn(),
  save: jest.fn(),
  destroy: jest.fn(),
}));

import { Path } from "../../internal_urls";
let mockPath = Path.mock(Path.tools(1));
jest.mock("../../history", () => ({
  push: jest.fn(),
  getPathArray: () => mockPath.split("/"),
}));

jest.mock("../../devices/actions", () => ({ sendRPC: jest.fn() }));

import React from "react";
import { mount, shallow } from "enzyme";
import {
  RawEditTool as EditTool, mapStateToProps, isActive, WaterFlowRateInput,
  WaterFlowRateInputProps, LUA_WATER_FLOW_RATE,
} from "../edit_tool";
import {
  fakeTool, fakeToolSlot,
} from "../../__test_support__/fake_state/resources";
import { fakeState } from "../../__test_support__/fake_state";
import {
  buildResourceIndex, fakeDevice,
} from "../../__test_support__/resource_index_builder";
import { push } from "../../history";
import { edit, destroy, save } from "../../api/crud";
import { EditToolProps } from "../interfaces";
import { sendRPC } from "../../devices/actions";

describe("<EditTool />", () => {
  beforeEach(() => {
    mockPath = Path.mock(Path.tools(1));
  });

  const fakeProps = (): EditToolProps => ({
    findTool: jest.fn(() => fakeTool()),
    dispatch: jest.fn(),
    mountedToolId: undefined,
    isActive: jest.fn(),
    existingToolNames: [],
    saveFarmwareEnv: jest.fn(),
    env: {},
  });

  it("renders", () => {
    const wrapper = mount(<EditTool {...fakeProps()} />);
    expect(wrapper.text()).toContain("Edit tool");
    expect(wrapper.text().toLowerCase()).not.toContain("flow rate");
  });

  it("renders watering nozzle", () => {
    const wrapper = mount(<EditTool {...fakeProps()} />);
    wrapper.setState({ toolName: "watering nozzle" });
    expect(wrapper.text().toLowerCase()).toContain("flow rate");
  });

  it("changes flow rate", () => {
    const wrapper = shallow<EditTool>(<EditTool {...fakeProps()} />);
    expect(wrapper.state().flowRate).toEqual(0);
    wrapper.instance().changeFlowRate(1);
    expect(wrapper.state().flowRate).toEqual(1);
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
    mockPath = Path.mock(Path.tools()) + "/";
    const p = fakeProps();
    p.findTool = jest.fn(() => undefined);
    const wrapper = mount<EditTool>(<EditTool {...p} />);
    expect(wrapper.instance().stringyID).toEqual("");
    expect(wrapper.text()).toContain("Redirecting...");
    expect(push).toHaveBeenCalledWith(Path.tools());
  });

  it("doesn't redirect", () => {
    mockPath = Path.mock(Path.logs());
    const p = fakeProps();
    p.findTool = jest.fn(() => undefined);
    const wrapper = mount(<EditTool {...p} />);
    expect(wrapper.text()).toContain("Redirecting...");
    expect(push).not.toHaveBeenCalled();
  });

  it("edits tool name", () => {
    const wrapper = shallow<EditTool>(<EditTool {...fakeProps()} />);
    wrapper.find("input").simulate("change",
      { currentTarget: { value: "new name" } });
    expect(wrapper.state().toolName).toEqual("new name");
  });

  it("disables save until name in entered", () => {
    const wrapper = mount<EditTool>(<EditTool {...fakeProps()} />);
    wrapper.setState({ toolName: "" });
    expect(wrapper.find(".save-btn").first().props().disabled).toBeTruthy();
    wrapper.setState({ toolName: "fake tool name" });
    expect(wrapper.find(".save-btn").first().props().disabled).toBeFalsy();
  });

  it("shows name collision message", () => {
    const p = fakeProps();
    p.existingToolNames = ["tool"];
    const wrapper = mount<EditTool>(<EditTool {...p} />);
    wrapper.setState({ toolName: "tool" });
    expect(wrapper.find("p").last().text()).toEqual("Name already taken.");
    expect(wrapper.find(".save-btn").first().props().disabled).toBeTruthy();
  });

  it("saves", () => {
    const p = fakeProps();
    const tool = fakeTool();
    p.findTool = () => tool;
    const wrapper = mount(<EditTool {...p} />);
    wrapper.find(".save-btn").simulate("click");
    expect(edit).toHaveBeenCalledWith(expect.any(Object), {
      name: "Foo", flow_rate_ml_per_s: 0,
    });
    expect(save).toHaveBeenCalledWith(tool.uuid);
    expect(push).toHaveBeenCalledWith(Path.tools());
  });

  it("removes tool", () => {
    const p = fakeProps();
    const tool = fakeTool();
    tool.body.id = 1;
    p.findTool = () => tool;
    p.isActive = () => false;
    p.mountedToolId = undefined;
    const wrapper = mount(<EditTool {...p} />);
    wrapper.find(".fa-trash").first().simulate("click");
    expect(destroy).toHaveBeenCalledWith(tool.uuid);
  });

  it("doesn't remove tool: active", () => {
    const p = fakeProps();
    const tool = fakeTool();
    tool.body.id = 1;
    p.findTool = () => tool;
    p.isActive = () => true;
    p.mountedToolId = undefined;
    const wrapper = mount(<EditTool {...p} />);
    wrapper.find(".fa-trash").first().simulate("click");
    expect(destroy).not.toHaveBeenCalledWith(tool.uuid);
  });

  it("doesn't remove tool: mounted", () => {
    const p = fakeProps();
    const tool = fakeTool();
    tool.body.id = 1;
    p.findTool = () => tool;
    p.isActive = () => false;
    p.mountedToolId = tool.body.id;
    const wrapper = mount(<EditTool {...p} />);
    wrapper.find(".fa-trash").first().simulate("click");
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

describe("<WaterFlowRateInput />", () => {
  const fakeProps = (): WaterFlowRateInputProps => ({
    value: 1,
    onChange: jest.fn(),
  });

  it("sends RPC", () => {
    const wrapper = mount(<WaterFlowRateInput {...fakeProps()} />);
    wrapper.find("button").first().simulate("click");
    expect(sendRPC).toHaveBeenCalledWith({
      kind: "lua", args: { lua: LUA_WATER_FLOW_RATE }
    });
  });

  it("changes value", () => {
    const p = fakeProps();
    const wrapper = mount(<WaterFlowRateInput {...p} />);
    wrapper.find("input").first().simulate("change",
      { currentTarget: { value: "1" } });
    expect(p.onChange).toHaveBeenCalledWith(1);
  });
});
