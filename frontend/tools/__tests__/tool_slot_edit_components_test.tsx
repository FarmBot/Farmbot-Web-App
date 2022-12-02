jest.mock("../../devices/actions", () => ({ move: jest.fn() }));

import React from "react";
import { shallow, mount } from "enzyme";
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
import { FBSelect, NULL_CHOICE } from "../../ui";
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
import { move } from "../../devices/actions";
import { fakeMovementState } from "../../__test_support__/fake_bot_data";

describe("<GantryMountedInput />", () => {
  const fakeProps = (): GantryMountedInputProps => ({
    gantryMounted: false,
    onChange: jest.fn(),
  });

  it("renders", () => {
    const wrapper = shallow(<GantryMountedInput {...fakeProps()} />);
    expect(wrapper.text().toLowerCase()).toContain("gantry-mounted");
  });

  it("changes value", () => {
    const p = fakeProps();
    const wrapper = shallow(<GantryMountedInput {...p} />);
    wrapper.find("input").simulate("change");
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
    const wrapper = shallow(<FlipToolDirection {...fakeProps()} />);
    expect(wrapper.text().toLowerCase()).toContain("rotate");
  });

  it("changes value to flipped", () => {
    const p = fakeProps();
    const wrapper = shallow(<FlipToolDirection {...p} />);
    wrapper.find("input").simulate("change");
    expect(p.onChange).toHaveBeenCalledWith({
      meta: { tool_direction: "flipped" }
    });
  });

  it("changes value from flipped", () => {
    const p = fakeProps();
    p.toolSlotMeta = { tool_direction: "flipped" };
    const wrapper = shallow(<FlipToolDirection {...p} />);
    wrapper.find("input").simulate("change");
    expect(p.onChange).toHaveBeenCalledWith({
      meta: { tool_direction: "standard" }
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
    const wrapper = mount(<SlotDirectionInputRow {...p} />);
    expect(wrapper.text().toLowerCase()).toContain("direction");
    expect(wrapper.find("i").first().hasClass(expected)).toBeTruthy();
  });

  it("changes value by click", () => {
    const p = fakeProps();
    const wrapper = shallow(<SlotDirectionInputRow {...p} />);
    wrapper.find("i").first().simulate("click");
    expect(p.onChange).toHaveBeenCalledWith({ pullout_direction: 1 });
  });

  it("changes value by click: handles rollover", () => {
    const p = fakeProps();
    p.toolPulloutDirection = ToolPulloutDirection.NEGATIVE_Y;
    const wrapper = shallow(<SlotDirectionInputRow {...p} />);
    wrapper.find("i").first().simulate("click");
    expect(p.onChange).toHaveBeenCalledWith({ pullout_direction: 0 });
  });

  it("changes value by selection", () => {
    const p = fakeProps();
    const wrapper = shallow(<SlotDirectionInputRow {...p} />);
    wrapper.find("FBSelect").simulate("change", { label: "", value: 1 });
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
    const wrapper = mount(<ToolSelection {...fakeProps()} />);
    expect(wrapper.text().toLowerCase()).toContain("none");
  });

  it("handles missing tool data", () => {
    const p = fakeProps();
    p.filterActiveTools = false;
    p.filterSelectedTool = false;
    const tool = fakeTool();
    tool.body.name = undefined;
    tool.body.id = undefined;
    p.tools = [tool];
    const wrapper = shallow(<ToolSelection {...p} />);
    expect(wrapper.find("FBSelect").props().list).toEqual([NULL_CHOICE]);
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
    const wrapper = shallow(<ToolSelection {...p} />);
    expect(wrapper.find("FBSelect").props().list).toEqual([
      NULL_CHOICE,
      { label: "seed trough", value: 1 },
    ]);
  });

  it("handles missing selected tool data", () => {
    const p = fakeProps();
    const tool = fakeTool();
    tool.body.name = undefined;
    p.selectedTool = tool;
    const wrapper = shallow(<ToolSelection {...p} />);
    expect(wrapper.find(FBSelect).props().selectedItem)
      .toEqual(expect.objectContaining({ label: "untitled" }));
  });

  it("shows selected tool", () => {
    const p = fakeProps();
    p.selectedTool = fakeTool();
    const wrapper = mount(<ToolSelection {...p} />);
    expect(wrapper.text().toLowerCase()).toContain("foo");
  });

  it("changes value", () => {
    const p = fakeProps();
    const wrapper = shallow(<ToolSelection {...p} />);
    wrapper.find("FBSelect").simulate("change", { label: "", value: 1 });
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
    const wrapper = mount(<ToolInputRow {...fakeProps()} />);
    expect(wrapper.text().toLowerCase()).toContain("tool");
  });

  it("shows selected tool", () => {
    const p = fakeProps();
    p.selectedTool = fakeTool();
    const wrapper = mount(<ToolInputRow {...p} />);
    expect(wrapper.text().toLowerCase()).toContain("foo");
  });

  it("renders for express bots", () => {
    const p = fakeProps();
    p.noUTM = true;
    const wrapper = mount(<ToolInputRow {...p} />);
    expect(wrapper.text().toLowerCase()).toContain("seed container");
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
    const wrapper = mount(<SlotLocationInputRow {...fakeProps()} />);
    expect(wrapper.text().toLowerCase()).toContain("x (mm)y (mm)z (mm)");
    expect(wrapper.find("input").first().props().value).toEqual(0);
  });

  it("renders gantry-mounted slot", () => {
    const p = fakeProps();
    p.gantryMounted = true;
    const wrapper = mount(<SlotLocationInputRow {...p} />);
    expect(wrapper.find("input").first().props().value).toEqual("Gantry");
  });

  it("changes value", () => {
    const p = fakeProps();
    const wrapper = shallow(<SlotLocationInputRow {...p} />);
    wrapper.find("BlurableInput").at(0).simulate("commit", {
      currentTarget: { value: 1 }
    });
    wrapper.find("BlurableInput").at(1).simulate("commit", {
      currentTarget: { value: 2 }
    });
    wrapper.find("BlurableInput").at(2).simulate("commit", {
      currentTarget: { value: 3 }
    });
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
    const wrapper = mount(<SlotLocationInputRow {...p} />);
    wrapper.find("button").at(1).simulate("click");
    expect(move).toHaveBeenCalledWith({ x: 1, y: 2, z: 3 });
  });

  it("moves to gantry-mounted tool slot", () => {
    const p = fakeProps();
    p.botPosition = { x: 10, y: 20, z: 30 };
    p.slotLocation.x = 1;
    p.slotLocation.y = 2;
    p.slotLocation.z = 3;
    p.gantryMounted = true;
    const wrapper = mount(<SlotLocationInputRow {...p} />);
    wrapper.find("button").at(1).simulate("click");
    expect(move).toHaveBeenCalledWith({ x: 10, y: 2, z: 3 });
  });

  it("falls back to tool slot when moving to gantry-mounted tool slot", () => {
    const p = fakeProps();
    p.botPosition = { x: undefined, y: undefined, z: undefined };
    p.slotLocation.x = 1;
    p.slotLocation.y = 2;
    p.slotLocation.z = 3;
    p.gantryMounted = true;
    const wrapper = mount(<SlotLocationInputRow {...p} />);
    wrapper.find("button").at(1).simulate("click");
    expect(move).toHaveBeenCalledWith({ x: 1, y: 2, z: 3 });
  });
});

describe("<UseCurrentLocation />", () => {
  const fakeProps = (): UseCurrentLocationProps => ({
    onChange: jest.fn(),
    botPosition: { x: undefined, y: undefined, z: undefined },
  });

  it("doesn't use current coordinates", () => {
    const p = fakeProps();
    const wrapper = shallow(<UseCurrentLocation {...p} />);
    wrapper.find("button").simulate("click");
    expect(p.onChange).not.toHaveBeenCalled();
  });

  it("uses current coordinates", () => {
    const p = fakeProps();
    p.botPosition = { x: 0, y: 1, z: 2 };
    const wrapper = shallow(<UseCurrentLocation {...p} />);
    wrapper.find("button").simulate("click");
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
    const wrapper = mount(<SlotEditRows {...p} />);
    expect(wrapper.text()).toContain("None");
  });
});
