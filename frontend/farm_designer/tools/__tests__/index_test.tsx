jest.mock("../../../history", () => ({
  history: { push: jest.fn() },
  getPathArray: () => "/app/designer/tools".split("/"),
}));

jest.mock("../../../api/crud", () => ({
  edit: jest.fn(),
  save: jest.fn(),
}));

const mockDevice = { readPin: jest.fn(() => Promise.resolve()) };
jest.mock("../../../device", () => ({ getDevice: () => mockDevice }));

import * as React from "react";
import { mount, shallow } from "enzyme";
import { RawTools as Tools, ToolsProps, mapStateToProps } from "../index";
import {
  fakeTool, fakeToolSlot, fakeSensor
} from "../../../__test_support__/fake_state/resources";
import { history } from "../../../history";
import { fakeState } from "../../../__test_support__/fake_state";
import {
  buildResourceIndex, fakeDevice
} from "../../../__test_support__/resource_index_builder";
import { bot } from "../../../__test_support__/fake_state/bot";
import { error } from "../../../toast/toast";
import { Content, Actions } from "../../../constants";
import { edit, save } from "../../../api/crud";
import { ToolSelection } from "../tool_slot_edit_components";

describe("<Tools />", () => {
  const fakeProps = (): ToolsProps => ({
    tools: [],
    toolSlots: [],
    dispatch: jest.fn(),
    findTool: () => fakeTool(),
    device: fakeDevice(),
    sensors: [fakeSensor()],
    bot,
    botToMqttStatus: "down",
    hoveredToolSlot: undefined,
  });

  it("renders with no tools", () => {
    const wrapper = mount(<Tools {...fakeProps()} />);
    expect(wrapper.text()).toContain("Add a tool");
  });

  it("renders with tools", () => {
    const p = fakeProps();
    p.tools = [fakeTool(), fakeTool(), fakeTool()];
    p.tools[0].body.id = 1;
    p.tools[0].body.status = "inactive";
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
      "foo", "my tool", "unnamed tool", "(1, 0, 0)", "unknown", "(gantry, 2, 0)"
    ].map(string => expect(wrapper.text().toLowerCase()).toContain(string));
  });

  it("navigates to tool", () => {
    const p = fakeProps();
    p.tools = [fakeTool()];
    p.tools[0].body.id = 1;
    p.tools[0].body.status = "inactive";
    p.toolSlots = [fakeToolSlot()];
    p.toolSlots[0].body.id = 2;
    p.toolSlots[0].body.tool_id = 3;
    const wrapper = mount(<Tools {...p} />);
    wrapper.find(".tool-slot-search-item").first().simulate("click");
    expect(history.push).toHaveBeenCalledWith("/app/designer/tool-slots/2");
    wrapper.find(".tool-search-item").first().simulate("click");
    expect(history.push).toHaveBeenCalledWith("/app/designer/tools/1");
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
    wrapper.find("input").first().simulate("change",
      { currentTarget: { value: "0" } });
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
    p.botToMqttStatus = "up";
    const wrapper = mount(<Tools {...p} />);
    wrapper.find(".yellow").first().simulate("click");
    expect(mockDevice.readPin).toHaveBeenCalledWith({
      label: "pin63", pin_mode: 0, pin_number: 63
    });
  });

  it("can't verify tool attachment when offline", () => {
    const p = fakeProps();
    p.tools = [fakeTool()];
    p.botToMqttStatus = "down";
    const wrapper = mount(<Tools {...p} />);
    wrapper.find(".yellow").first().simulate("click");
    expect(mockDevice.readPin).not.toHaveBeenCalled();
    expect(error).toHaveBeenCalledWith(Content.NOT_AVAILABLE_WHEN_OFFLINE);
  });
});

describe("mapStateToProps()", () => {
  it("returns props", () => {
    const state = fakeState();
    const tool = fakeTool();
    tool.body.id = 1;
    state.resources = buildResourceIndex([tool, fakeDevice()]);
    const props = mapStateToProps(state);
    expect(props.findTool(tool.body.id)).toEqual(tool);
  });
});
