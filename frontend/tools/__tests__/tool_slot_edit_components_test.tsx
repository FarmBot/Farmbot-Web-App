import React from "react";
import TestRenderer from "react-test-renderer";
import { cleanup, fireEvent, render } from "@testing-library/react";
import {
  GantryMountedInput,
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
import { BlurableInput, FBSelect, NULL_CHOICE } from "../../ui";
import { fakeToolTransformProps } from "../../__test_support__/fake_tool_info";
import { ToolPulloutDirection } from "farmbot/dist/resources/api_resources";
import {
  GantryMountedInputProps,
  SlotDirectionInputRowProps,
  ToolSelectionProps,
  ToolInputRowProps,
  SlotLocationInputRowProps,
  SlotEditRowsProps,
  EditToolSlotMetaProps,
} from "../interfaces";
import * as deviceActions from "../../devices/actions";
import { fakeMovementState } from "../../__test_support__/fake_bot_data";

const wrappers: TestRenderer.ReactTestRenderer[] = [];
const createWrapper = (element: React.ReactElement) => {
  const wrapper = TestRenderer.create(element);
  wrappers.push(wrapper);
  return wrapper;
};

beforeEach(() => {
  jest.clearAllMocks();
  jest.spyOn(deviceActions, "move").mockImplementation(jest.fn());
});

afterEach(() => {
  cleanup();
  while (wrappers.length > 0) {
    const wrapper = wrappers.pop();
    wrapper && TestRenderer.act(() => wrapper.unmount());
  }
  jest.restoreAllMocks();
});

describe("<GantryMountedInput />", () => {
  const fakeProps = (): GantryMountedInputProps => ({
    gantryMounted: false,
    onChange: jest.fn(),
  });

  it("renders", () => {
    const { container } = render(<GantryMountedInput {...fakeProps()} />);
    expect(container.textContent?.toLowerCase()).toContain("gantry-mounted");
  });

  it("changes value", () => {
    const p = fakeProps();
    const { container } = render(<GantryMountedInput {...p} />);
    fireEvent.click(container.querySelector("input") as Element);
    expect(p.onChange).toHaveBeenCalledWith({ gantry_mounted: true });
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
    noUTM: false,
  });

  it("renders", () => {
    const { container } = render(<ToolSelection {...fakeProps()} />);
    expect(container.textContent?.toLowerCase()).toContain("none");
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
    const tool = fakeTool();
    tool.body.id = 2;
    tool.body.name = "watering nozzle";
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
    const { container } = render(<ToolSelection {...p} />);
    expect(container.textContent?.toLowerCase()).toContain("foo");
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
    const { container } = render(<ToolInputRow {...p} />);
    expect(container.textContent?.toLowerCase()).toContain("foo");
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
    gantryMounted: false,
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
    expect(container.textContent?.toLowerCase()).toContain("x (mm)y (mm)z (mm)");
    expect((container.querySelector("input") as HTMLInputElement).value)
      .toEqual("0");
  });

  it("renders gantry-mounted slot", () => {
    const p = fakeProps();
    p.gantryMounted = true;
    const { container } = render(<SlotLocationInputRow {...p} />);
    expect((container.querySelector("input") as HTMLInputElement).value)
      .toEqual("Gantry");
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
    p.gantryMounted = false;
    const { container } = render(<SlotLocationInputRow {...p} />);
    fireEvent.click(container.querySelectorAll("button")[1] as Element);
    expect(deviceActions.move).toHaveBeenCalledWith({ x: 1, y: 2, z: 3 });
  });

  it("moves to gantry-mounted tool slot", () => {
    const p = fakeProps();
    p.botPosition = { x: 10, y: 20, z: 30 };
    p.slotLocation.x = 1;
    p.slotLocation.y = 2;
    p.slotLocation.z = 3;
    p.gantryMounted = true;
    const { container } = render(<SlotLocationInputRow {...p} />);
    fireEvent.click(container.querySelectorAll("button")[1] as Element);
    expect(deviceActions.move).toHaveBeenCalledWith({ x: 10, y: 2, z: 3 });
  });

  it("falls back to tool slot when moving to gantry-mounted tool slot", () => {
    const p = fakeProps();
    p.botPosition = { x: undefined, y: undefined, z: undefined };
    p.slotLocation.x = 1;
    p.slotLocation.y = 2;
    p.slotLocation.z = 3;
    p.gantryMounted = true;
    const { container } = render(<SlotLocationInputRow {...p} />);
    fireEvent.click(container.querySelectorAll("button")[1] as Element);
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
    const { container } = render(<SlotEditRows {...p} />);
    expect(container.textContent).toContain("None");
  });
});
