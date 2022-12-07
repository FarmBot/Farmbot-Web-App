import { Path } from "../../internal_urls";
let mockPath = Path.mock(Path.tools());
jest.mock("../../history", () => ({
  getPathArray: () => mockPath.split("/"),
  push: jest.fn(),
}));

jest.mock("../../api/crud", () => ({
  edit: jest.fn(),
  save: jest.fn(),
}));

jest.mock("../../farm_designer/map/actions", () => ({
  mapPointClickAction: jest.fn(() => jest.fn()),
  selectPoint: jest.fn(),
}));

jest.mock("../../point_groups/actions", () => ({
  createGroup: jest.fn(),
}));

const mockDevice = { readPin: jest.fn((_) => Promise.resolve()) };
jest.mock("../../device", () => ({ getDevice: () => mockDevice }));

import React from "react";
import { mount, shallow } from "enzyme";
import {
  RawTools as Tools,
  ToolSlotInventoryItem,
} from "../index";
import {
  fakeTool, fakeToolSlot, fakeSensor, fakePointGroup,
} from "../../__test_support__/fake_state/resources";
import { push } from "../../history";
import { fakeDevice } from "../../__test_support__/resource_index_builder";
import { bot } from "../../__test_support__/fake_state/bot";
import { error } from "../../toast/toast";
import { Content, Actions } from "../../constants";
import { edit, save } from "../../api/crud";
import { ToolSelection } from "../tool_slot_edit_components";
import { fakeToolTransformProps } from "../../__test_support__/fake_tool_info";
import { ToolsProps, ToolSlotInventoryItemProps } from "../interfaces";
import { mapPointClickAction, selectPoint } from "../../farm_designer/map/actions";
import { SearchField } from "../../ui/search_field";
import { PanelSection } from "../../plants/plant_inventory";
import { createGroup } from "../../point_groups/actions";
import { DEFAULT_CRITERIA } from "../../point_groups/criteria/interfaces";

describe("<Tools />", () => {
  const fakeProps = (): ToolsProps => ({
    tools: [],
    toolSlots: [],
    dispatch: jest.fn(),
    findTool: () => fakeTool(),
    device: fakeDevice(),
    sensors: [fakeSensor()],
    bot,
    hoveredToolSlot: undefined,
    firmwareHardware: undefined,
    isActive: jest.fn(),
    toolTransformProps: fakeToolTransformProps(),
    groups: [],
    allPoints: [],
  });

  it("renders with no tools", () => {
    const wrapper = mount(<Tools {...fakeProps()} />);
    expect(wrapper.text()).toContain("Add a tool");
  });

  it("renders with tools", () => {
    const p = fakeProps();
    p.tools = [fakeTool(), fakeTool(), fakeTool()];
    p.tools[0].body.id = 1;
    p.tools[0].body.name = undefined;
    p.tools[1].body.id = 2;
    p.tools[1].body.name = "my tool";
    p.tools[2].body.id = 3;
    p.tools[2].body.name = "my tool";
    p.toolSlots = [fakeToolSlot(), fakeToolSlot()];
    p.toolSlots[0].body.tool_id = 2;
    p.toolSlots[0].body.x = 1;
    p.toolSlots[1].body.tool_id = 3;
    p.toolSlots[1].body.gantry_mounted = true;
    p.toolSlots[1].body.y = 2;
    const wrapper = mount(<Tools {...p} />);
    [
      "foo", "my tool", "unnamed", "(1, 0, 0)", "unknown", "(gantry, 2, 0)",
    ].map(string => expect(wrapper.text().toLowerCase()).toContain(string));
  });

  it("toggles section", () => {
    const wrapper = shallow<Tools>(<Tools {...fakeProps()} />);
    expect(wrapper.state().groups).toEqual(false);
    wrapper.instance().toggleOpen("groups")();
    expect(wrapper.state().groups).toEqual(true);
  });

  it("renders groups", () => {
    const p = fakeProps();
    p.tools = [fakeTool()];
    const group1 = fakePointGroup();
    group1.body.name = "Tool Slot Group";
    group1.body.criteria.string_eq = { pointer_type: ["ToolSlot"] };
    const group2 = fakePointGroup();
    group2.body.name = "Plant Group";
    group2.body.criteria.string_eq = { pointer_type: ["Plant"] };
    p.groups = [group1, group2];
    const wrapper = mount(<Tools {...p} />);
    expect(wrapper.text()).toContain("Groups (1)");
  });

  it("navigates to group", () => {
    const wrapper = shallow<Tools>(<Tools {...fakeProps()} />);
    wrapper.instance().navigate(1)();
    expect(push).toHaveBeenCalledWith(Path.groups(1));
  });

  it("adds new group", () => {
    const p = fakeProps();
    const group1 = fakePointGroup();
    group1.body.criteria.string_eq = { pointer_type: ["ToolSlot"] };
    p.groups = [group1];
    const wrapper = shallow(<Tools {...p} />);
    wrapper.find(PanelSection).last().props().addNew();
    expect(createGroup).toHaveBeenCalledWith({
      criteria: {
        ...DEFAULT_CRITERIA,
        string_eq: { pointer_type: ["ToolSlot"] },
      }
    });
  });

  it("navigates to tool", () => {
    const p = fakeProps();
    p.tools = [fakeTool()];
    p.tools[0].body.id = 1;
    p.toolSlots = [fakeToolSlot()];
    p.toolSlots[0].body.id = 2;
    p.toolSlots[0].body.tool_id = 3;
    const wrapper = mount(<Tools {...p} />);
    wrapper.find(".tool-slot-search-item").first().simulate("click");
    expect(push).toHaveBeenCalledWith(Path.toolSlots(2));
    wrapper.find(".tool-search-item").first().simulate("click");
    expect(push).toHaveBeenCalledWith(Path.tools(1));
  });

  it("hovers tool", () => {
    const p = fakeProps();
    p.tools = [fakeTool()];
    p.tools[0].body.id = 1;
    p.toolSlots = [fakeToolSlot()];
    p.toolSlots[0].body.id = 1;
    p.hoveredToolSlot = p.toolSlots[0].uuid;
    const wrapper = mount(<Tools {...p} />);
    wrapper.find(".tool-slot-search-item").simulate("mouseEnter");
    expect(p.dispatch).toHaveBeenCalledWith({
      type: Actions.HOVER_TOOL_SLOT, payload: p.toolSlots[0].uuid
    });
    wrapper.find(".tool-slot-search-item").simulate("mouseLeave");
    expect(p.dispatch).toHaveBeenCalledWith({
      type: Actions.HOVER_TOOL_SLOT, payload: undefined
    });
  });

  it("changes search term", () => {
    const p = fakeProps();
    p.tools = [fakeTool(), fakeTool()];
    p.tools[0].body.name = "tool 0";
    p.tools[1].body.name = "tool 1";
    const wrapper = shallow<Tools>(<Tools {...p} />);
    wrapper.find(SearchField).simulate("change", "0");
    expect(wrapper.state().searchTerm).toEqual("0");
  });

  it("filters tools", () => {
    const p = fakeProps();
    p.tools = [fakeTool(), fakeTool()];
    p.tools[0].body.name = "tool 0";
    p.tools[1].body.name = "tool 1";
    const wrapper = mount(<Tools {...p} />);
    wrapper.setState({ searchTerm: "0" });
    expect(wrapper.text()).not.toContain("tool 1");
  });

  it("changes mounted tool", () => {
    const p = fakeProps();
    p.tools = [fakeTool()];
    const wrapper = mount<Tools>(<Tools {...p} />);
    shallow(wrapper.instance().MountedToolInfo()).find(ToolSelection)
      .simulate("change", { tool_id: 123 });
    expect(edit).toHaveBeenCalledWith(p.device, { mounted_tool_id: 123 });
    expect(save).toHaveBeenCalledWith(p.device.uuid);
  });

  it("displays tool verification result: disconnected", () => {
    const p = fakeProps();
    p.tools = [fakeTool()];
    p.sensors[0].body.label = "tool verification";
    p.sensors[0].body.pin = undefined;
    p.bot.hardware.pins = { "63": { value: 1, mode: 0 } };
    const wrapper = mount(<Tools {...p} />);
    expect(wrapper.text()).toContain("disconnected");
  });

  it("displays tool verification result: connected", () => {
    const p = fakeProps();
    p.tools = [fakeTool()];
    p.sensors[0].body.label = "tool verification";
    p.sensors[0].body.pin = 64;
    p.bot.hardware.pins = { "64": { value: 0, mode: 0 } };
    const wrapper = mount(<Tools {...p} />);
    expect(wrapper.text()).toContain("connected");
  });

  it("verifies tool attachment", () => {
    const p = fakeProps();
    p.tools = [fakeTool()];
    p.bot.hardware.informational_settings.sync_status = "synced";
    p.bot.connectivity.uptime["bot.mqtt"] = { state: "up", at: 0 };
    const wrapper = mount(<Tools {...p} />);
    expect(wrapper.text().toLowerCase()).toContain("mounted tool");
    wrapper.find(".yellow").first().simulate("click");
    expect(mockDevice.readPin).toHaveBeenCalledWith({
      label: "pin63", pin_mode: 0, pin_number: 63
    });
  });

  it("can't verify tool attachment when offline", () => {
    const p = fakeProps();
    p.tools = [fakeTool()];
    p.bot.connectivity.uptime["bot.mqtt"] = undefined;
    const wrapper = mount(<Tools {...p} />);
    wrapper.find(".yellow").first().simulate("click");
    expect(mockDevice.readPin).not.toHaveBeenCalled();
    expect(error).toHaveBeenCalledWith(Content.NOT_AVAILABLE_WHEN_OFFLINE);
  });

  it("doesn't display mounted tool on express models", () => {
    const p = fakeProps();
    p.firmwareHardware = "express_k10";
    const wrapper = mount(<Tools {...p} />);
    expect(wrapper.text().toLowerCase()).not.toContain("mounted tool");
  });

  it("displays tool as active", () => {
    const p = fakeProps();
    const tool = fakeTool();
    tool.body.id = 1;
    p.tools = [tool];
    p.isActive = () => true;
    p.device.body.mounted_tool_id = undefined;
    const wrapper = mount(<Tools {...p} />);
    expect(wrapper.text().toLowerCase()).toContain("in slot");
  });

  it("displays tool as mounted", () => {
    const p = fakeProps();
    const tool = fakeTool();
    tool.body.id = 1;
    p.findTool = () => tool;
    p.tools = [tool];
    p.device.body.mounted_tool_id = 1;
    const wrapper = mount(<Tools {...p} />);
    expect(wrapper.find("p").last().text().toLowerCase()).toContain("mounted");
  });

  it("handles missing tools", () => {
    const p = fakeProps();
    const tool = fakeTool();
    tool.body.id = 1;
    p.findTool = () => undefined;
    p.tools = [tool];
    p.device.body.mounted_tool_id = 1;
    const wrapper = mount(<Tools {...p} />);
    expect(wrapper.find("p").last().text().toLowerCase()).not.toContain("mounted");
  });
});

describe("<ToolSlotInventoryItem />", () => {
  const fakeProps = (): ToolSlotInventoryItemProps => ({
    toolSlot: fakeToolSlot(),
    tools: [],
    hovered: false,
    dispatch: jest.fn(),
    isActive: jest.fn(),
    toolTransformProps: fakeToolTransformProps(),
    noUTM: false,
  });

  it("changes tool", () => {
    const p = fakeProps();
    const wrapper = shallow(<ToolSlotInventoryItem {...p} />);
    wrapper.find(ToolSelection).simulate("change", { tool_id: 1 });
    expect(edit).toHaveBeenCalledWith(p.toolSlot, { tool_id: 1 });
    expect(save).toHaveBeenCalledWith(p.toolSlot.uuid);
  });

  it("doesn't open tool slot", () => {
    const wrapper = shallow(<ToolSlotInventoryItem {...fakeProps()} />);
    const e = { stopPropagation: jest.fn() };
    wrapper.find(".tool-selection-wrapper").first().simulate("click", e);
    expect(e.stopPropagation).toHaveBeenCalled();
  });

  it("shows tool name", () => {
    const p = fakeProps();
    p.hideDropdown = true;
    const wrapper = mount(<ToolSlotInventoryItem {...p} />);
    expect(wrapper.text().toLowerCase()).toContain("empty");
  });

  it("opens tool slot", () => {
    mockPath = Path.mock(Path.toolSlots());
    const p = fakeProps();
    p.toolSlot.body.id = 1;
    const wrapper = shallow(<ToolSlotInventoryItem {...p} />);
    wrapper.find("div").first().simulate("click");
    expect(mapPointClickAction).not.toHaveBeenCalled();
    expect(push).toHaveBeenCalledWith(Path.toolSlots(1));
    expect(selectPoint).toHaveBeenCalled();
    expect(p.dispatch).not.toHaveBeenCalledWith({
      type: Actions.HOVER_TOOL_SLOT, payload: undefined,
    });
  });

  it("removes item in box select mode", () => {
    mockPath = Path.mock(Path.plants("select"));
    const p = fakeProps();
    p.toolSlot.body.id = 1;
    const wrapper = shallow(<ToolSlotInventoryItem {...p} />);
    wrapper.find("div").first().simulate("click");
    expect(mapPointClickAction).toHaveBeenCalledWith(expect.any(Function),
      p.toolSlot.uuid);
    expect(push).not.toHaveBeenCalled();
    expect(p.dispatch).toHaveBeenCalledWith({
      type: Actions.HOVER_TOOL_SLOT,
      payload: undefined,
    });
  });
});
