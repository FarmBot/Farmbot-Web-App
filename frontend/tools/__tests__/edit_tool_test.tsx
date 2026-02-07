import React from "react";
import { cleanup, render, screen, fireEvent } from "@testing-library/react";
import { mount, shallow } from "enzyme";
import {
  RawEditTool as EditTool, mapStateToProps, isActive, WaterFlowRateInput,
  WaterFlowRateInputProps, LUA_WATER_FLOW_RATE,
  TipZOffsetInput,
  TipZOffsetInputProps,
} from "../edit_tool";
import {
  fakeTool, fakeToolSlot,
} from "../../__test_support__/fake_state/resources";
import { fakeState } from "../../__test_support__/fake_state";
import {
  buildResourceIndex, fakeDevice,
} from "../../__test_support__/resource_index_builder";
import * as crud from "../../api/crud";
import { EditToolProps } from "../interfaces";
import * as deviceActions from "../../devices/actions";
import { Path } from "../../internal_urls";
import { mountWithContext } from "../../__test_support__/mount_with_context";

let editSpy: jest.SpyInstance;
let destroySpy: jest.SpyInstance;
let saveSpy: jest.SpyInstance;

describe("<EditTool />", () => {
  afterEach(cleanup);

  beforeEach(() => {
    location.pathname = Path.mock(Path.tools(1));
    editSpy = jest.spyOn(crud, "edit").mockImplementation(jest.fn());
    destroySpy = jest.spyOn(crud, "destroy").mockImplementation(jest.fn());
    saveSpy = jest.spyOn(crud, "save").mockImplementation(jest.fn());
  });

  afterEach(() => {
    editSpy.mockRestore();
    destroySpy.mockRestore();
    saveSpy.mockRestore();
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

  it("renders seeder", () => {
    const wrapper = mount(<EditTool {...fakeProps()} />);
    wrapper.setState({ toolName: "seeder" });
    expect(wrapper.text().toLowerCase()).toContain("tip z offset");
  });

  it("changes flow rate", () => {
    const wrapper = shallow<EditTool>(<EditTool {...fakeProps()} />);
    expect(wrapper.state().flowRate).toEqual(0);
    wrapper.instance().changeFlowRate(1);
    expect(wrapper.state().flowRate).toEqual(1);
  });

  it("changes tip z offset", () => {
    const wrapper = shallow<EditTool>(<EditTool {...fakeProps()} />);
    expect(wrapper.state().tipZOffset).toEqual(80);
    wrapper.instance().changeTipZOffset(1);
    expect(wrapper.state().tipZOffset).toEqual(1);
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
    location.pathname = Path.mock(Path.tools()) + "/";
    const p = fakeProps();
    p.findTool = jest.fn(() => undefined);
    const wrapper = mount<EditTool>(<EditTool {...p} />);
    expect(wrapper.instance().stringyID).toEqual("");
    expect(wrapper.text()).toContain("Redirecting...");
    expect(mockNavigate).toHaveBeenCalledWith(Path.tools());
  });

  it("doesn't redirect", () => {
    location.pathname = Path.mock(Path.logs());
    const p = fakeProps();
    p.findTool = jest.fn(() => undefined);
    const wrapper = mountWithContext(<EditTool {...p} />);
    expect(wrapper.text()).toContain("Redirecting...");
    expect(mockNavigate).not.toHaveBeenCalled();
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
    const wrapper = mountWithContext(<EditTool {...p} />);
    wrapper.find(".save-btn").simulate("click");
    expect(crud.edit).toHaveBeenCalledWith(expect.any(Object), {
      name: "Foo",
      flow_rate_ml_per_s: 0,
      seeder_tip_z_offset: 80,
    });
    expect(crud.save).toHaveBeenCalledWith(tool.uuid);
    expect(mockNavigate).toHaveBeenCalledWith(Path.tools());
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
    expect(crud.destroy).toHaveBeenCalledWith(tool.uuid);
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
    expect(crud.destroy).not.toHaveBeenCalledWith(tool.uuid);
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
    expect(crud.destroy).not.toHaveBeenCalledWith(tool.uuid);
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
  afterEach(cleanup);
  let sendRPCSpy: jest.SpyInstance;

  beforeEach(() => {
    sendRPCSpy = jest.spyOn(deviceActions, "sendRPC")
      .mockImplementation(jest.fn());
  });

  afterEach(() => sendRPCSpy.mockRestore());

  const fakeProps = (): WaterFlowRateInputProps => ({
    value: 1,
    onChange: jest.fn(),
  });

  it("sends RPC", () => {
    render(<WaterFlowRateInput {...fakeProps()} />);
    const button = screen.getByRole("button");
    fireEvent.click(button);
    expect(deviceActions.sendRPC).toHaveBeenCalledWith({
      kind: "lua", args: { lua: LUA_WATER_FLOW_RATE }
    });
  });

  it("changes value", () => {
    const p = fakeProps();
    const wrapper = shallow(<WaterFlowRateInput {...p} />);
    wrapper.find("input")
      .simulate("change", { currentTarget: { value: "12" } });
    expect(p.onChange).toHaveBeenCalledWith(12);
  });
});

describe("<TipZOffsetInput />", () => {
  afterEach(cleanup);

  const fakeProps = (): TipZOffsetInputProps => ({
    value: 1,
    onChange: jest.fn(),
  });

  it("changes value", () => {
    const p = fakeProps();
    const wrapper = shallow(<TipZOffsetInput {...p} />);
    wrapper.find("input")
      .simulate("change", { currentTarget: { value: "12" } });
    expect(p.onChange).toHaveBeenCalledWith(12);
  });
});
