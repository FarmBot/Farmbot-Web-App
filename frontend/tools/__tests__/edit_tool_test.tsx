import React from "react";
import { cleanup, fireEvent, render, within } from "@testing-library/react";
import TestRenderer from "react-test-renderer";
import {
  RawEditTool as EditTool, mapStateToProps, isActive, WaterFlowRateInput,
  WaterFlowRateInputProps, LUA_WATER_FLOW_RATE,
  TipZOffsetInput,
  TipZOffsetInputProps,
} from "../edit_tool";
import { SaveBtn } from "../../ui";
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
    const { container } = render(<EditTool {...fakeProps()} />);
    expect(container.textContent).toContain("Edit tool");
    expect(container.textContent?.toLowerCase()).not.toContain("flow rate");
  });

  it("renders watering nozzle", () => {
    const wrapper = TestRenderer.create(<EditTool {...fakeProps()} />);
    const instance = wrapper.getInstance() as EditTool;
    instance.setState({ toolName: "watering nozzle" });
    const labels = wrapper.root.findAllByType("label")
      .map(node => node.children.join("").toLowerCase());
    expect(labels.some(label => label.includes("flow rate"))).toBeTruthy();
    wrapper.unmount();
  });

  it("renders seeder", () => {
    const wrapper = TestRenderer.create(<EditTool {...fakeProps()} />);
    const instance = wrapper.getInstance() as EditTool;
    instance.setState({ toolName: "seeder" });
    const labels = wrapper.root.findAllByType("label")
      .map(node => node.children.join("").toLowerCase());
    expect(labels.some(label => label.includes("tip z offset"))).toBeTruthy();
    wrapper.unmount();
  });

  it("changes flow rate", () => {
    const wrapper = TestRenderer.create(<EditTool {...fakeProps()} />);
    const instance = wrapper.getInstance() as EditTool;
    expect(instance.state.flowRate).toEqual(0);
    instance.changeFlowRate(1);
    expect(instance.state.flowRate).toEqual(1);
    wrapper.unmount();
  });

  it("changes tip z offset", () => {
    const wrapper = TestRenderer.create(<EditTool {...fakeProps()} />);
    const instance = wrapper.getInstance() as EditTool;
    expect(instance.state.tipZOffset).toEqual(80);
    instance.changeTipZOffset(1);
    expect(instance.state.tipZOffset).toEqual(1);
    wrapper.unmount();
  });

  it("handles missing tool name", () => {
    const p = fakeProps();
    const tool = fakeTool();
    tool.body.name = undefined;
    p.findTool = () => tool;
    const wrapper = TestRenderer.create(<EditTool {...p} />);
    expect((wrapper.getInstance() as EditTool).state.toolName).toEqual("");
    wrapper.unmount();
  });

  it("redirects", () => {
    location.pathname = Path.mock(Path.tools()) + "/";
    const p = fakeProps();
    p.findTool = jest.fn(() => undefined);
    const { container } = render(<EditTool {...p} />);
    expect(container.textContent).toContain("Redirecting");
    expect(mockNavigate).toHaveBeenCalledWith(Path.tools());
  });

  it("doesn't redirect", () => {
    location.pathname = Path.mock(Path.logs());
    const p = fakeProps();
    p.findTool = jest.fn(() => undefined);
    const { container } = mountWithContext(<EditTool {...p} />);
    expect(container.textContent).toContain("Redirecting...");
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it("edits tool name", () => {
    const wrapper = TestRenderer.create(<EditTool {...fakeProps()} />);
    const instance = wrapper.getInstance() as EditTool;
    wrapper.root.findAllByType("input")[0]
      ?.props.onChange({ currentTarget: { value: "new name" } });
    expect(instance.state.toolName).toEqual("new name");
    wrapper.unmount();
  });

  it("disables save until name in entered", () => {
    const wrapper = TestRenderer.create(<EditTool {...fakeProps()} />);
    const instance = wrapper.getInstance() as EditTool;
    instance.setState({ toolName: "" });
    expect(wrapper.root.findAllByType(SaveBtn)[0]?.props.disabled).toBeTruthy();
    instance.setState({ toolName: "fake tool name" });
    expect(wrapper.root.findAllByType(SaveBtn)[0]?.props.disabled).toBeFalsy();
    wrapper.unmount();
  });

  it("shows name collision message", () => {
    const p = fakeProps();
    p.existingToolNames = ["tool"];
    const wrapper = TestRenderer.create(<EditTool {...p} />);
    const instance = wrapper.getInstance() as EditTool;
    instance.setState({ toolName: "tool" });
    expect(wrapper.root.findAll(
      node => node.props.className == "name-error")[0]?.children.join(""))
      .toEqual("Name already taken.");
    expect(wrapper.root.findAllByType(SaveBtn)[0]?.props.disabled).toBeTruthy();
    wrapper.unmount();
  });

  it("saves", () => {
    const p = fakeProps();
    const tool = fakeTool();
    p.findTool = () => tool;
    const { container } = mountWithContext(<EditTool {...p} />);
    fireEvent.click(container.querySelector(".save-btn") as Element);
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
    const { container } = render(<EditTool {...p} />);
    fireEvent.click(container.querySelector(".fa-trash") as Element);
    expect(crud.destroy).toHaveBeenCalledWith(tool.uuid);
  });

  it("doesn't remove tool: active", () => {
    const p = fakeProps();
    const tool = fakeTool();
    tool.body.id = 1;
    p.findTool = () => tool;
    p.isActive = () => true;
    p.mountedToolId = undefined;
    const { container } = render(<EditTool {...p} />);
    fireEvent.click(container.querySelector(".fa-trash") as Element);
    expect(crud.destroy).not.toHaveBeenCalledWith(tool.uuid);
  });

  it("doesn't remove tool: mounted", () => {
    const p = fakeProps();
    const tool = fakeTool();
    tool.body.id = 1;
    p.findTool = () => tool;
    p.isActive = () => false;
    p.mountedToolId = tool.body.id;
    const { container } = render(<EditTool {...p} />);
    fireEvent.click(container.querySelector(".fa-trash") as Element);
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
    const { container } = render(<WaterFlowRateInput {...fakeProps()} />);
    const button = within(container).getByRole("button");
    fireEvent.click(button);
    expect(deviceActions.sendRPC).toHaveBeenCalledWith({
      kind: "lua", args: { lua: LUA_WATER_FLOW_RATE }
    });
  });

  it("changes value", () => {
    const p = fakeProps();
    const { container } = render(<WaterFlowRateInput {...p} />);
    fireEvent.change(container.querySelector("input") as Element,
      { target: { value: "12" } });
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
    const { container } = render(<TipZOffsetInput {...p} />);
    fireEvent.change(container.querySelector("input") as Element,
      { target: { value: "12" } });
    expect(p.onChange).toHaveBeenCalledWith(12);
  });
});
