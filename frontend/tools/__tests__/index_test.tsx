const mockDevice = { readPin: jest.fn((_) => Promise.resolve()) };

import React from "react";
import { act, fireEvent, render } from "@testing-library/react";
import type { ReactTestInstance } from "react-test-renderer";
import {
  RawTools as Tools,
  ToolSlotInventoryItem,
} from "../index";
import {
  fakeTool, fakeToolSlot, fakeSensor, fakePointGroup,
} from "../../__test_support__/fake_state/resources";
import { fakeDevice } from "../../__test_support__/resource_index_builder";
import { bot } from "../../__test_support__/fake_state/bot";
import { error } from "../../toast/toast";
import { Content, Actions } from "../../constants";
import * as crud from "../../api/crud";
import { ToolSelection } from "../tool_slot_edit_components";
import { fakeToolTransformProps } from "../../__test_support__/fake_tool_info";
import { ToolsProps, ToolSlotInventoryItemProps } from "../interfaces";
import * as mapActions from "../../farm_designer/map/actions";
import * as mapUtil from "../../farm_designer/map/util";
import { Mode } from "../../farm_designer/map/interfaces";
import * as pointGroupActions from "../../point_groups/actions";
import { DEFAULT_CRITERIA } from "../../point_groups/criteria/interfaces";
import { Path } from "../../internal_urls";
import * as deviceModule from "../../device";
import { NavigationContext } from "../../routes_helpers";
import { FBSelect } from "../../ui/new_fb_select";
import {
  createRenderer,
  unmountRenderer,
} from "../../__test_support__/test_renderer";

const originalPathname = location.pathname;

const renderWithContext = (element: React.ReactElement) =>
  render(
    <NavigationContext.Provider value={mockNavigate}>
      {element}
    </NavigationContext.Provider>,
  );

const findNodeByType = (
  node: React.ReactNode,
  matcher: (type: React.ElementType) => boolean,
): ReactTestInstance | undefined => {
  if (!node || typeof node === "string" || typeof node === "number") {
    return undefined;
  }
  if (Array.isArray(node)) {
    for (const child of node as React.ReactNode[]) {
      const found = findNodeByType(child, matcher);
      if (found) {
        return found;
      }
    }
    return undefined;
  }
  if (React.isValidElement(node)) {
    if (matcher(node.type)) {
      return createRenderer(node as React.ReactElement).root;
    }
    let found: ReactTestInstance | undefined;
    React.Children.forEach(node.props.children, (child: React.ReactNode) => {
      if (found) {
        return;
      }
      found = findNodeByType(child, matcher);
    });
    if (found) {
      return found;
    }
  }
  return undefined;
};

describe("<Tools />", () => {
  afterEach(() => {
    history.replaceState(undefined, "", Path.mock(originalPathname));
    jest.useRealTimers();
  });

  beforeEach(() => {
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
    [
      "foo", "my tool", "unnamed", "(1, 0, 0)", "unknown", "(gantry, 2, 0)",
    ].map(string => expect(container.textContent?.toLowerCase()).toContain(string));
  });

  it("toggles section", () => {
    const ref = React.createRef<Tools>();
    renderWithContext(<Tools {...fakeProps()} ref={ref} />);
    expect(ref.current?.state.groups).toEqual(false);
    act(() => {
      ref.current?.toggleOpen("groups")();
    });
    expect(ref.current?.state.groups).toEqual(true);
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
    const { container } = renderWithContext(<Tools {...p} />);
    expect(container.textContent).toContain("Groups (1)");
  });

  it("navigates to group", () => {
    const ref = React.createRef<Tools>();
    renderWithContext(<Tools {...fakeProps()} ref={ref} />);
    act(() => {
      ref.current?.navigateById(1)();
    });
    expect(mockNavigate).toHaveBeenCalledWith(Path.groups(1));
  });

  it("adds new group", () => {
    const p = fakeProps();
    p.tools = [fakeTool()];
    const group1 = fakePointGroup();
    group1.body.criteria.string_eq = { pointer_type: ["ToolSlot"] };
    p.groups = [group1];
    const { container } = renderWithContext(<Tools {...p} />);
    const groupsHeader = Array.from(container.querySelectorAll(".section-header"))
      .find(section => section.textContent?.includes("Groups (1)"));
    expect(groupsHeader).toBeTruthy();
    fireEvent.click(groupsHeader as Element);
    const plusGroup = groupsHeader?.querySelector(".plus-group");
    expect(plusGroup).toBeTruthy();
    fireEvent.click(plusGroup as Element);
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
    const { container } = renderWithContext(<Tools {...p} />);
    const toolSlot = container.querySelector(".tool-slot-search-item") as Element;
    const tool = container.querySelector(".tool-search-item") as Element;
    fireEvent.click(toolSlot);
    expect(mockNavigate).toHaveBeenCalledWith(Path.toolSlots(2));
    fireEvent.click(tool);
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
    const toolSlot = container.querySelector(".tool-slot-search-item") as Element;
    fireEvent.mouseEnter(toolSlot);
    expect(p.dispatch).toHaveBeenCalled();
    fireEvent.mouseLeave(toolSlot);
    expect(p.dispatch).toHaveBeenCalled();
  });

  it("changes search term", () => {
    const p = fakeProps();
    p.tools = [fakeTool(), fakeTool()];
    p.tools[0].body.name = "tool 0";
    p.tools[1].body.name = "tool 1";
    const ref = React.createRef<Tools>();
    const { container } = renderWithContext(<Tools {...p} ref={ref} />);
    const input = container.querySelector(
      "[name='toolsSearchTerm']") as HTMLInputElement;
    fireEvent.change(input, { target: { value: "0" } });
    expect(ref.current?.state.searchTerm).toEqual("0");
  });

  it("filters tools", () => {
    const p = fakeProps();
    p.tools = [fakeTool(), fakeTool()];
    p.tools[0].body.name = "tool 0";
    p.tools[1].body.name = "tool 1";
    const { container } = render(<Tools {...p} />);
    const input = container.querySelector(
      "[name='toolsSearchTerm']") as HTMLInputElement;
    fireEvent.change(input, { target: { value: "0" } });
    expect(container.textContent).not.toContain("tool 1");
  });

  it("changes mounted tool", () => {
    const p = fakeProps();
    p.tools = [fakeTool()];
    const ref = React.createRef<Tools>();
    renderWithContext(<Tools {...p} ref={ref} />);
    const mountedTool = ref.current?.MountedToolInfo();
    const toolSelection = findNodeByType(
      mountedTool, type => type === ToolSelection);
    act(() => {
      toolSelection?.props.onChange({ tool_id: 123 });
    });
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

  it("displays tool as mounted", () => {
    const p = fakeProps();
    const tool = fakeTool();
    tool.body.id = 1;
    p.findTool = () => tool;
    p.tools = [tool];
    p.device.body.mounted_tool_id = 1;
    const { container } = render(<Tools {...p} />);
    const paragraphs = container.querySelectorAll("p");
    expect(paragraphs[paragraphs.length - 1].textContent?.toLowerCase())
      .toContain("mounted");
  });

  it("handles missing tools", () => {
    const p = fakeProps();
    const tool = fakeTool();
    tool.body.id = 1;
    p.findTool = () => undefined;
    p.tools = [tool];
    p.device.body.mounted_tool_id = 1;
    const { container } = render(<Tools {...p} />);
    const paragraphs = container.querySelectorAll("p");
    expect(paragraphs[paragraphs.length - 1].textContent?.toLowerCase())
      .not.toContain("mounted");
  });
});

describe("<ToolSlotInventoryItem />", () => {
  let getModeSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    history.replaceState(undefined, "", Path.mock(originalPathname));
    jest.useRealTimers();
    jest.spyOn(crud, "edit").mockImplementation(jest.fn());
    jest.spyOn(crud, "save").mockImplementation(jest.fn());
    jest.spyOn(mapActions, "mapPointClickAction")
      .mockImplementation(jest.fn(() => jest.fn()));
    jest.spyOn(mapActions, "selectPoint")
      .mockImplementation(jest.fn());
    getModeSpy = jest.spyOn(mapUtil, "getMode").mockReturnValue(Mode.none);
  });

  afterEach(() => {
    getModeSpy.mockRestore();
  });

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
    let wrapper: ReturnType<typeof createRenderer> | undefined;
    act(() => {
      wrapper = createRenderer(<ToolSlotInventoryItem {...p} />);
    });
    act(() => {
      wrapper?.root.findByType(FBSelect).props.onChange({ value: "1" });
    });
    expect(p.dispatch).toHaveBeenCalledTimes(2);
    expect(crud.edit).toHaveBeenCalledWith(p.toolSlot, { tool_id: 1 });
    expect(crud.save).toHaveBeenCalledWith(p.toolSlot.uuid);
    if (wrapper) {
      act(() => {
        unmountRenderer(wrapper);
      });
    }
  });

  it("doesn't open tool slot", () => {
    const { container } = render(<ToolSlotInventoryItem {...fakeProps()} />);
    fireEvent.click(container.querySelector(".tool-selection-wrapper") as Element);
    expect(mockNavigate).not.toHaveBeenCalled();
    expect(mapActions.selectPoint).not.toHaveBeenCalled();
  });

  it("shows tool name", () => {
    const p = fakeProps();
    p.hideDropdown = true;
    const { container } = render(<ToolSlotInventoryItem {...p} />);
    expect(container.textContent?.toLowerCase()).toContain("empty");
  });

  it("opens tool slot", () => {
    location.pathname = Path.mock(Path.toolSlots());
    const p = fakeProps();
    p.toolSlot.body.id = 1;
    const { container } = render(<ToolSlotInventoryItem {...p} />);
    fireEvent.click(container.querySelector("div") as Element);
    expect(mapActions.mapPointClickAction).not.toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith(Path.toolSlots(1));
    expect(mapActions.selectPoint).toHaveBeenCalled();
    expect(p.dispatch).not.toHaveBeenCalledWith({
      type: Actions.HOVER_TOOL_SLOT, payload: undefined,
    });
  });

  it("doesn't open tool slot: disabled", () => {
    location.pathname = Path.mock(Path.toolSlots());
    const p = fakeProps();
    p.disableNavigate = true;
    p.toolSlot.body.id = 1;
    const { container } = render(<ToolSlotInventoryItem {...p} />);
    fireEvent.click(container.querySelector("div") as Element);
    expect(mapActions.mapPointClickAction).not.toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
    expect(mapActions.selectPoint).not.toHaveBeenCalled();
    expect(p.dispatch).not.toHaveBeenCalledWith({
      type: Actions.HOVER_TOOL_SLOT, payload: undefined,
    });
  });

  it("removes item in box select mode", () => {
    location.pathname = Path.mock(Path.plants("select"));
    getModeSpy.mockReturnValue(Mode.boxSelect);
    const p = fakeProps();
    p.toolSlot.body.id = 1;
    const { container } = render(<ToolSlotInventoryItem {...p} />);
    fireEvent.click(container.querySelector("div") as Element);
    expect(mapActions.mapPointClickAction).toHaveBeenCalledWith(
      expect.any(Function),
      expect.any(Function),
      p.toolSlot.uuid);
    expect(mockNavigate).not.toHaveBeenCalled();
    expect(p.dispatch).toHaveBeenCalled();
  });
});
