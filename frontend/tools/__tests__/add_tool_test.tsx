let mockSave = () => Promise.resolve();

import React from "react";
import { act, fireEvent, render } from "@testing-library/react";
import { RawAddTool as AddTool, mapStateToProps } from "../add_tool";
import { fakeState } from "../../__test_support__/fake_state";
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
import { NavigationContext } from "../../routes_helpers";

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

  const renderTool = (props = fakeProps()) => {
    const navigate = jest.fn();
    const ref = React.createRef<AddTool>();
    const result = render(<NavigationContext.Provider value={navigate}>
      <AddTool {...props} ref={ref} />
    </NavigationContext.Provider>);
    return { ...result, navigate, ref };
  };

  it("renders", () => {
    const { container } = render(<AddTool {...fakeProps()} />);
    expect(container.textContent).toContain("Add new");
    expect(container.textContent).toContain("Type");
    expect(container.textContent).toContain("None");
    expect(container.textContent).toContain("UTM Mountable");
    expect((container.querySelector(
      "input[name='utmMountable']") as HTMLInputElement).checked).toBeTruthy();
    expect(container.textContent).toContain("Effector Offset");
    expect(container.textContent).toContain("X (mm)");
    expect(container.textContent).toContain("Y (mm)");
    expect(container.textContent).toContain("Z (mm)");
    expect(container.textContent?.toLowerCase()).not.toContain("flow rate");
  });

  it("renders watering nozzle", () => {
    const ref = React.createRef<AddTool>();
    const { container } = render(<AddTool {...fakeProps()} ref={ref} />);
    act(() => {
      ref.current?.setState({
        toolName: "arbitrary name",
        toolType: "watering_nozzle",
      });
    });
    expect(container.textContent?.toLowerCase()).toContain("flow rate");
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

  it("changes tool type", () => {
    const wrapper = createWrapper();
    const instance = getInstance(wrapper);
    expect(instance.state.toolType).toEqual("none");
    actRenderer(() => {
      instance.changeToolType("weeder");
    });
    expect(instance.state.toolType).toEqual("weeder");
    unmountRenderer(wrapper);
  });

  it("changes UTM mountable", () => {
    const { container, ref } = renderTool();
    fireEvent.click(container.querySelector(
      "input[name='utmMountable']") as Element);
    expect(ref.current?.state.utmMountable).toBeFalsy();
  });

  it("changes effector offset", () => {
    const wrapper = createWrapper();
    const instance = getInstance(wrapper);
    expect(instance.state.effectorOffset).toEqual({ x: 0, y: 0, z: 0 });
    actRenderer(() => {
      instance.changeEffectorOffset("z", 17.5);
    });
    expect(instance.state.effectorOffset).toEqual({ x: 0, y: 0, z: 17.5 });
    unmountRenderer(wrapper);
  });

  it("edits tool name", () => {
    const { container, ref } = renderTool();
    expect(ref.current?.state.toolName).toEqual("");
    fireEvent.change(
      container.querySelector(
        'input[name="toolName"]:not([type="checkbox"])') as Element,
      { target: { value: "new name" } });
    expect(ref.current?.state.toolName).toEqual("new name");
    expect(ref.current?.state.toolType).toEqual("none");
  });

  it("disables save until name in entered", () => {
    const { container, ref } = renderTool();
    expect(ref.current?.state.toolName).toEqual("");
    expect((container.querySelector(".save-btn") as HTMLButtonElement).disabled)
      .toBeTruthy();
    act(() => {
      ref.current?.setState({ toolName: "fake tool name" });
    });
    expect((container.querySelector(".save-btn") as HTMLButtonElement).disabled)
      .toBeFalsy();
  });

  it("shows name collision message", () => {
    const p = fakeProps();
    p.existingToolNames = ["tool"];
    const { container, ref } = renderTool(p);
    act(() => {
      ref.current?.setState({ toolName: "tool", toolType: "weeder" });
    });
    expect(container.querySelector(".name-error")?.textContent)
      .toEqual("Already added.");
    expect((container.querySelector(".save-btn") as HTMLButtonElement).disabled)
      .toBeTruthy();
  });

  it("saves", async () => {
    mockSave = () => Promise.resolve();
    const p = fakeProps();
    p.dispatch = mockDispatch();
    const navigate = jest.fn();
    const ref = React.createRef<AddTool>();
    render(<NavigationContext.Provider value={navigate}>
      <AddTool {...p} ref={ref} />
    </NavigationContext.Provider>);
    act(() => {
      ref.current?.setState({ toolName: "Foo" });
    });
    await act(async () => {
      ref.current?.save();
      await Promise.resolve();
    });
    expect(crud.init).toHaveBeenCalledWith("Tool", {
      name: "Foo",
      type: "none",
      utm_mountable: true,
      flow_rate_ml_per_s: 0,
      effector_offset_x: 0,
      effector_offset_y: 0,
      effector_offset_z: 0,
    });
    expect(ref.current?.state.uuid).toEqual(undefined);
    expect(navigate).toHaveBeenCalledWith(Path.tools());
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
      type: "none",
      utm_mountable: true,
      flow_rate_ml_per_s: 0,
      effector_offset_x: 0,
      effector_offset_y: 0,
      effector_offset_z: 0,
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
    const { container, navigate } = renderTool(p);
    fireEvent.click(container.querySelector(
      ".add-stock-tools button") as Element);
    expect(crud.initSave).toHaveBeenCalledTimes(expectedAdds);
    expect(crud.initSave).toHaveBeenCalledWith("Tool", {
      name: "Watering Nozzle",
      type: "watering_nozzle",
      utm_mountable: true,
    });
    expect(navigate).toHaveBeenCalledWith(Path.tools());
  });

  it("doesn't add stock tools twice", () => {
    const p = fakeProps();
    p.firmwareHardware = "express_k10";
    p.existingToolNames = ["Seed Trough 1"];
    const { container, navigate } = renderTool(p);
    fireEvent.click(container.querySelector(
      ".add-stock-tools button") as Element);
    expect(crud.initSave).toHaveBeenCalledTimes(2);
    expect(navigate).toHaveBeenCalledWith(Path.tools());
  });

  it("copies a tool name", () => {
    const p = fakeProps();
    p.firmwareHardware = "express_k10";
    const { container, ref } = renderTool(p);
    const names = container.querySelectorAll(".add-stock-tools p");
    fireEvent.click(names[names.length - 1]);
    expect(ref.current?.state.toolName).toEqual("Seed Trough 2");
    expect(ref.current?.state.toolType).toEqual("seed_trough");
    expect(ref.current?.state.utmMountable).toBeFalsy();
  });

  it("provides stock tool types", () => {
    const p = fakeProps();
    p.firmwareHardware = "farmduino_k16";
    const wrapper = createWrapper(p);
    expect(getInstance(wrapper).stockToolNames()).toContainEqual({
      name: "Rotary Tool",
      type: "rotary_tool",
      utm_mountable: true,
      effector_offset_z: -80,
    });
    expect(getInstance(wrapper).stockToolNames()).toContainEqual({
      name: "Seed Trough 1",
      type: "seed_trough",
      utm_mountable: false,
    });
    expect(getInstance(wrapper).stockToolNames()).toContainEqual({
      name: "Seeder",
      type: "seeder",
      utm_mountable: true,
      effector_offset_x: 17.5,
      effector_offset_z: -80,
    });
    unmountRenderer(wrapper);
  });

  it("copies stock tool offsets", () => {
    const p = fakeProps();
    p.firmwareHardware = "farmduino_k16";
    const { container, ref } = renderTool(p);
    const seeder = [...container.querySelectorAll(".add-stock-tools p")]
      .filter(node => node.textContent == "Seeder")[0];
    fireEvent.click(seeder);
    expect(ref.current?.state.toolName).toEqual("Seeder");
    expect(ref.current?.state.toolType).toEqual("seeder");
    expect(ref.current?.state.utmMountable).toBeTruthy();
    expect(ref.current?.state.effectorOffset)
      .toEqual({ x: 17.5, y: 0, z: -80 });
  });

  it("creates a stock tool with offsets", () => {
    const p = fakeProps();
    p.firmwareHardware = "farmduino_k16";
    const wrapper = createWrapper(p);
    const instance = getInstance(wrapper);
    const seeder = instance.stockToolNames()
      .filter(tool => tool.name == "Seeder")[0];
    seeder && instance.newTool(seeder);
    expect(crud.initSave).toHaveBeenCalledWith("Tool", {
      name: "Seeder",
      type: "seeder",
      utm_mountable: true,
      effector_offset_x: 17.5,
      effector_offset_z: -80,
    });
    unmountRenderer(wrapper);
  });

  it("deselects a tool", () => {
    const p = fakeProps();
    p.firmwareHardware = "express_k10";
    const { container, ref } = renderTool(p);
    expect(ref.current?.state.toAdd).toEqual([
      "Watering Nozzle", "Seed Trough 1", "Seed Trough 2",
    ]);
    const inputs = container.querySelectorAll(".add-stock-tools input");
    fireEvent.click(inputs[inputs.length - 1]);
    expect(ref.current?.state.toAdd)
      .toEqual(["Watering Nozzle", "Seed Trough 1"]);
  });

  it("selects a tool", () => {
    const p = fakeProps();
    p.firmwareHardware = "express_k10";
    const { container, ref } = renderTool(p);
    act(() => {
      ref.current?.setState({ toAdd: [] });
    });
    const inputs = container.querySelectorAll(".add-stock-tools input");
    fireEvent.click(inputs[inputs.length - 1]);
    expect(ref.current?.state.toAdd).toEqual(["Seed Trough 2"]);
  });

  it("disables when all already added", () => {
    const p = fakeProps();
    p.firmwareHardware = "express_k10";
    p.existingToolNames = ["Seed Trough 1", "Seed Trough 2", "Watering Nozzle"];
    const { container } = renderTool(p);
    expect(container.querySelector(".add-stock-tools button")?.className)
      .toContain("pseudo-disabled");
  });

  it("hides when none firmware is selected", () => {
    const p = fakeProps();
    p.firmwareHardware = "none";
    const { container } = renderTool(p);
    expect((container.querySelector(".add-stock-tools") as HTMLElement).hidden)
      .toBeTruthy();
  });
});

describe("mapStateToProps()", () => {
  it("returns props", () => {
    const props = mapStateToProps(fakeState());
    expect(props.dispatch).toEqual(expect.any(Function));
  });
});
