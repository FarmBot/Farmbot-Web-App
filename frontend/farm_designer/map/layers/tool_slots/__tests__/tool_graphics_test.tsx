import React from "react";
import {
  RotatedTool, ToolSVG, ToolSVGProps, ToolSlotSVG, ToolSlotSVGProps,
} from "../tool_graphics";
import { ToolName } from "../../../tool_graphics/all_tools";
import {
  ToolSlotGraphicProps, ToolGraphicProps, ToolProps,
} from "../../../tool_graphics/interfaces";
import { ToolbaySlot } from "../../../tool_graphics/slot";
import { BotOriginQuadrant } from "../../../../interfaces";
import { Color } from "../../../../../ui";
import { Actions } from "../../../../../constants";
import {
  fakeToolSlot,
} from "../../../../../__test_support__/fake_state/resources";
import { ToolPulloutDirection } from "farmbot/dist/resources/api_resources";
import {
  fakeToolTransformProps,
} from "../../../../../__test_support__/fake_tool_info";
import { fireEvent, render } from "@testing-library/react";

const renderSvg = (node: React.ReactNode) => render(<svg>{node}</svg>);

const getUse = (container: HTMLElement) => {
  const element = container.querySelector("use");
  if (!element) { throw new Error("Missing use element"); }
  return element;
};

const getLastCircle = (container: HTMLElement) => {
  const circles = container.querySelectorAll("circle");
  const circle = circles.item(circles.length - 1);
  if (!circle) { throw new Error("Missing circle"); }
  return circle;
};

describe("<ToolbaySlot />", () => {
  const fakeProps = (): ToolSlotGraphicProps => ({
    id: undefined,
    x: 10,
    y: 20,
    pulloutDirection: 0,
    quadrant: 2,
    xySwap: false,
    occupied: true,
  });

  it.each<[number, BotOriginQuadrant, boolean, string]>([
    [0, 2, false, "rotate(0, 10, 20)"],
    [1, 1, false, "rotate(180, 10, 20)"],
    [1, 2, false, "rotate(0, 10, 20)"],
    [1, 3, false, "rotate(0, 10, 20)"],
    [1, 4, false, "rotate(180, 10, 20)"],
    [2, 3, false, "rotate(180, 10, 20)"],
    [3, 1, false, "rotate(90, 10, 20)"],
    [3, 2, false, "rotate(90, 10, 20)"],
    [3, 3, false, "rotate(270, 10, 20)"],
    [3, 4, false, "rotate(270, 10, 20)"],
    [4, 3, false, "rotate(90, 10, 20)"],
    [0, 2, true, "rotate(180, 10, 20)"],
    [1, 1, true, "rotate(90, 10, 20)"],
    [1, 2, true, "rotate(90, 10, 20)"],
    [1, 3, true, "rotate(270, 10, 20)"],
    [1, 4, true, "rotate(270, 10, 20)"],
    [2, 3, true, "rotate(90, 10, 20)"],
    [3, 1, true, "rotate(180, 10, 20)"],
    [3, 2, true, "rotate(0, 10, 20)"],
    [3, 3, true, "rotate(0, 10, 20)"],
    [3, 4, true, "rotate(180, 10, 20)"],
    [4, 3, true, "rotate(180, 10, 20)"],
  ])("renders slot, pullout: %s quad: %s yx: %s",
    (direction, quadrant, xySwap, expected) => {
      const p = fakeProps();
      p.pulloutDirection = direction;
      p.quadrant = quadrant;
      p.xySwap = xySwap;
      const { container } = renderSvg(<ToolbaySlot {...p} />);
      expect(getUse(container).getAttribute("transform")).toEqual(expected);
    });

  it("handles bad data", () => {
    const p = fakeProps();
    p.pulloutDirection = 1.1 as ToolPulloutDirection;
    p.quadrant = 1.1 as BotOriginQuadrant;
    const { container } = renderSvg(<ToolbaySlot {...p} />);
    expect(getUse(container).getAttribute("transform"))
      .toEqual("rotate(0, 10, 20)");
  });

  it("is not clickable when occupied", () => {
    const p = fakeProps();
    p.occupied = true;
    const { container } = renderSvg(<ToolbaySlot {...p} />);
    expect(getUse(container).style.pointerEvents).toEqual("none");
  });

  it("is clickable when unoccupied", () => {
    const p = fakeProps();
    p.occupied = false;
    const { container } = renderSvg(<ToolbaySlot {...p} />);
    expect(getUse(container).getAttribute("style") || "").toEqual("");
  });
});

describe("<RotatedTool/>", () => {
  const fakeToolProps = (): ToolGraphicProps => ({
    toolName: "tool",
    x: 10,
    y: 20,
    hovered: false,
    dispatch: jest.fn(),
    uuid: "fakeUuid",
    toolTransformProps: fakeToolTransformProps(),
    pulloutDirection: 0,
    flipped: false,
  });

  const fakeProps = (): ToolProps => ({
    tool: ToolName.tool,
    toolProps: fakeToolProps()
  });

  it("sets hover state for empty tool slot", () => {
    const p = fakeProps();
    p.tool = ToolName.tool;
    const { container } = renderSvg(<RotatedTool {...p} />);
    fireEvent.mouseOver(getUse(container));
    expect(p.toolProps.dispatch).toHaveBeenCalledWith({
      type: Actions.HOVER_TOOL_SLOT, payload: "fakeUuid"
    });
    fireEvent.mouseLeave(getUse(container));
    expect(p.toolProps.dispatch).toHaveBeenCalledWith({
      type: Actions.HOVER_TOOL_SLOT, payload: undefined
    });
  });

  it("renders empty tool slot styling", () => {
    const p = fakeProps();
    p.tool = ToolName.emptyToolSlot;
    const { container } = renderSvg(<RotatedTool {...p} />);
    const circle = getLastCircle(container);
    expect(circle.getAttribute("r")).toEqual("34");
    expect(circle.getAttribute("fill")).toEqual("none");
    expect(circle.getAttribute("stroke-dasharray")).toEqual("10 5");
  });

  it("renders empty tool slot hover styling", () => {
    const p = fakeProps();
    p.tool = ToolName.emptyToolSlot;
    p.toolProps.hovered = true;
    const { container } = renderSvg(<RotatedTool {...p} />);
    const first = container.querySelector("circle");
    if (!first) { throw new Error("Missing circle"); }
    expect(first.getAttribute("fill")).toEqual(Color.darkGray);
  });

  it("renders standard tool styling", () => {
    const { container } = renderSvg(<RotatedTool {...fakeProps()} />);
    const circle = getLastCircle(container);
    expect(circle.getAttribute("r")).toEqual("35");
    expect(circle.getAttribute("cx")).toEqual("10");
    expect(circle.getAttribute("cy")).toEqual("20");
    expect(circle.getAttribute("fill")).toEqual(Color.mediumGray);
    expect(container.innerHTML).toContain("rotate(-90");
  });

  it("renders flipped tool styling", () => {
    const p = fakeProps();
    p.toolProps.flipped = true;
    const { container } = renderSvg(<RotatedTool {...p} />);
    expect(container.innerHTML).toContain("rotate(90");
  });

  it("renders tool hover styling", () => {
    const p = fakeProps();
    p.toolProps.hovered = true;
    const { container } = renderSvg(<RotatedTool {...p} />);
    expect(getLastCircle(container).getAttribute("fill")).toEqual(Color.darkGray);
  });

  it("renders special tool styling: rotary tool", () => {
    const p = fakeProps();
    p.tool = ToolName.rotaryTool;
    const { container } = renderSvg(<RotatedTool {...p} />);
    expect(container.querySelectorAll("#rotary-tool rect").length).toEqual(1);
  });

  it("renders rotary tool hover styling", () => {
    const p = fakeProps();
    p.tool = ToolName.rotaryTool;
    p.toolProps.hovered = true;
    const { container } = renderSvg(<RotatedTool {...p} />);
    const circles = container.querySelectorAll("#rotary-tool circle");
    expect(circles.item(circles.length - 1).getAttribute("fill-opacity"))
      .toEqual("0.1");
  });

  it("renders special tool styling: weeder", () => {
    const p = fakeProps();
    p.tool = ToolName.weeder;
    const { container } = renderSvg(<RotatedTool {...p} />);
    expect(container.querySelectorAll("#weeder rect").length).toEqual(1);
  });

  it("renders weeder hover styling", () => {
    const p = fakeProps();
    p.tool = ToolName.weeder;
    p.toolProps.hovered = true;
    const { container } = renderSvg(<RotatedTool {...p} />);
    const circles = container.querySelectorAll("#weeder circle");
    expect(circles.item(circles.length - 1).getAttribute("fill-opacity"))
      .toEqual("0.1");
  });

  it("renders special tool styling: watering nozzle", () => {
    const p = fakeProps();
    p.tool = ToolName.wateringNozzle;
    const { container } = renderSvg(<RotatedTool {...p} />);
    expect(container.querySelectorAll("#watering-nozzle rect").length).toEqual(3);
  });

  it("renders watering nozzle hover styling", () => {
    const p = fakeProps();
    p.tool = ToolName.wateringNozzle;
    p.toolProps.hovered = true;
    const { container } = renderSvg(<RotatedTool {...p} />);
    const circles = container.querySelectorAll("#watering-nozzle circle");
    expect(circles.item(circles.length - 1).getAttribute("fill-opacity"))
      .toEqual("0.1");
  });

  it("renders special tool styling: seeder", () => {
    const p = fakeProps();
    p.tool = ToolName.seeder;
    const { container } = renderSvg(<RotatedTool {...p} />);
    expect(container.querySelectorAll("#seeder circle").length).toEqual(4);
  });

  it("renders seeder hover styling", () => {
    const p = fakeProps();
    p.tool = ToolName.seeder;
    p.toolProps.hovered = true;
    const { container } = renderSvg(<RotatedTool {...p} />);
    const circles = container.querySelectorAll("#seeder circle");
    expect(circles.item(circles.length - 1).getAttribute("fill-opacity"))
      .toEqual("0.1");
  });

  it("renders special tool styling: soil sensor", () => {
    const p = fakeProps();
    p.tool = ToolName.soilSensor;
    const { container } = renderSvg(<RotatedTool {...p} />);
    expect(container.querySelectorAll("#soil-sensor rect").length).toEqual(5);
  });

  it("renders soil sensor hover styling", () => {
    const p = fakeProps();
    p.tool = ToolName.soilSensor;
    p.toolProps.hovered = true;
    const { container } = renderSvg(<RotatedTool {...p} />);
    const circles = container.querySelectorAll("#soil-sensor circle");
    expect(circles.item(circles.length - 1).getAttribute("fill-opacity"))
      .toEqual("0.1");
  });

  it("renders special tool styling: bin", () => {
    const p = fakeProps();
    p.tool = ToolName.seedBin;
    const { container } = renderSvg(<RotatedTool {...p} />);
    const circles = container.querySelectorAll("#seed-bin circle");
    expect(circles.length).toEqual(2);
    expect(circles.item(circles.length - 1).getAttribute("fill"))
      .toEqual("url(#SeedBinGradient)");
  });

  it("renders bin hover styling", () => {
    const p = fakeProps();
    p.tool = ToolName.seedBin;
    p.toolProps.hovered = true;
    const { container } = renderSvg(<RotatedTool {...p} />);
    expect(container.querySelectorAll("#seed-bin circle").length).toEqual(3);
  });

  it("renders special tool styling: tray", () => {
    const p = fakeProps();
    p.tool = ToolName.seedTray;
    const { container } = renderSvg(<RotatedTool {...p} />);
    const elements = container.querySelector("#seed-tray");
    if (!elements) { throw new Error("Missing seed tray"); }
    expect(elements.querySelectorAll("circle").length).toEqual(2);
    expect(elements.querySelectorAll("rect").length).toEqual(1);
    expect(elements.querySelector("rect")?.getAttribute("fill"))
      .toEqual("url(#SeedTrayPattern)");
  });

  it("renders tray hover styling", () => {
    const p = fakeProps();
    p.tool = ToolName.seedTray;
    p.toolProps.hovered = true;
    const { container } = renderSvg(<RotatedTool {...p} />);
    expect(container.querySelectorAll("#seed-tray circle").length).toEqual(3);
  });

  it("renders special tool styling: trough", () => {
    const p = fakeProps();
    p.tool = ToolName.seedTrough;
    const { container } = renderSvg(<RotatedTool {...p} />);
    const elements = container.querySelector("#seed-trough");
    if (!elements) { throw new Error("Missing seed trough"); }
    expect(elements.querySelectorAll("circle").length).toEqual(0);
    expect(elements.querySelectorAll("rect").length).toEqual(1);
  });

  it("renders trough hover styling", () => {
    const p = fakeProps();
    p.tool = ToolName.seedTrough;
    p.toolProps.hovered = true;
    const { container } = renderSvg(<RotatedTool {...p} />);
    const elements = container.querySelector("#seed-trough");
    if (!elements) { throw new Error("Missing seed trough"); }
    expect(elements.querySelectorAll("circle").length).toEqual(0);
    expect(elements.querySelectorAll("rect").length).toEqual(1);
  });
});

describe("<ToolSVG />", () => {
  const fakeProps = (): ToolSVGProps => ({
    toolName: "seed trough",
  });

  it("renders trough", () => {
    const { container } = render(<ToolSVG {...fakeProps()} />);
    expect(container.querySelector("svg")?.getAttribute("viewBox"))
      .toEqual("-40 0 80 1");
  });
});

describe("<ToolSlotSVG />", () => {
  const fakeProps = (): ToolSlotSVGProps => ({
    toolSlot: fakeToolSlot(),
    toolName: "seeder",
    toolTransformProps: fakeToolTransformProps(),
  });

  it("renders slot", () => {
    const p = fakeProps();
    p.toolSlot.body.pullout_direction = ToolPulloutDirection.POSITIVE_X;
    const { container } = render(<ToolSlotSVG {...p} />);
    expect(container.querySelectorAll("#toolbay-slot").length).toEqual(1);
    expect(container.innerHTML).not.toContain("side");
  });

  it("renders slot side", () => {
    const p = fakeProps();
    p.profile = true;
    p.toolSlot.body.pullout_direction = ToolPulloutDirection.POSITIVE_Y;
    const { container } = render(<ToolSlotSVG {...p} />);
    expect(container.innerHTML).toContain("side");
  });

  it("doesn't render slot", () => {
    const p = fakeProps();
    p.toolSlot.body.pullout_direction = ToolPulloutDirection.NONE;
    const { container } = render(<ToolSlotSVG {...p} />);
    expect(container.querySelectorAll("#toolbay-slot").length).toEqual(0);
  });
});
