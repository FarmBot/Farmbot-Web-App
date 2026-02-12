import React from "react";
import { ToolSlotPoint, TSPProps } from "../tool_slot_point";
import {
  fakeToolSlot, fakeTool,
} from "../../../../../__test_support__/fake_state/resources";
import {
  fakeMapTransformProps,
} from "../../../../../__test_support__/map_transform_props";
import { Actions } from "../../../../../constants";
import { Path } from "../../../../../internal_urls";
import { fireEvent, render } from "@testing-library/react";

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

  const renderPoint = (props: TSPProps) =>
    render(<svg><ToolSlotPoint {...props} /></svg>);

  const getToolSlot = (container: HTMLElement) => {
    const toolSlot = container.querySelector("[id^=\"toolslot-\"]");
    if (!toolSlot) { throw new Error("Missing tool slot"); }
    return toolSlot;
  };

  const getText = (container: HTMLElement) => {
    const text = container.querySelector("text");
    if (!text) { throw new Error("Missing tool slot text"); }
    return text;
  };

  it.each<[0 | 1, 0 | 1]>([
    [0, 0],
    [1, 0],
    [1, 1],
  ])("renders %s tool and %s slot", (tool, slot) => {
    if (!tool && !slot) { tool = 1; }
    const p = fakeProps();
    if (!tool) { p.slot.tool = undefined; }
    p.slot.toolSlot.body.pullout_direction = slot;
    const { container } = renderPoint(p);
    expect(container.querySelectorAll("circle").length).toEqual(tool);
    expect(container.querySelectorAll("use").length).toEqual(slot + 1);
  });

  it("opens tool info", () => {
    const p = fakeProps();
    p.slot.toolSlot.body.id = 1;
    location.pathname = Path.mock(Path.tools());
    const { container } = renderPoint(p);
    fireEvent.click(getToolSlot(container));
    expect(mockNavigate).toHaveBeenCalledWith(Path.toolSlots(1));
  });

  it("displays tool name", () => {
    const p = fakeProps();
    p.slot.toolSlot.body.pullout_direction = 2;
    p.hoveredToolSlot = p.slot.toolSlot.uuid;
    const { container } = renderPoint(p);
    expect(getText(container).getAttribute("visibility")).toEqual("visible");
    expect(getText(container).textContent).toEqual("Foo");
    expect(getText(container).getAttribute("dx")).toEqual("-40");
  });

  it("displays 'empty'", () => {
    const p = fakeProps();
    p.slot.tool = undefined;
    p.hoveredToolSlot = p.slot.toolSlot.uuid;
    const { container } = renderPoint(p);
    expect(getText(container).textContent).toEqual("Empty");
    expect(getText(container).getAttribute("dx")).toEqual("40");
  });

  it("doesn't display tool name", () => {
    const { container } = renderPoint(fakeProps());
    expect(getText(container).getAttribute("visibility")).toEqual("hidden");
  });

  it("renders rotary tool", () => {
    const p = fakeProps();
    if (p.slot.tool) { p.slot.tool.body.name = "rotary tool"; }
    const { container } = renderPoint(p);
    expect(container.querySelectorAll("#rotary-tool").length).toEqual(1);
  });

  it("renders weeder", () => {
    const p = fakeProps();
    if (p.slot.tool) { p.slot.tool.body.name = "weeder"; }
    const { container } = renderPoint(p);
    expect(container.querySelectorAll("#weeder").length).toEqual(1);
  });

  it("renders watering nozzle", () => {
    const p = fakeProps();
    if (p.slot.tool) { p.slot.tool.body.name = "watering nozzle"; }
    const { container } = renderPoint(p);
    expect(container.querySelectorAll("#watering-nozzle").length).toEqual(1);
  });

  it("renders seeder", () => {
    const p = fakeProps();
    if (p.slot.tool) { p.slot.tool.body.name = "seeder"; }
    const { container } = renderPoint(p);
    expect(container.querySelectorAll("#seeder").length).toEqual(1);
  });

  it("renders soil sensor", () => {
    const p = fakeProps();
    if (p.slot.tool) { p.slot.tool.body.name = "soil sensor"; }
    const { container } = renderPoint(p);
    expect(container.querySelectorAll("#soil-sensor").length).toEqual(1);
  });

  it("renders bin", () => {
    const p = fakeProps();
    if (p.slot.tool) { p.slot.tool.body.name = "seed bin"; }
    const { container } = renderPoint(p);
    expect(container.querySelectorAll("#SeedBinGradient").length).toEqual(1);
  });

  it("renders tray", () => {
    const p = fakeProps();
    if (p.slot.tool) { p.slot.tool.body.name = "seed tray"; }
    const { container } = renderPoint(p);
    expect(container.querySelectorAll("#SeedTrayPattern").length).toEqual(1);
  });

  it("renders trough", () => {
    const p = fakeProps();
    p.slot.toolSlot.body.gantry_mounted = true;
    if (p.slot.tool) { p.slot.tool.body.name = "seed trough"; }
    const { container } = renderPoint(p);
    expect(container.querySelector("#seed-trough rect")?.getAttribute("width"))
      .toEqual("13.5");
    expect(
      container.querySelector("#gantry-toolbay-slot rect")?.getAttribute("width")
    ).toEqual("47.5");
  });

  it("renders rotated trough", () => {
    const p = fakeProps();
    p.mapTransformProps.xySwap = true;
    p.slot.toolSlot.body.gantry_mounted = true;
    if (p.slot.tool) { p.slot.tool.body.name = "seed trough"; }
    const { container } = renderPoint(p);
    expect(container.querySelector("#seed-trough rect")?.getAttribute("width"))
      .toEqual("13.5");
    expect(
      container.querySelector("#gantry-toolbay-slot rect")?.getAttribute("width")
    ).toEqual("22.5");
  });

  it("animates tool", () => {
    const p = fakeProps();
    p.animate = true;
    p.current = true;
    const { container } = renderPoint(p);
    expect(container.querySelector(".tool-slot-indicator")?.getAttribute("class"))
      .toContain("animate");
  });

  it("doesn't animate tool", () => {
    const p = fakeProps();
    p.animate = false;
    p.current = true;
    const { container } = renderPoint(p);
    expect(container.querySelector(".tool-slot-indicator")?.getAttribute("class"))
      .not.toContain("animate");
  });

  it("begins hover", () => {
    const p = fakeProps();
    const { container } = renderPoint(p);
    fireEvent.mouseEnter(getToolSlot(container));
    expect(p.dispatch).toHaveBeenCalledWith({
      type: Actions.TOGGLE_HOVERED_POINT,
      payload: p.slot.toolSlot.uuid
    });
  });

  it("ends hover", () => {
    const p = fakeProps();
    const { container } = renderPoint(p);
    fireEvent.mouseLeave(getToolSlot(container));
    expect(p.dispatch).toHaveBeenCalledWith({
      type: Actions.TOGGLE_HOVERED_POINT,
      payload: undefined
    });
  });
});
