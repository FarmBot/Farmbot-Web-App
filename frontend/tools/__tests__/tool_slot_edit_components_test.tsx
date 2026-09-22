import React from "react";
import { cleanup, fireEvent, render } from "@testing-library/react";
import {
  MountStageInput,
  MountOffsetInput,
  SlotDirectionInputRow,
  ToolInputRow,
  SlotLocationInputRow,
  ToolSelection,
  SlotEditRows,
  FlipToolDirection,
  isToolFlipped,
  UseCurrentLocationProps,
  UseCurrentLocation,
} from "../tool_slot_edit_components";
import {
  fakeTool, fakeToolSlot,
} from "../../__test_support__/fake_state/resources";
import * as ui from "../../ui";
import { BlurableInput, FBSelect, NULL_CHOICE } from "../../ui";
import { fakeToolTransformProps } from "../../__test_support__/fake_tool_info";
import {
  MountStage, ToolPulloutDirection,
} from "farmbot/dist/resources/api_resources";
import {
  MountStageInputProps,
  MountOffsetInputProps,
  SlotDirectionInputRowProps,
  ToolSelectionProps,
  ToolInputRowProps,
  SlotLocationInputRowProps,
  SlotEditRowsProps,
  EditToolSlotMetaProps,
} from "../interfaces";
import * as deviceActions from "../../devices/actions";
import { fakeMovementState } from "../../__test_support__/fake_bot_data";
import { ToolSlotSVG } from "../../farm_designer/map/layers/tool_slots/tool_graphics";
import {
  createRenderer,
  unmountRenderer,
} from "../../__test_support__/test_renderer";
import { changeBlurableInputRTL } from "../../__test_support__/helpers";

const wrappers: ReturnType<typeof createRenderer>[] = [];
const createWrapper = (element: React.ReactElement) => {
  const wrapper = createRenderer(element);
  wrappers.push(wrapper);
  return wrapper;
};
let fbSelectSpy: jest.SpyInstance;
let popoverSpy: jest.SpyInstance;

beforeEach(() => {
  jest.clearAllMocks();
  jest.spyOn(deviceActions, "move").mockImplementation(jest.fn());
  fbSelectSpy = jest.spyOn(ui, "FBSelect")
    .mockImplementation(((_: ui.FBSelectProps) => <div />) as never);
  popoverSpy = jest.spyOn(ui, "Popover")
    .mockImplementation(({ target }: ui.PopoverProps) =>
      <div>{target}</div>);
});

afterEach(() => {
  cleanup();
  while (wrappers.length > 0) {
    const wrapper = wrappers.pop();
    wrapper && unmountRenderer(wrapper);
  }
  fbSelectSpy.mockRestore();
  popoverSpy.mockRestore();
});

describe("<MountStageInput />", () => {
  const fakeProps = (): MountStageInputProps => ({
    mountStage: MountStage.NONE,
    onChange: jest.fn(),
  });

  it("renders", () => {
    const { container } = render(<MountStageInput {...fakeProps()} />);
    expect(container.textContent?.toLowerCase()).toContain("mount stage");
  });

  it.each([
    MountStage.NONE, MountStage.X, MountStage.Y, MountStage.Z,
  ])("changes value to stage %s", mountStage => {
    const p = fakeProps();
    const wrapper = createWrapper(<MountStageInput {...p} />);
    wrapper.root.findByType(FBSelect).props.onChange({
      label: "", value: mountStage,
    });
    expect(p.onChange).toHaveBeenCalledWith({ mount_stage: mountStage });
  });
});

describe("<MountOffsetInput />", () => {
  const fakeProps = (): MountOffsetInputProps => ({
    mountStage: MountStage.Y,
    value: { x: 1, y: 2, z: 3 },
    onChange: jest.fn(),
  });

  it("does not render for a stationary slot", () => {
    const p = fakeProps();
    p.mountStage = MountStage.NONE;
    const { container } = render(<MountOffsetInput {...p} />);
    expect(container).toBeEmptyDOMElement();
  });

  it.each<[MountStage, string[]]>([
    [MountStage.X, ["Y", "Z"]],
    [MountStage.Y, ["Z"]],
    [MountStage.Z, []],
  ])("enables stage-controlled axes: %s", (mountStage, disabledAxes) => {
    const p = fakeProps();
    p.mountStage = mountStage;
    const { container } = render(<MountOffsetInput {...p} />);
    const disabled = Array.from(container.querySelectorAll("input:disabled"))
      .map(input => input.getAttribute("name")?.replace("mountOffset", ""));
    expect(disabled).toEqual(disabledAxes);
  });

  it("changes decimal offset values", () => {
    const p = fakeProps();
    p.mountStage = MountStage.Z;
    const { container } = render(<MountOffsetInput {...p} />);
    const change = (axis: string, value: string) => changeBlurableInputRTL(
      container.querySelector(
        `input[name='mountOffset${axis}']`) as HTMLElement,
      value);
    change("X", "-11.5");
    change("Y", "12.5");
    change("Z", "13.5");
    expect(p.onChange).toHaveBeenNthCalledWith(1, { mount_offset_x: -11.5 });
    expect(p.onChange).toHaveBeenNthCalledWith(2, { mount_offset_y: 12.5 });
    expect(p.onChange).toHaveBeenNthCalledWith(3, { mount_offset_z: 13.5 });
  });

  it("retains inactive values when the stage changes", () => {
    const p = fakeProps();
    p.mountStage = MountStage.X;
    const { container, rerender } = render(<MountOffsetInput {...p} />);
    const yInput = () => container.querySelector(
      "input[name='mountOffsetY']") as HTMLInputElement;
    expect(yInput()).toBeDisabled();
    expect(yInput()).toHaveValue(2);
    rerender(<MountOffsetInput {...p} mountStage={MountStage.Y} />);
    expect(yInput()).toBeEnabled();
    expect(yInput()).toHaveValue(2);
  });
});

describe("isToolFlipped()", () => {
  it("isn't flipped", () => {
    expect(isToolFlipped(undefined)).toBeFalsy();
    expect(isToolFlipped({})).toBeFalsy();
    expect(isToolFlipped({ tool_direction: "standard" })).toBeFalsy();
  });

  it("is flipped", () => {
    expect(isToolFlipped({ tool_direction: "flipped" })).toBeTruthy();
  });
});

describe("<FlipToolDirection />", () => {
  const fakeProps = (): EditToolSlotMetaProps => ({
    toolSlotMeta: {},
    onChange: jest.fn(),
  });

  it("renders", () => {
    const { container } = render(<FlipToolDirection {...fakeProps()} />);
    expect(container.textContent?.toLowerCase()).toContain("rotate");
  });

  it("changes value to flipped", () => {
    const p = fakeProps();
    const { container } = render(<FlipToolDirection {...p} />);
    fireEvent.click(container.querySelector("input") as Element);
    expect(p.onChange).toHaveBeenCalledWith({
      meta: { tool_direction: "flipped" },
    });
  });

  it("changes value from flipped", () => {
    const p = fakeProps();
    p.toolSlotMeta = { tool_direction: "flipped" };
    const { container } = render(<FlipToolDirection {...p} />);
    fireEvent.click(container.querySelector("input") as Element);
    expect(p.onChange).toHaveBeenCalledWith({
      meta: { tool_direction: "standard" },
    });
  });
});

describe("<SlotDirectionInputRow />", () => {
  const fakeProps = (): SlotDirectionInputRowProps => ({
    toolPulloutDirection: 0,
    onChange: jest.fn(),
  });

  it.each<[ToolPulloutDirection, string]>([
    [ToolPulloutDirection.NONE, "fa-dot-circle-o"],
    [ToolPulloutDirection.POSITIVE_X, "fa-arrow-circle-right"],
    [ToolPulloutDirection.NEGATIVE_X, "fa-arrow-circle-left"],
    [ToolPulloutDirection.POSITIVE_Y, "fa-arrow-circle-up"],
    [ToolPulloutDirection.NEGATIVE_Y, "fa-arrow-circle-down"],
  ])("renders: direction %s", (toolPulloutDirection, expected) => {
    const p = fakeProps();
    p.toolPulloutDirection = toolPulloutDirection;
    const { container } = render(<SlotDirectionInputRow {...p} />);
    expect(container.textContent?.toLowerCase()).toContain("direction");
    expect(container.querySelector(".direction-icon")?.className)
      .toContain(expected);
  });

  it("changes value by click", () => {
    const p = fakeProps();
    const { container } = render(<SlotDirectionInputRow {...p} />);
    fireEvent.click(container.querySelector(".direction-icon") as Element);
    expect(p.onChange).toHaveBeenCalledWith({ pullout_direction: 1 });
  });

  it("changes value by click: handles rollover", () => {
    const p = fakeProps();
    p.toolPulloutDirection = ToolPulloutDirection.NEGATIVE_Y;
    const { container } = render(<SlotDirectionInputRow {...p} />);
    fireEvent.click(container.querySelector(".direction-icon") as Element);
    expect(p.onChange).toHaveBeenCalledWith({ pullout_direction: 0 });
  });

  it("changes value by selection", () => {
    const p = fakeProps();
    const wrapper = createWrapper(<SlotDirectionInputRow {...p} />);
    wrapper.root.findByType(FBSelect).props.onChange({ label: "", value: 1 });
    expect(p.onChange).toHaveBeenCalledWith({ pullout_direction: 1 });
  });
});

describe("<ToolSelection />", () => {
  const fakeProps = (): ToolSelectionProps => ({
    tools: [],
    selectedTool: undefined,
    onChange: jest.fn(),
    filterSelectedTool: false,
    isActive: jest.fn(),
    filterActiveTools: true,
    filterUtmMountable: false,
    noUTM: false,
  });

  it("renders", () => {
    const wrapper = createWrapper(<ToolSelection {...fakeProps()} />);
    expect(wrapper.root.findByType(FBSelect).props.selectedItem)
      .toEqual(NULL_CHOICE);
    expect(wrapper.root.findByType(FBSelect).props.list)
      .toEqual([NULL_CHOICE]);
  });

  it("handles missing tool data", () => {
    const p = fakeProps();
    p.filterActiveTools = false;
    p.filterSelectedTool = false;
    const tool = fakeTool();
    tool.body.name = undefined;
    tool.body.id = undefined;
    p.tools = [tool];
    const wrapper = createWrapper(<ToolSelection {...p} />);
    expect(wrapper.root.findByType(FBSelect).props.list).toEqual([NULL_CHOICE]);
  });

  it("shows available items", () => {
    const p = fakeProps();
    const trough = fakeTool();
    trough.body.id = 1;
    trough.body.name = "seed trough";
    trough.body.type = "seed_trough";
    const tool = fakeTool();
    tool.body.id = 2;
    tool.body.name = "watering nozzle";
    tool.body.type = "watering_nozzle";
    const otherTool = fakeTool();
    otherTool.body.id = 3;
    otherTool.body.name = undefined;
    p.tools = [trough, tool, otherTool];
    p.noUTM = true;
    const wrapper = createWrapper(<ToolSelection {...p} />);
    expect(wrapper.root.findByType(FBSelect).props.list).toEqual([
      NULL_CHOICE,
      { label: "seed trough", value: 1 },
    ]);
  });

  it("handles missing selected tool data", () => {
    const p = fakeProps();
    const tool = fakeTool();
    tool.body.name = undefined;
    p.selectedTool = tool;
    const wrapper = createWrapper(<ToolSelection {...p} />);
    expect(wrapper.root.findByType(FBSelect).props.selectedItem)
      .toEqual(expect.objectContaining({ label: "untitled" }));
  });

  it("shows selected tool", () => {
    const p = fakeProps();
    p.selectedTool = fakeTool();
    const wrapper = createWrapper(<ToolSelection {...p} />);
    expect(wrapper.root.findByType(FBSelect).props.selectedItem)
      .toEqual(expect.objectContaining({
        label: p.selectedTool.body.name || "untitled",
      }));
  });

  it("filters tools that cannot mount to the UTM", () => {
    const p = fakeProps();
    p.filterActiveTools = false;
    p.filterUtmMountable = true;
    const mountable = fakeTool();
    mountable.body.id = 1;
    mountable.body.name = "mountable";
    const container = fakeTool();
    container.body.id = 2;
    container.body.name = "container";
    container.body.utm_mountable = false;
    p.tools = [mountable, container];
    p.selectedTool = container;
    const wrapper = createWrapper(<ToolSelection {...p} />);
    expect(wrapper.root.findByType(FBSelect).props.list).toEqual([
      NULL_CHOICE,
      { label: "mountable", value: 1 },
    ]);
    expect(wrapper.root.findByType(FBSelect).props.selectedItem)
      .toEqual({ label: "container", value: "2" });
  });

  it("shows non-mountable tools when not filtering", () => {
    const p = fakeProps();
    p.filterActiveTools = false;
    const container = fakeTool();
    container.body.id = 2;
    container.body.name = "container";
    container.body.utm_mountable = false;
    p.tools = [container];
    const wrapper = createWrapper(<ToolSelection {...p} />);
    expect(wrapper.root.findByType(FBSelect).props.list).toEqual([
      NULL_CHOICE,
      { label: "container", value: 2 },
    ]);
  });

  it("changes value", () => {
    const p = fakeProps();
    const wrapper = createWrapper(<ToolSelection {...p} />);
    wrapper.root.findByType(FBSelect).props.onChange({ label: "", value: 1 });
    expect(p.onChange).toHaveBeenCalledWith({ tool_id: 1 });
  });
});

describe("<ToolInputRow />", () => {
  const fakeProps = (): ToolInputRowProps => ({
    tools: [],
    selectedTool: undefined,
    onChange: jest.fn(),
    noUTM: false,
    isActive: jest.fn(),
  });

  it("renders", () => {
    const { container } = render(<ToolInputRow {...fakeProps()} />);
    expect(container.textContent?.toLowerCase()).toContain("tool");
  });

  it("shows selected tool", () => {
    const p = fakeProps();
    p.selectedTool = fakeTool();
    const wrapper = createWrapper(<ToolInputRow {...p} />);
    expect(wrapper.root.findByType(ToolSelection).props.selectedTool)
      .toEqual(p.selectedTool);
    expect(wrapper.root.findByType(ToolSelection).props.filterUtmMountable)
      .toBeFalsy();
  });

  it("renders for express bots", () => {
    const p = fakeProps();
    p.noUTM = true;
    const { container } = render(<ToolInputRow {...p} />);
    expect(container.textContent?.toLowerCase()).toContain("seed container");
  });
});

describe("<SlotLocationInputRow />", () => {
  const fakeProps = (): SlotLocationInputRowProps => ({
    slotLocation: { x: 0, y: 0, z: 0 },
    mountStage: MountStage.NONE,
    onChange: jest.fn(),
    botPosition: { x: undefined, y: undefined, z: undefined },
    botOnline: true,
    arduinoBusy: false,
    defaultAxes: "XYZ",
    dispatch: jest.fn(),
    movementState: fakeMovementState(),
  });

  it("renders", () => {
    const { container } = render(<SlotLocationInputRow {...fakeProps()} />);
    expect(container.querySelectorAll("label"))
      .toHaveLength(3);
    expect(container.textContent?.toLowerCase()).toContain("(mm)");
    expect((container.querySelector("input") as HTMLInputElement).value)
      .toEqual("0");
  });

  it("renders mounted slot coordinates", () => {
    const p = fakeProps();
    p.mountStage = MountStage.Y;
    const { container } = render(<SlotLocationInputRow {...p} />);
    expect((container.querySelector("input") as HTMLInputElement).value)
      .toEqual("Y axis");
    expect(container.querySelectorAll("input:disabled")).toHaveLength(2);
  });

  it("changes value", () => {
    const p = fakeProps();
    const wrapper = createWrapper(<SlotLocationInputRow {...p} />);
    const inputs = wrapper.root.findAllByType(BlurableInput);
    inputs[0]?.props.onCommit({ currentTarget: { value: 1 } });
    inputs[1]?.props.onCommit({ currentTarget: { value: 2 } });
    inputs[2]?.props.onCommit({ currentTarget: { value: 3 } });
    expect(p.onChange).toHaveBeenCalledWith({ x: 1 });
    expect(p.onChange).toHaveBeenCalledWith({ y: 2 });
    expect(p.onChange).toHaveBeenCalledWith({ z: 3 });
  });

  it("moves to tool slot", () => {
    const p = fakeProps();
    p.slotLocation.x = 1;
    p.slotLocation.y = 2;
    p.slotLocation.z = 3;
    p.mountStage = MountStage.NONE;
    const { container } = render(<SlotLocationInputRow {...p} />);
    fireEvent.click(container.querySelectorAll("button")[1]);
    expect(deviceActions.move).toHaveBeenCalledWith({ x: 1, y: 2, z: 3 });
  });

  it("moves to a mounted tool slot", () => {
    const p = fakeProps();
    p.botPosition = { x: 10, y: 20, z: 30 };
    p.slotLocation.x = 1;
    p.slotLocation.y = 2;
    p.slotLocation.z = 3;
    Object.assign(p.slotLocation, {
      mount_offset_x: 4,
      mount_offset_y: -5,
      mount_offset_z: 6,
    });
    p.mountStage = MountStage.Y;
    const { container } = render(<SlotLocationInputRow {...p} />);
    fireEvent.click(container.querySelectorAll("button")[1]);
    expect(deviceActions.move).toHaveBeenCalledWith({ x: 14, y: 15, z: 3 });
  });

  it("falls back to stored mounted coordinates", () => {
    const p = fakeProps();
    p.botPosition = { x: undefined, y: undefined, z: undefined };
    p.slotLocation.x = 1;
    p.slotLocation.y = 2;
    p.slotLocation.z = 3;
    p.mountStage = MountStage.Z;
    const { container } = render(<SlotLocationInputRow {...p} />);
    fireEvent.click(container.querySelectorAll("button")[1]);
    expect(deviceActions.move).toHaveBeenCalledWith({ x: 1, y: 2, z: 3 });
  });
});

describe("<UseCurrentLocation />", () => {
  const fakeProps = (): UseCurrentLocationProps => ({
    onChange: jest.fn(),
    botPosition: { x: undefined, y: undefined, z: undefined },
  });

  it("doesn't use current coordinates", () => {
    const p = fakeProps();
    const { container } = render(<UseCurrentLocation {...p} />);
    fireEvent.click(container.querySelector("button") as Element);
    expect(p.onChange).not.toHaveBeenCalled();
  });

  it("uses current coordinates", () => {
    const p = fakeProps();
    p.botPosition = { x: 0, y: 1, z: 2 };
    const { container } = render(<UseCurrentLocation {...p} />);
    fireEvent.click(container.querySelector("button") as Element);
    expect(p.onChange).toHaveBeenCalledWith(p.botPosition);
  });
});

describe("<SlotEditRows />", () => {
  const fakeProps = (): SlotEditRowsProps => ({
    toolSlot: fakeToolSlot(),
    tools: [],
    tool: undefined,
    botPosition: { x: undefined, y: undefined, z: undefined },
    updateToolSlot: jest.fn(),
    noUTM: false,
    toolTransformProps: fakeToolTransformProps(),
    isActive: () => false,
    botOnline: true,
    arduinoBusy: false,
    defaultAxes: "XY",
    dispatch: jest.fn(),
    movementState: fakeMovementState(),
  });

  it("handles missing tool", () => {
    const p = fakeProps();
    p.tool = undefined;
    const wrapper = createWrapper(<SlotEditRows {...p} />);
    expect(wrapper.root.findByType(ToolSlotSVG).props.toolName).toEqual("Empty");
    expect(wrapper.root.findByType(ToolSlotSVG).props.toolType).toBeUndefined();
  });

  it.each([
    MountStage.NONE,
    MountStage.X,
    MountStage.Y,
    MountStage.Z,
  ])("shows direction controls for stage %s", mountStage => {
    const p = fakeProps();
    p.toolSlot.body.mount_stage = mountStage;
    const wrapper = createWrapper(<SlotEditRows {...p} />);
    expect(wrapper.root.findAllByType(SlotDirectionInputRow)).toHaveLength(1);
    expect(wrapper.root.findAllByType(FlipToolDirection)).toHaveLength(1);
  });
});
