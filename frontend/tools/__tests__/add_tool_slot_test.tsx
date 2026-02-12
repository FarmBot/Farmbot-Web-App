import React from "react";
import TestRenderer from "react-test-renderer";
import { render } from "@testing-library/react";
import { RawAddToolSlot as AddToolSlot } from "../add_tool_slot";
import { fakeState } from "../../__test_support__/fake_state";
import {
  fakeTool, fakeToolSlot, fakeWebAppConfig,
} from "../../__test_support__/fake_state/resources";
import {
  buildResourceIndex,
} from "../../__test_support__/resource_index_builder";
import * as crud from "../../api/crud";
import { SpecialStatus } from "farmbot";
import { ToolPulloutDirection } from "farmbot/dist/resources/api_resources";
import { mapStateToPropsAdd } from "../state_to_props";
import { fakeToolTransformProps } from "../../__test_support__/fake_tool_info";
import { AddToolSlotProps } from "../interfaces";
import { Path } from "../../internal_urls";
import { fakeMovementState } from "../../__test_support__/fake_bot_data";

const originalConfirm = window.confirm;

beforeEach(() => {
  jest.restoreAllMocks();
  jest.clearAllMocks();
  jest.useRealTimers();
  window.confirm = originalConfirm;
  jest.spyOn(crud, "init")
    .mockImplementation(jest.fn(() => ({
      type: "",
      payload: { uuid: "fakeUuid" },
    })) as never);
  jest.spyOn(crud, "save").mockImplementation(jest.fn());
  jest.spyOn(crud, "edit").mockImplementation(jest.fn());
  jest.spyOn(crud, "destroy").mockImplementation(jest.fn());
});

afterEach(() => {
  window.confirm = originalConfirm;
  jest.restoreAllMocks();
});

describe("<AddToolSlot />", () => {
  const fakeProps = (): AddToolSlotProps => ({
    tools: [],
    findTool: jest.fn(),
    botPosition: { x: undefined, y: undefined, z: undefined },
    dispatch: jest.fn(),
    findToolSlot: fakeToolSlot,
    firmwareHardware: undefined,
    toolTransformProps: fakeToolTransformProps(),
    isActive: jest.fn(),
    botOnline: true,
    arduinoBusy: false,
    defaultAxes: "XY",
    movementState: fakeMovementState(),
  });

  it("renders", () => {
    const { container } = render(<AddToolSlot {...fakeProps()} />);
    ["add new slot", "x (mm)", "y (mm)", "z (mm)", "tool or seed container",
      "direction", "gantry-mounted",
    ].map(string => expect(container.textContent?.toLowerCase()).toContain(string));
    expect(crud.init).toHaveBeenCalledWith("Point", {
      pointer_type: "ToolSlot", name: "Slot", meta: {},
      x: 0, y: 0, z: 0, tool_id: undefined,
      pullout_direction: ToolPulloutDirection.NONE,
      gantry_mounted: false,
    });
  });

  it("renders while loading", () => {
    const p = fakeProps();
    p.findToolSlot = () => undefined;
    const { container } = render(<AddToolSlot {...p} />);
    expect(container.textContent).toContain("initializing");
  });

  it("updates tool slot", () => {
    const toolSlot = fakeToolSlot();
    const p = fakeProps();
    const wrapper = TestRenderer.create(<AddToolSlot {...p} />);
    const instance = wrapper.getInstance() as AddToolSlot;
    instance.updateSlot(toolSlot)({ x: 123 });
    expect(crud.edit).toHaveBeenCalledWith(toolSlot, { x: 123 });
    wrapper.unmount();
  });

  it("saves tool slot", () => {
    const wrapper = TestRenderer.create(<AddToolSlot {...fakeProps()} />);
    const instance = wrapper.getInstance() as AddToolSlot;
    const navigate = jest.fn();
    instance.navigate = navigate;
    instance.save();
    expect(crud.save).toHaveBeenCalled();
    expect(navigate).toHaveBeenCalledWith(Path.tools());
    wrapper.unmount();
  });

  it("saves on unmount", () => {
    const toolSlot = fakeToolSlot();
    toolSlot.specialStatus = SpecialStatus.DIRTY;
    const p = fakeProps();
    p.findToolSlot = () => toolSlot;
    const wrapper = TestRenderer.create(<AddToolSlot {...p} />);
    window.confirm = () => true;
    wrapper.unmount();
    expect(crud.save).toHaveBeenCalledWith("fakeUuid");
  });

  it("destroys on unmount", () => {
    const toolSlot = fakeToolSlot();
    toolSlot.specialStatus = SpecialStatus.DIRTY;
    const p = fakeProps();
    p.findToolSlot = () => toolSlot;
    const wrapper = TestRenderer.create(<AddToolSlot {...p} />);
    window.confirm = () => false;
    wrapper.unmount();
    expect(crud.destroy).toHaveBeenCalledWith("fakeUuid", true);
  });

  it("doesn't confirm save", () => {
    const toolSlot = fakeToolSlot();
    toolSlot.specialStatus = SpecialStatus.SAVED;
    const p = fakeProps();
    p.findToolSlot = () => toolSlot;
    const wrapper = TestRenderer.create(<AddToolSlot {...p} />);
    window.confirm = jest.fn();
    wrapper.unmount();
    expect(crud.destroy).not.toHaveBeenCalled();
    expect(crud.save).not.toHaveBeenCalled();
  });

  it("can't find tool without tool slot", () => {
    const p = fakeProps();
    p.findToolSlot = () => undefined;
    const wrapper = TestRenderer.create(<AddToolSlot {...p} />);
    const instance = wrapper.getInstance() as AddToolSlot;
    expect(instance.tool).toEqual(undefined);
    wrapper.unmount();
  });

  it("renders for express bots", () => {
    const p = fakeProps();
    p.firmwareHardware = "express_k10";
    const { container } = render(<AddToolSlot {...p} />);
    expect(container.textContent?.toLowerCase()).not.toContain("tool");
    expect(crud.init).toHaveBeenCalledWith("Point", {
      pointer_type: "ToolSlot", name: "Slot", meta: {},
      x: 0, y: 0, z: 0, tool_id: undefined,
      pullout_direction: ToolPulloutDirection.NONE,
      gantry_mounted: true,
    });
  });
});

describe("mapStateToPropsAdd()", () => {
  it("returns props", () => {
    const webAppConfig = fakeWebAppConfig();
    webAppConfig.body.id = 1;
    webAppConfig.body.bot_origin_quadrant = 1;
    const tool = fakeTool();
    tool.body.id = 1;
    const toolSlot = fakeToolSlot();
    const state = fakeState();
    state.resources = buildResourceIndex([tool, toolSlot, webAppConfig]);
    const props = mapStateToPropsAdd(state);
    expect([1, 2, 3, 4]).toContain(props.toolTransformProps.quadrant);
    expect(props.findTool(1)).toEqual(tool);
    expect(props.findToolSlot(toolSlot.uuid)).toEqual(toolSlot);
  });
});
