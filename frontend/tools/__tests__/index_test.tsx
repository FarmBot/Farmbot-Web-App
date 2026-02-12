const mockDevice = { readPin: jest.fn((_) => Promise.resolve()) };

import React from "react";
import TestRenderer from "react-test-renderer";
import { cleanup, fireEvent, render } from "@testing-library/react";
import { RawTools as Tools } from "../index";
import {
  fakeTool, fakeToolSlot, fakeSensor, fakePointGroup,
} from "../../__test_support__/fake_state/resources";
import { fakeDevice } from "../../__test_support__/resource_index_builder";
import { bot } from "../../__test_support__/fake_state/bot";
import { error } from "../../toast/toast";
import { Content } from "../../constants";
import * as crud from "../../api/crud";
import { ToolSelection } from "../tool_slot_edit_components";
import { fakeToolTransformProps } from "../../__test_support__/fake_tool_info";
import { ToolsProps } from "../interfaces";
import * as mapActions from "../../farm_designer/map/actions";
import * as mapUtil from "../../farm_designer/map/util";
import { Mode } from "../../farm_designer/map/interfaces";
import { SearchField } from "../../ui/search_field";
import { PanelSection } from "../../plants/plant_inventory";
import * as pointGroupActions from "../../point_groups/actions";
import { DEFAULT_CRITERIA } from "../../point_groups/criteria/interfaces";
import { Path } from "../../internal_urls";
import { mountWithContext } from "../../__test_support__/mount_with_context";
import * as deviceModule from "../../device";

const originalPathname = location.pathname;

describe("<Tools />", () => {
  const wrappers: TestRenderer.ReactTestRenderer[] = [];

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

  const createWrapper = (p = fakeProps()) => {
    const wrapper = TestRenderer.create(<Tools {...p} />);
    wrappers.push(wrapper);
    return wrapper;
  };

  afterEach(() => {
    history.replaceState(undefined, "", Path.mock(originalPathname));
    jest.useRealTimers();
    cleanup();
    while (wrappers.length > 0) {
      const wrapper = wrappers.pop();
      wrapper && TestRenderer.act(() => wrapper.unmount());
    }
    jest.restoreAllMocks();
  });

  beforeEach(() => {
    jest.restoreAllMocks();
    jest.spyOn(pointGroupActions, "createGroup")
      .mockImplementation(jest.fn());
    jest.spyOn(crud, "edit").mockImplementation(jest.fn());
    jest.spyOn(crud, "save").mockImplementation(jest.fn());
    jest.spyOn(mapActions, "mapPointClickAction")
      .mockImplementation(jest.fn(() => jest.fn()));
    jest.spyOn(mapActions, "selectPoint")
      .mockImplementation(jest.fn());
    jest.spyOn(mapUtil, "getMode").mockImplementation(() => Mode.none);
    jest.spyOn(deviceModule, "getDevice")
      .mockImplementation(() => mockDevice as never);
  });

  it("renders with no tools", () => {
    const { container } = render(<Tools {...fakeProps()} />);
    expect(container.textContent).toContain("Add a tool");
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
    const { container } = render(<Tools {...p} />);
    const text = container.textContent?.toLowerCase() || "";
    [
      "foo", "my tool", "unnamed", "(1, 0, 0)", "unknown", "(gantry, 2, 0)",
    ].map(string => expect(text).toContain(string));
  });

  it("toggles section", () => {
    const wrapper = createWrapper();
    const instance = wrapper.getInstance() as Tools;
    expect(instance.state.groups).toEqual(false);
    TestRenderer.act(() => instance.toggleOpen("groups")());
    expect(instance.state.groups).toEqual(true);
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
    const { container } = render(<Tools {...p} />);
    expect(container.textContent).toContain("Groups (1)");
  });

  it("navigates to group", () => {
    const wrapper = createWrapper();
    const instance = wrapper.getInstance() as Tools;
    instance.navigate = jest.fn();
    instance.navigateById(1)();
    expect(instance.navigate).toHaveBeenCalledWith(Path.groups(1));
  });

  it("adds new group", () => {
    const p = fakeProps();
    p.tools = [fakeTool()];
    const group1 = fakePointGroup();
    group1.body.criteria.string_eq = { pointer_type: ["ToolSlot"] };
    p.groups = [group1];
    const wrapper = createWrapper(p);
    const sections = wrapper.root.findAllByType(PanelSection);
    sections[sections.length - 1]?.props.addNew();
    expect(pointGroupActions.createGroup).toHaveBeenCalledWith({
      criteria: {
        ...DEFAULT_CRITERIA,
        string_eq: { pointer_type: ["ToolSlot"] },
      },
      navigate: expect.anything(),
    });
  });

  it("navigates to tool", () => {
    const p = fakeProps();
    p.tools = [fakeTool()];
    p.tools[0].body.id = 1;
    p.toolSlots = [fakeToolSlot()];
    p.toolSlots[0].body.id = 2;
    p.toolSlots[0].body.tool_id = 3;
    const { container } = mountWithContext(<Tools {...p} />);
    fireEvent.click(container.querySelector(".tool-slot-search-item") as Element);
    expect(mockNavigate).toHaveBeenCalledWith(Path.toolSlots(2));
    fireEvent.click(container.querySelector(".tool-search-item") as Element);
    expect(mockNavigate).toHaveBeenCalledWith(Path.tools(1));
  });

  it("hovers tool", () => {
    const p = fakeProps();
    p.tools = [fakeTool()];
    p.tools[0].body.id = 1;
    p.toolSlots = [fakeToolSlot()];
    p.toolSlots[0].body.id = 1;
    p.hoveredToolSlot = p.toolSlots[0].uuid;
    const { container } = render(<Tools {...p} />);
    const item = container.querySelector(".tool-slot-search-item") as Element;
    fireEvent.mouseEnter(item);
    expect(p.dispatch).toHaveBeenCalled();
    fireEvent.mouseLeave(item);
    expect(p.dispatch).toHaveBeenCalled();
  });

  it("changes search term", () => {
    const p = fakeProps();
    p.tools = [fakeTool(), fakeTool()];
    p.tools[0].body.name = "tool 0";
    p.tools[1].body.name = "tool 1";
    const wrapper = createWrapper(p);
    wrapper.root.findByType(SearchField).props.onChange("0");
    expect((wrapper.getInstance() as Tools).state.searchTerm).toEqual("0");
  });

  it("filters tools", () => {
    const p = fakeProps();
    p.tools = [fakeTool(), fakeTool()];
    p.tools[0].body.id = 1;
    p.tools[1].body.id = 2;
    p.tools[0].body.name = "tool 0";
    p.tools[1].body.name = "tool 1";
    const wrapper = createWrapper(p);
    TestRenderer.act(() => (wrapper.getInstance() as Tools)
      .setState({ searchTerm: "0" }));
    const names = wrapper.root.findAllByProps({ className: "tool-search-item-name" })
      .map(name => name.children.join("").toLowerCase());
    expect(names).toEqual(["tool 0"]);
  });

  it("changes mounted tool", () => {
    const p = fakeProps();
    p.tools = [fakeTool()];
    const wrapper = createWrapper(p);
    const infoWrapper = TestRenderer.create(
      (wrapper.getInstance() as Tools).MountedToolInfo());
    wrappers.push(infoWrapper);
    infoWrapper.root.findByType(ToolSelection).props.onChange({ tool_id: 123 });
    expect(crud.edit).toHaveBeenCalledWith(p.device, { mounted_tool_id: 123 });
    expect(crud.save).toHaveBeenCalledWith(p.device.uuid);
  });

  it("displays tool verification result: disconnected", () => {
    const p = fakeProps();
    p.tools = [fakeTool()];
    p.sensors[0].body.label = "tool verification";
    p.sensors[0].body.pin = undefined;
    p.bot.hardware.pins = { "63": { value: 1, mode: 0 } };
    const { container } = render(<Tools {...p} />);
    expect(container.textContent).toContain("disconnected");
  });

  it("displays tool verification result: connected", () => {
    const p = fakeProps();
    p.tools = [fakeTool()];
    p.sensors[0].body.label = "tool verification";
    p.sensors[0].body.pin = 64;
    p.bot.hardware.pins = { "64": { value: 0, mode: 0 } };
    const { container } = render(<Tools {...p} />);
    expect(container.textContent).toContain("connected");
  });

  it("verifies tool attachment", () => {
    const p = fakeProps();
    p.tools = [fakeTool()];
    p.bot.hardware.informational_settings.sync_status = "synced";
    p.bot.connectivity.uptime["bot.mqtt"] = { state: "up", at: 0 };
    const { container } = render(<Tools {...p} />);
    expect(container.textContent?.toLowerCase()).toContain("mounted tool");
    fireEvent.click(container.querySelector(".yellow") as Element);
    expect(mockDevice.readPin).toHaveBeenCalledWith({
      label: "pin63", pin_mode: 0, pin_number: 63,
    });
  });

  it("can't verify tool attachment when offline", () => {
    const p = fakeProps();
    p.tools = [fakeTool()];
    p.bot.connectivity.uptime["bot.mqtt"] = undefined;
    const { container } = render(<Tools {...p} />);
    fireEvent.click(container.querySelector(".yellow") as Element);
    expect(mockDevice.readPin).not.toHaveBeenCalled();
    expect(error).toHaveBeenCalledWith(Content.NOT_AVAILABLE_WHEN_OFFLINE);
  });

  it("doesn't display mounted tool on express models", () => {
    const p = fakeProps();
    p.firmwareHardware = "express_k10";
    const { container } = render(<Tools {...p} />);
    expect(container.textContent?.toLowerCase()).not.toContain("mounted tool");
  });

  it("displays tool as active", () => {
    const p = fakeProps();
    const tool = fakeTool();
    tool.body.id = 1;
    p.tools = [tool];
    p.isActive = () => true;
    p.device.body.mounted_tool_id = undefined;
    const { container } = render(<Tools {...p} />);
    expect(container.textContent?.toLowerCase()).toContain("in slot");
  });
});
