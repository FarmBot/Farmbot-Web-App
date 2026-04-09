let mockSave = () => Promise.resolve();

import React from "react";
import { render } from "@testing-library/react";
import { RawAddTool as AddTool, mapStateToProps } from "../add_tool";
import { fakeState } from "../../__test_support__/fake_state";
import { SaveBtn } from "../../ui";
import * as crud from "../../api/crud";
import { FirmwareHardware } from "farmbot";
import { AddToolProps } from "../interfaces";
import { mockDispatch } from "../../__test_support__/fake_dispatch";
import { Path } from "../../internal_urls";
import {
  actRenderer,
  createRenderer,
  getRendererInstance,
  unmountRenderer,
} from "../../__test_support__/test_renderer";

beforeEach(() => {
  jest.clearAllMocks();
  mockSave = () => Promise.resolve();
  jest.spyOn(crud, "initSave").mockImplementation(jest.fn());
  jest.spyOn(crud, "init")
    .mockImplementation(jest.fn(() => ({ payload: { uuid: "fake uuid" } } as never)));
  jest.spyOn(crud, "save").mockImplementation(jest.fn(() => mockSave as never));
  jest.spyOn(crud, "destroy").mockImplementation(jest.fn());
});

describe("<AddTool />", () => {
  const createWrapper = (p = fakeProps()) =>
    createRenderer(<AddTool {...p} />);

  const getInstance = (wrapper: ReturnType<typeof createRenderer>) =>
    getRendererInstance<AddTool, AddToolProps>(wrapper, AddTool);

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
    const instance = getInstance(wrapper);
    actRenderer(() => {
      instance.setState({ toolName: "watering nozzle" });
    });
    const labels = wrapper.root.findAllByType("label")
      .map(node => node.children.join("").toLowerCase());
    expect(labels.some(label => label.includes("flow rate"))).toBeTruthy();
    unmountRenderer(wrapper);
  });

  it("renders seeder", () => {
    const wrapper = createWrapper();
    const instance = getInstance(wrapper);
    actRenderer(() => {
      instance.setState({ toolName: "seeder" });
    });
    const labels = wrapper.root.findAllByType("label")
      .map(node => node.children.join("").toLowerCase());
    expect(labels.some(label => label.includes("tip z offset"))).toBeTruthy();
    unmountRenderer(wrapper);
  });

  it("changes flow rate", () => {
    const wrapper = createWrapper();
    const instance = getInstance(wrapper);
    expect(instance.state.flowRate).toEqual(0);
    actRenderer(() => {
      instance.changeFlowRate(1);
    });
    expect(instance.state.flowRate).toEqual(1);
    unmountRenderer(wrapper);
  });

  it("changes tip z offset", () => {
    const wrapper = createWrapper();
    const instance = getInstance(wrapper);
    expect(instance.state.tipZOffset).toEqual(80);
    actRenderer(() => {
      instance.changeTipZOffset(1);
    });
    expect(instance.state.tipZOffset).toEqual(1);
    unmountRenderer(wrapper);
  });

  it("edits tool name", () => {
    const wrapper = createWrapper();
    const instance = getInstance(wrapper);
    expect(instance.state.toolName).toEqual("");
    actRenderer(() => {
      wrapper.root.findAllByType("input")[0]
        ?.props.onChange({ currentTarget: { value: "new name" } });
    });
    expect(instance.state.toolName).toEqual("new name");
    unmountRenderer(wrapper);
  });

  it("disables save until name in entered", () => {
    const wrapper = createWrapper();
    const instance = getInstance(wrapper);
    expect(instance.state.toolName).toEqual("");
    expect(wrapper.root.findAllByType(SaveBtn)[0]?.props.disabled).toBeTruthy();
    actRenderer(() => {
      instance.setState({ toolName: "fake tool name" });
    });
    expect(wrapper.root.findAllByType(SaveBtn)[0]?.props.disabled).toBeFalsy();
    unmountRenderer(wrapper);
  });

  it("shows name collision message", () => {
    const p = fakeProps();
    p.existingToolNames = ["tool"];
    const wrapper = createWrapper(p);
    const instance = getInstance(wrapper);
    actRenderer(() => {
      instance.setState({ toolName: "tool" });
    });
    expect(wrapper.root.findAll(
      node => node.props.className == "name-error")[0]?.children.join(""))
      .toEqual("Already added.");
    expect(wrapper.root.findAllByType(SaveBtn)[0]?.props.disabled).toBeTruthy();
    unmountRenderer(wrapper);
  });

  it("saves", async () => {
    mockSave = () => Promise.resolve();
    const p = fakeProps();
    p.dispatch = mockDispatch();
    const wrapper = createWrapper(p);
    const instance = getInstance(wrapper);
    actRenderer(() => {
      instance.setState({ toolName: "Foo" });
    });
    const navigate = jest.fn();
    instance.navigate = navigate;
    await actRenderer(async () => {
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
    unmountRenderer(wrapper);
  });

  it("removes unsaved tool on exit", async () => {
    mockSave = () => Promise.reject();
    const p = fakeProps();
    p.dispatch = mockDispatch();
    const wrapper = createWrapper(p);
    const instance = getInstance(wrapper);
    actRenderer(() => {
      instance.setState({ toolName: "Foo" });
    });
    const navigate = jest.fn();
    instance.navigate = navigate;
    await actRenderer(async () => {
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
    unmountRenderer(wrapper);
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
    getInstance(wrapper).navigate = navigate;
    actRenderer(() => {
      buttons[buttons.length - 1]?.props.onClick();
    });
    expect(crud.initSave).toHaveBeenCalledTimes(expectedAdds);
    expect(navigate).toHaveBeenCalledWith(Path.tools());
    unmountRenderer(wrapper);
  });

  it("doesn't add stock tools twice", () => {
    const p = fakeProps();
    p.firmwareHardware = "express_k10";
    p.existingToolNames = ["Seed Trough 1"];
    const wrapper = createWrapper(p);
    const buttons = wrapper.root.findAllByType("button");
    const navigate = jest.fn();
    getInstance(wrapper).navigate = navigate;
    actRenderer(() => {
      buttons[buttons.length - 1]?.props.onClick();
    });
    expect(crud.initSave).toHaveBeenCalledTimes(2);
    expect(navigate).toHaveBeenCalledWith(Path.tools());
    unmountRenderer(wrapper);
  });

  it("copies a tool name", () => {
    const p = fakeProps();
    p.firmwareHardware = "express_k10";
    const wrapper = createWrapper(p);
    const instance = getInstance(wrapper);
    const ps = wrapper.root.findAllByType("p");
    actRenderer(() => {
      ps[ps.length - 1]?.props.onClick();
    });
    expect(instance.state.toolName).toEqual("Seed Trough 2");
    unmountRenderer(wrapper);
  });

  it("deselects a tool", () => {
    const p = fakeProps();
    p.firmwareHardware = "express_k10";
    const wrapper = createWrapper(p);
    const instance = getInstance(wrapper);
    expect(instance.state.toAdd).toEqual([
      "Watering Nozzle", "Seed Trough 1", "Seed Trough 2",
    ]);
    const inputs = wrapper.root.findAllByType("input");
    actRenderer(() => {
      inputs[inputs.length - 1]?.props.onChange();
    });
    expect(instance.state.toAdd).toEqual(["Watering Nozzle", "Seed Trough 1"]);
    unmountRenderer(wrapper);
  });

  it("selects a tool", () => {
    const p = fakeProps();
    p.firmwareHardware = "express_k10";
    const wrapper = createWrapper(p);
    const instance = getInstance(wrapper);
    actRenderer(() => {
      instance.setState({ toAdd: [] });
    });
    const inputs = wrapper.root.findAllByType("input");
    actRenderer(() => {
      inputs[inputs.length - 1]?.props.onChange();
    });
    expect(instance.state.toAdd).toEqual(["Seed Trough 2"]);
    unmountRenderer(wrapper);
  });

  it("disables when all already added", () => {
    const p = fakeProps();
    p.firmwareHardware = "express_k10";
    p.existingToolNames = ["Seed Trough 1", "Seed Trough 2", "Watering Nozzle"];
    const wrapper = createWrapper(p);
    const buttons = wrapper.root.findAllByType("button");
    expect(buttons[buttons.length - 1]?.props.className)
      .toContain("pseudo-disabled");
    unmountRenderer(wrapper);
  });

  it("hides when none firmware is selected", () => {
    const p = fakeProps();
    p.firmwareHardware = "none";
    const wrapper = createWrapper(p);
    const addStockTools = wrapper.root.findAll(
      node => node.props.className == "add-stock-tools")[0];
    expect(addStockTools?.props.hidden).toBeTruthy();
    unmountRenderer(wrapper);
  });
});

describe("mapStateToProps()", () => {
  it("returns props", () => {
    const props = mapStateToProps(fakeState());
    expect(props.dispatch).toEqual(expect.any(Function));
  });
});
