jest.mock("../../../api/crud", () => ({
  init: jest.fn(() => ({ type: "", payload: { uuid: "fakeUuid" } })),
  save: jest.fn(),
  edit: jest.fn(),
  destroy: jest.fn(),
}));

jest.mock("../../../history", () => ({ history: { push: jest.fn() } }));

import * as React from "react";
import { mount, shallow } from "enzyme";
import { RawAddToolSlot as AddToolSlot } from "../add_tool_slot";
import { fakeState } from "../../../__test_support__/fake_state";
import {
  fakeTool, fakeToolSlot, fakeWebAppConfig
} from "../../../__test_support__/fake_state/resources";
import {
  buildResourceIndex
} from "../../../__test_support__/resource_index_builder";
import { init, save, edit, destroy } from "../../../api/crud";
import { history } from "../../../history";
import { SpecialStatus } from "farmbot";
import { ToolPulloutDirection } from "farmbot/dist/resources/api_resources";
import { AddToolSlotProps, mapStateToPropsAdd } from "../map_to_props_add_edit";

describe("<AddToolSlot />", () => {
  const fakeProps = (): AddToolSlotProps => ({
    tools: [],
    findTool: jest.fn(),
    botPosition: { x: undefined, y: undefined, z: undefined },
    dispatch: jest.fn(),
    findToolSlot: fakeToolSlot,
    firmwareHardware: undefined,
    xySwap: false,
    quadrant: 2,
    isActive: jest.fn(),
  });

  it("renders", () => {
    const wrapper = mount(<AddToolSlot {...fakeProps()} />);
    ["add new slot", "x (mm)", "y (mm)", "z (mm)", "tool or seed container",
      "change direction", "gantry-mounted"
    ].map(string => expect(wrapper.text().toLowerCase()).toContain(string));
    expect(init).toHaveBeenCalledWith("Point", {
      pointer_type: "ToolSlot", name: "Slot", radius: 0, meta: {},
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
    wrapper.find("SaveBtn").simulate("click");
    expect(save).toHaveBeenCalled();
    expect(history.push).toHaveBeenCalledWith("/app/designer/tools");
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
      pointer_type: "ToolSlot", name: "Slot", radius: 0, meta: {},
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
    expect(props.quadrant).toEqual(1);
    expect(props.findTool(1)).toEqual(tool);
    expect(props.findToolSlot(toolSlot.uuid)).toEqual(toolSlot);
  });
});
