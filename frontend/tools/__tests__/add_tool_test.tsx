let mockSave = () => Promise.resolve();

import React from "react";
import TestRenderer from "react-test-renderer";
import { render } from "@testing-library/react";
import { RawAddTool as AddTool, mapStateToProps } from "../add_tool";
import { fakeState } from "../../__test_support__/fake_state";
import { SaveBtn } from "../../ui";
import * as crud from "../../api/crud";
import { FirmwareHardware } from "farmbot";
import { AddToolProps } from "../interfaces";
import { mockDispatch } from "../../__test_support__/fake_dispatch";
import { Path } from "../../internal_urls";

beforeEach(() => {
  jest.clearAllMocks();
  mockSave = () => Promise.resolve();
  jest.spyOn(crud, "initSave").mockImplementation(jest.fn());
  jest.spyOn(crud, "init")
    .mockImplementation(jest.fn(() => ({ payload: { uuid: "fake uuid" } } as never)));
  jest.spyOn(crud, "save").mockImplementation(jest.fn(() => mockSave as never));
  jest.spyOn(crud, "destroy").mockImplementation(jest.fn());
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe("<AddTool />", () => {
  const createWrapper = (p = fakeProps()) =>
    TestRenderer.create(<AddTool {...p} />);

  const fakeProps = (): AddToolProps => ({
    dispatch: jest.fn(),
    existingToolNames: [],
    firmwareHardware: undefined,
    saveFarmwareEnv: jest.fn(),
    env: {},
  });

  it("renders", () => {
    const { container } = render(<AddTool {...fakeProps()} />);
    expect(container.textContent).toContain("Add new");
    expect(container.textContent?.toLowerCase()).not.toContain("flow rate");
  });

  it("renders watering nozzle", () => {
    const wrapper = createWrapper();
    const instance = wrapper.getInstance() as AddTool;
    instance.setState({ toolName: "watering nozzle" });
    const labels = wrapper.root.findAllByType("label")
      .map(node => node.children.join("").toLowerCase());
    expect(labels.some(label => label.includes("flow rate"))).toBeTruthy();
    wrapper.unmount();
  });

  it("renders seeder", () => {
    const wrapper = createWrapper();
    const instance = wrapper.getInstance() as AddTool;
    instance.setState({ toolName: "seeder" });
    const labels = wrapper.root.findAllByType("label")
      .map(node => node.children.join("").toLowerCase());
    expect(labels.some(label => label.includes("tip z offset"))).toBeTruthy();
    wrapper.unmount();
  });

  it("changes flow rate", () => {
    const wrapper = createWrapper();
    const instance = wrapper.getInstance() as AddTool;
    expect(instance.state.flowRate).toEqual(0);
    instance.changeFlowRate(1);
    expect(instance.state.flowRate).toEqual(1);
    wrapper.unmount();
  });

  it("changes tip z offset", () => {
    const wrapper = createWrapper();
    const instance = wrapper.getInstance() as AddTool;
    expect(instance.state.tipZOffset).toEqual(80);
    instance.changeTipZOffset(1);
    expect(instance.state.tipZOffset).toEqual(1);
    wrapper.unmount();
  });

  it("edits tool name", () => {
    const wrapper = createWrapper();
    const instance = wrapper.getInstance() as AddTool;
    expect(instance.state.toolName).toEqual("");
    wrapper.root.findAllByType("input")[0]
      ?.props.onChange({ currentTarget: { value: "new name" } });
    expect(instance.state.toolName).toEqual("new name");
    wrapper.unmount();
  });

  it("disables save until name in entered", () => {
    const wrapper = createWrapper();
    const instance = wrapper.getInstance() as AddTool;
    expect(instance.state.toolName).toEqual("");
    expect(wrapper.root.findAllByType(SaveBtn)[0]?.props.disabled).toBeTruthy();
    instance.setState({ toolName: "fake tool name" });
    expect(wrapper.root.findAllByType(SaveBtn)[0]?.props.disabled).toBeFalsy();
    wrapper.unmount();
  });

  it("shows name collision message", () => {
    const p = fakeProps();
    p.existingToolNames = ["tool"];
    const wrapper = createWrapper(p);
    const instance = wrapper.getInstance() as AddTool;
    instance.setState({ toolName: "tool" });
    expect(wrapper.root.findAll(
      node => node.props.className == "name-error")[0]?.children.join(""))
      .toEqual("Already added.");
    expect(wrapper.root.findAllByType(SaveBtn)[0]?.props.disabled).toBeTruthy();
    wrapper.unmount();
  });

  it("saves", async () => {
    mockSave = () => Promise.resolve();
    const p = fakeProps();
    p.dispatch = mockDispatch();
    const wrapper = createWrapper(p);
    const instance = wrapper.getInstance() as AddTool;
    instance.setState({ toolName: "Foo" });
    const navigate = jest.fn();
    instance.navigate = navigate;
    await TestRenderer.act(async () => {
      instance.save();
      await Promise.resolve();
    });
    expect(crud.init).toHaveBeenCalledWith("Tool", {
      name: "Foo",
      flow_rate_ml_per_s: 0,
      seeder_tip_z_offset: 80,
    });
    expect(instance.state.uuid).toEqual(undefined);
    expect(navigate).toHaveBeenCalledWith(Path.tools());
    wrapper.unmount();
  });

  it("removes unsaved tool on exit", async () => {
    mockSave = () => Promise.reject();
    const p = fakeProps();
    p.dispatch = mockDispatch();
    const wrapper = createWrapper(p);
    const instance = wrapper.getInstance() as AddTool;
    instance.setState({ toolName: "Foo" });
    const navigate = jest.fn();
    instance.navigate = navigate;
    await TestRenderer.act(async () => {
      instance.save();
      await Promise.resolve();
    });
    expect(crud.init).toHaveBeenCalledWith("Tool", {
      name: "Foo",
      flow_rate_ml_per_s: 0,
      seeder_tip_z_offset: 80,
    });
    expect(instance.state.uuid).toEqual("fake uuid");
    expect(navigate).not.toHaveBeenCalled();
    wrapper.unmount();
    expect(crud.destroy).toHaveBeenCalledWith("fake uuid");
  });

  it.each<[FirmwareHardware, number]>([
    ["arduino", 6],
    ["farmduino", 6],
    ["farmduino_k14", 6],
    ["farmduino_k15", 8],
    ["farmduino_k16", 9],
    ["farmduino_k17", 9],
    ["farmduino_k18", 9],
    ["express_k10", 3],
    ["express_k11", 3],
    ["express_k12", 3],
  ])("adds peripherals: %s", (firmware, expectedAdds) => {
    const p = fakeProps();
    p.firmwareHardware = firmware;
    const wrapper = createWrapper(p);
    const buttons = wrapper.root.findAllByType("button");
    const navigate = jest.fn();
    (wrapper.getInstance() as AddTool).navigate = navigate;
    buttons[buttons.length - 1]?.props.onClick();
    expect(crud.initSave).toHaveBeenCalledTimes(expectedAdds);
    expect(navigate).toHaveBeenCalledWith(Path.tools());
    wrapper.unmount();
  });

  it("doesn't add stock tools twice", () => {
    const p = fakeProps();
    p.firmwareHardware = "express_k10";
    p.existingToolNames = ["Seed Trough 1"];
    const wrapper = createWrapper(p);
    const buttons = wrapper.root.findAllByType("button");
    const navigate = jest.fn();
    (wrapper.getInstance() as AddTool).navigate = navigate;
    buttons[buttons.length - 1]?.props.onClick();
    expect(crud.initSave).toHaveBeenCalledTimes(2);
    expect(navigate).toHaveBeenCalledWith(Path.tools());
    wrapper.unmount();
  });

  it("copies a tool name", () => {
    const p = fakeProps();
    p.firmwareHardware = "express_k10";
    const wrapper = createWrapper(p);
    const instance = wrapper.getInstance() as AddTool;
    const ps = wrapper.root.findAllByType("p");
    ps[ps.length - 1]?.props.onClick();
    expect(instance.state.toolName).toEqual("Seed Trough 2");
    wrapper.unmount();
  });

  it("deselects a tool", () => {
    const p = fakeProps();
    p.firmwareHardware = "express_k10";
    const wrapper = createWrapper(p);
    const instance = wrapper.getInstance() as AddTool;
    expect(instance.state.toAdd).toEqual([
      "Watering Nozzle", "Seed Trough 1", "Seed Trough 2",
    ]);
    const inputs = wrapper.root.findAllByType("input");
    inputs[inputs.length - 1]?.props.onChange();
    expect(instance.state.toAdd).toEqual(["Watering Nozzle", "Seed Trough 1"]);
    wrapper.unmount();
  });

  it("selects a tool", () => {
    const p = fakeProps();
    p.firmwareHardware = "express_k10";
    const wrapper = createWrapper(p);
    const instance = wrapper.getInstance() as AddTool;
    instance.setState({ toAdd: [] });
    const inputs = wrapper.root.findAllByType("input");
    inputs[inputs.length - 1]?.props.onChange();
    expect(instance.state.toAdd).toEqual(["Seed Trough 2"]);
    wrapper.unmount();
  });

  it("disables when all already added", () => {
    const p = fakeProps();
    p.firmwareHardware = "express_k10";
    p.existingToolNames = ["Seed Trough 1", "Seed Trough 2", "Watering Nozzle"];
    const wrapper = createWrapper(p);
    const buttons = wrapper.root.findAllByType("button");
    expect(buttons[buttons.length - 1]?.props.className)
      .toContain("pseudo-disabled");
    wrapper.unmount();
  });

  it("hides when none firmware is selected", () => {
    const p = fakeProps();
    p.firmwareHardware = "none";
    const wrapper = createWrapper(p);
    const addStockTools = wrapper.root.findAll(
      node => node.props.className == "add-stock-tools")[0];
    expect(addStockTools?.props.hidden).toBeTruthy();
    wrapper.unmount();
  });
});

describe("mapStateToProps()", () => {
  it("returns props", () => {
    const props = mapStateToProps(fakeState());
    expect(props.dispatch).toEqual(expect.any(Function));
  });
});
