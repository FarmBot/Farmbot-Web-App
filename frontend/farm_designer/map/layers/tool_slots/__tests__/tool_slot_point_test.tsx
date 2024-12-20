import React from "react";
import { ToolSlotPoint, TSPProps } from "../tool_slot_point";
import {
  fakeToolSlot, fakeTool,
} from "../../../../../__test_support__/fake_state/resources";
import {
  fakeMapTransformProps,
} from "../../../../../__test_support__/map_transform_props";
import { svgMount } from "../../../../../__test_support__/svg_mount";
import { shallow } from "enzyme";
import { Actions } from "../../../../../constants";
import { Path } from "../../../../../internal_urls";

describe("<ToolSlotPoint/>", () => {
  const fakeProps = (): TSPProps => ({
    mapTransformProps: fakeMapTransformProps(),
    botPositionX: undefined,
    slot: { toolSlot: fakeToolSlot(), tool: fakeTool() },
    dispatch: jest.fn(),
    hoveredToolSlot: undefined,
    current: false,
    animate: false,
  });

  it.each<[0 | 1, 0 | 1]>([
    [0, 0],
    [1, 0],
    [1, 1],
  ])("renders %s tool and %s slot", (tool, slot) => {
    if (!tool && !slot) { tool = 1; }
    const p = fakeProps();
    if (!tool) { p.slot.tool = undefined; }
    p.slot.toolSlot.body.pullout_direction = slot;
    const wrapper = svgMount(<ToolSlotPoint {...p} />);
    expect(wrapper.find("circle").length).toEqual(tool);
    expect(wrapper.find("use").length).toEqual(slot + 1);
  });

  it("opens tool info", () => {
    const p = fakeProps();
    p.slot.toolSlot.body.id = 1;
    const wrapper = svgMount(<ToolSlotPoint {...p} />);
    wrapper.find("g").first().simulate("click");
    expect(mockNavigate).toHaveBeenCalledWith(Path.toolSlots(1));
  });

  it("displays tool name", () => {
    const p = fakeProps();
    p.slot.toolSlot.body.pullout_direction = 2;
    p.hoveredToolSlot = p.slot.toolSlot.uuid;
    const wrapper = svgMount(<ToolSlotPoint {...p} />);
    expect(wrapper.find("text").props().visibility).toEqual("visible");
    expect(wrapper.find("text").text()).toEqual("Foo");
    expect(wrapper.find("text").props().dx).toEqual(-40);
  });

  it("displays 'empty'", () => {
    const p = fakeProps();
    p.slot.tool = undefined;
    p.hoveredToolSlot = p.slot.toolSlot.uuid;
    const wrapper = svgMount(<ToolSlotPoint {...p} />);
    expect(wrapper.find("text").text()).toEqual("Empty");
    expect(wrapper.find("text").props().dx).toEqual(40);
  });

  it("doesn't display tool name", () => {
    const wrapper = svgMount(<ToolSlotPoint {...fakeProps()} />);
    expect(wrapper.find("text").props().visibility).toEqual("hidden");
  });

  it("renders rotary tool", () => {
    const p = fakeProps();
    if (p.slot.tool) { p.slot.tool.body.name = "rotary tool"; }
    const wrapper = svgMount(<ToolSlotPoint {...p} />);
    expect(wrapper.find("#rotary-tool").length).toEqual(1);
  });

  it("renders weeder", () => {
    const p = fakeProps();
    if (p.slot.tool) { p.slot.tool.body.name = "weeder"; }
    const wrapper = svgMount(<ToolSlotPoint {...p} />);
    expect(wrapper.find("#weeder").length).toEqual(1);
  });

  it("renders watering nozzle", () => {
    const p = fakeProps();
    if (p.slot.tool) { p.slot.tool.body.name = "watering nozzle"; }
    const wrapper = svgMount(<ToolSlotPoint {...p} />);
    expect(wrapper.find("#watering-nozzle").length).toEqual(1);
  });

  it("renders seeder", () => {
    const p = fakeProps();
    if (p.slot.tool) { p.slot.tool.body.name = "seeder"; }
    const wrapper = svgMount(<ToolSlotPoint {...p} />);
    expect(wrapper.find("#seeder").length).toEqual(1);
  });

  it("renders soil sensor", () => {
    const p = fakeProps();
    if (p.slot.tool) { p.slot.tool.body.name = "soil sensor"; }
    const wrapper = svgMount(<ToolSlotPoint {...p} />);
    expect(wrapper.find("#soil-sensor").length).toEqual(1);
  });

  it("renders bin", () => {
    const p = fakeProps();
    if (p.slot.tool) { p.slot.tool.body.name = "seed bin"; }
    const wrapper = svgMount(<ToolSlotPoint {...p} />);
    expect(wrapper.find("#SeedBinGradient").length).toEqual(1);
  });

  it("renders tray", () => {
    const p = fakeProps();
    if (p.slot.tool) { p.slot.tool.body.name = "seed tray"; }
    const wrapper = svgMount(<ToolSlotPoint {...p} />);
    expect(wrapper.find("#SeedTrayPattern").length).toEqual(1);
  });

  it("renders trough", () => {
    const p = fakeProps();
    p.slot.toolSlot.body.gantry_mounted = true;
    if (p.slot.tool) { p.slot.tool.body.name = "seed trough"; }
    const wrapper = svgMount(<ToolSlotPoint {...p} />);
    expect(wrapper.find("#seed-trough").find("rect").props().width)
      .toEqual(13.5);
    expect(wrapper.find("#gantry-toolbay-slot").find("rect").props().width)
      .toEqual(47.5);
  });

  it("renders rotated trough", () => {
    const p = fakeProps();
    p.mapTransformProps.xySwap = true;
    p.slot.toolSlot.body.gantry_mounted = true;
    if (p.slot.tool) { p.slot.tool.body.name = "seed trough"; }
    const wrapper = svgMount(<ToolSlotPoint {...p} />);
    expect(wrapper.find("#seed-trough").find("rect").props().width)
      .toEqual(13.5);
    expect(wrapper.find("#gantry-toolbay-slot").find("rect").props().width)
      .toEqual(22.5);
  });

  it("animates tool", () => {
    const p = fakeProps();
    p.animate = true;
    p.current = true;
    const wrapper = svgMount(<ToolSlotPoint {...p} />);
    expect(wrapper.find(".tool-slot-indicator").first().hasClass("animate"))
      .toBeTruthy();
  });

  it("doesn't animate tool", () => {
    const p = fakeProps();
    p.animate = false;
    p.current = true;
    const wrapper = svgMount(<ToolSlotPoint {...p} />);
    expect(wrapper.find(".tool-slot-indicator").first().hasClass("animate"))
      .toBeFalsy();
  });

  it("begins hover", () => {
    const p = fakeProps();
    const wrapper = shallow(<ToolSlotPoint {...p} />);
    wrapper.find("g").simulate("mouseEnter");
    expect(p.dispatch).toHaveBeenCalledWith({
      type: Actions.TOGGLE_HOVERED_POINT,
      payload: p.slot.toolSlot.uuid
    });
  });

  it("ends hover", () => {
    const p = fakeProps();
    const wrapper = shallow(<ToolSlotPoint {...p} />);
    wrapper.find("g").simulate("mouseLeave");
    expect(p.dispatch).toHaveBeenCalledWith({
      type: Actions.TOGGLE_HOVERED_POINT,
      payload: undefined
    });
  });
});
