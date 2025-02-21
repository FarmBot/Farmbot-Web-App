jest.mock("../../api/crud", () => ({
  init: jest.fn(() => ({ type: "", payload: { uuid: "fakeUuid" } })),
  save: jest.fn(),
  edit: jest.fn(),
  destroy: jest.fn(),
}));

import React from "react";
import { mount, shallow } from "enzyme";
import { RawAddToolSlot as AddToolSlot } from "../add_tool_slot";
import { fakeState } from "../../__test_support__/fake_state";
import {
  fakeTool, fakeToolSlot, fakeWebAppConfig,
} from "../../__test_support__/fake_state/resources";
import {
  buildResourceIndex,
} from "../../__test_support__/resource_index_builder";
import { init, save, edit, destroy } from "../../api/crud";
import { SpecialStatus } from "farmbot";
import { ToolPulloutDirection } from "farmbot/dist/resources/api_resources";
import { mapStateToPropsAdd } from "../state_to_props";
import { fakeToolTransformProps } from "../../__test_support__/fake_tool_info";
import { AddToolSlotProps } from "../interfaces";
import { Path } from "../../internal_urls";
import { fakeMovementState } from "../../__test_support__/fake_bot_data";

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
    const wrapper = mount(<AddToolSlot {...fakeProps()} />);
    ["add new slot", "x (mm)", "y (mm)", "z (mm)", "tool or seed container",
      "direction", "gantry-mounted",
    ].map(string => expect(wrapper.text().toLowerCase()).toContain(string));
    expect(init).toHaveBeenCalledWith("Point", {
      pointer_type: "ToolSlot", name: "Slot", meta: {},
      x: 0, y: 0, z: 0, tool_id: undefined,
      pullout_direction: ToolPulloutDirection.NONE,
      gantry_mounted: false,
    });
  });

  it("renders while loading", () => {
    const p = fakeProps();
    p.findToolSlot = () => undefined;
    const wrapper = mount(<AddToolSlot {...p} />);
    expect(wrapper.text()).toContain("initializing");
  });

  it("updates tool slot", () => {
    const toolSlot = fakeToolSlot();
    const p = fakeProps();
    const wrapper = mount<AddToolSlot>(<AddToolSlot {...p} />);
    wrapper.instance().updateSlot(toolSlot)({ x: 123 });
    expect(edit).toHaveBeenCalledWith(toolSlot, { x: 123 });
  });

  it("saves tool slot", () => {
    const wrapper = shallow<AddToolSlot>(<AddToolSlot {...fakeProps()} />);
    const navigate = jest.fn();
    wrapper.instance().navigate = navigate;
    wrapper.find("SaveBtn").simulate("click");
    expect(save).toHaveBeenCalled();
    expect(navigate).toHaveBeenCalledWith(Path.tools());
  });

  it("saves on unmount", () => {
    const toolSlot = fakeToolSlot();
    toolSlot.specialStatus = SpecialStatus.DIRTY;
    const p = fakeProps();
    p.findToolSlot = () => toolSlot;
    const wrapper = mount<AddToolSlot>(<AddToolSlot {...p} />);
    window.confirm = () => true;
    wrapper.unmount();
    expect(save).toHaveBeenCalledWith("fakeUuid");
  });

  it("destroys on unmount", () => {
    const toolSlot = fakeToolSlot();
    toolSlot.specialStatus = SpecialStatus.DIRTY;
    const p = fakeProps();
    p.findToolSlot = () => toolSlot;
    const wrapper = mount<AddToolSlot>(<AddToolSlot {...p} />);
    window.confirm = () => false;
    wrapper.unmount();
    expect(destroy).toHaveBeenCalledWith("fakeUuid", true);
  });

  it("doesn't confirm save", () => {
    const toolSlot = fakeToolSlot();
    toolSlot.specialStatus = SpecialStatus.SAVED;
    const p = fakeProps();
    p.findToolSlot = () => toolSlot;
    const wrapper = mount<AddToolSlot>(<AddToolSlot {...p} />);
    window.confirm = jest.fn();
    wrapper.unmount();
    expect(destroy).not.toHaveBeenCalled();
    expect(save).not.toHaveBeenCalled();
  });

  it("can't find tool without tool slot", () => {
    const p = fakeProps();
    p.findToolSlot = () => undefined;
    const wrapper = mount<AddToolSlot>(<AddToolSlot {...p} />);
    expect(wrapper.instance().tool).toEqual(undefined);
  });

  it("renders for express bots", () => {
    const p = fakeProps();
    p.firmwareHardware = "express_k10";
    const wrapper = mount(<AddToolSlot {...p} />);
    expect(wrapper.text().toLowerCase()).not.toContain("tool");
    expect(init).toHaveBeenCalledWith("Point", {
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
    webAppConfig.body.bot_origin_quadrant = 1;
    const tool = fakeTool();
    tool.body.id = 1;
    const toolSlot = fakeToolSlot();
    const state = fakeState();
    state.resources = buildResourceIndex([tool, toolSlot, webAppConfig]);
    const props = mapStateToPropsAdd(state);
    expect(props.toolTransformProps.quadrant).toEqual(1);
    expect(props.findTool(1)).toEqual(tool);
    expect(props.findToolSlot(toolSlot.uuid)).toEqual(toolSlot);
  });
});
