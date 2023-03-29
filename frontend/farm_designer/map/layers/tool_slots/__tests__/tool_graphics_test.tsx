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
import { svgMount } from "../../../../../__test_support__/svg_mount";
import { Actions } from "../../../../../constants";
import { shallow } from "enzyme";
import {
  fakeToolSlot,
} from "../../../../../__test_support__/fake_state/resources";
import { ToolPulloutDirection } from "farmbot/dist/resources/api_resources";
import {
  fakeToolTransformProps,
} from "../../../../../__test_support__/fake_tool_info";

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
      const wrapper = svgMount(<ToolbaySlot {...p} />);
      expect(wrapper.find("use").props().transform).toEqual(expected);
    });

  it("handles bad data", () => {
    const p = fakeProps();
    p.pulloutDirection = 1.1 as ToolPulloutDirection;
    p.quadrant = 1.1 as BotOriginQuadrant;
    const wrapper = svgMount(<ToolbaySlot {...p} />);
    expect(wrapper.find("use").props().transform).toEqual("rotate(0, 10, 20)");
  });

  it("is not clickable when occupied", () => {
    const p = fakeProps();
    p.occupied = true;
    const wrapper = svgMount(<ToolbaySlot {...p} />);
    expect(wrapper.find("use").props().style?.pointerEvents).toEqual("none");
  });

  it("is clickable when unoccupied", () => {
    const p = fakeProps();
    p.occupied = false;
    const wrapper = svgMount(<ToolbaySlot {...p} />);
    expect(wrapper.find("use").props().style).toEqual({});
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
    const wrapper = svgMount(<RotatedTool {...p} />);
    const target = wrapper.find("use");
    target.simulate("mouseOver");
    expect(p.toolProps.dispatch).toHaveBeenCalledWith({
      type: Actions.HOVER_TOOL_SLOT, payload: "fakeUuid"
    });
    target.simulate("mouseLeave");
    expect(p.toolProps.dispatch).toHaveBeenCalledWith({
      type: Actions.HOVER_TOOL_SLOT, payload: undefined
    });
  });

  it("renders empty tool slot styling", () => {
    const p = fakeProps();
    p.tool = ToolName.emptyToolSlot;
    const wrapper = svgMount(<RotatedTool {...p} />);
    const props = wrapper.find("circle").last().props();
    expect(props.r).toEqual(34);
    expect(props.fill).toEqual("none");
    expect(props.strokeDasharray).toEqual("10 5");
  });

  it("renders empty tool slot hover styling", () => {
    const p = fakeProps();
    p.tool = ToolName.emptyToolSlot;
    p.toolProps.hovered = true;
    const wrapper = svgMount(<RotatedTool {...p} />);
    const props = wrapper.find("circle").first().props();
    expect(props.fill).toEqual(Color.darkGray);
  });

  it("renders standard tool styling", () => {
    const wrapper = svgMount(<RotatedTool {...fakeProps()} />);
    const props = wrapper.find("circle").last().props();
    expect(props.r).toEqual(35);
    expect(props.cx).toEqual(10);
    expect(props.cy).toEqual(20);
    expect(props.fill).toEqual(Color.mediumGray);
    expect(wrapper.html()).toContain("rotate(-90");
  });

  it("renders flipped tool styling", () => {
    const p = fakeProps();
    p.toolProps.flipped = true;
    const wrapper = svgMount(<RotatedTool {...p} />);
    expect(wrapper.html()).toContain("rotate(90");
  });

  it("renders tool hover styling", () => {
    const p = fakeProps();
    p.toolProps.hovered = true;
    const wrapper = svgMount(<RotatedTool {...p} />);
    const props = wrapper.find("circle").last().props();
    expect(props.fill).toEqual(Color.darkGray);
  });

  it("renders special tool styling: rotary tool", () => {
    const p = fakeProps();
    p.tool = ToolName.rotaryTool;
    const wrapper = svgMount(<RotatedTool {...p} />);
    const elements = wrapper.find("#rotary-tool").find("rect");
    expect(elements.length).toEqual(1);
  });

  it("renders rotary tool hover styling", () => {
    const p = fakeProps();
    p.tool = ToolName.rotaryTool;
    p.toolProps.hovered = true;
    const wrapper = svgMount(<RotatedTool {...p} />);
    expect(wrapper.find("#rotary-tool").find("circle").last()
      .props().fillOpacity).toEqual(0.1);
  });

  it("renders special tool styling: weeder", () => {
    const p = fakeProps();
    p.tool = ToolName.weeder;
    const wrapper = svgMount(<RotatedTool {...p} />);
    const elements = wrapper.find("#weeder").find("rect");
    expect(elements.length).toEqual(1);
  });

  it("renders weeder hover styling", () => {
    const p = fakeProps();
    p.tool = ToolName.weeder;
    p.toolProps.hovered = true;
    const wrapper = svgMount(<RotatedTool {...p} />);
    expect(wrapper.find("#weeder").find("circle").last()
      .props().fillOpacity).toEqual(0.1);
  });

  it("renders special tool styling: watering nozzle", () => {
    const p = fakeProps();
    p.tool = ToolName.wateringNozzle;
    const wrapper = svgMount(<RotatedTool {...p} />);
    const elements = wrapper.find("#watering-nozzle").find("rect");
    expect(elements.length).toEqual(3);
  });

  it("renders watering nozzle hover styling", () => {
    const p = fakeProps();
    p.tool = ToolName.wateringNozzle;
    p.toolProps.hovered = true;
    const wrapper = svgMount(<RotatedTool {...p} />);
    expect(wrapper.find("#watering-nozzle").find("circle").last()
      .props().fillOpacity).toEqual(0.1);
  });

  it("renders special tool styling: seeder", () => {
    const p = fakeProps();
    p.tool = ToolName.seeder;
    const wrapper = svgMount(<RotatedTool {...p} />);
    const elements = wrapper.find("#seeder").find("circle");
    expect(elements.length).toEqual(4);
  });

  it("renders seeder hover styling", () => {
    const p = fakeProps();
    p.tool = ToolName.seeder;
    p.toolProps.hovered = true;
    const wrapper = svgMount(<RotatedTool {...p} />);
    expect(wrapper.find("#seeder").find("circle").last()
      .props().fillOpacity).toEqual(0.1);
  });

  it("renders special tool styling: soil sensor", () => {
    const p = fakeProps();
    p.tool = ToolName.soilSensor;
    const wrapper = svgMount(<RotatedTool {...p} />);
    const elements = wrapper.find("#soil-sensor").find("rect");
    expect(elements.length).toEqual(5);
  });

  it("renders soil sensor hover styling", () => {
    const p = fakeProps();
    p.tool = ToolName.soilSensor;
    p.toolProps.hovered = true;
    const wrapper = svgMount(<RotatedTool {...p} />);
    expect(wrapper.find("#soil-sensor").find("circle").last()
      .props().fillOpacity).toEqual(0.1);
  });

  it("renders special tool styling: bin", () => {
    const p = fakeProps();
    p.tool = ToolName.seedBin;
    const wrapper = svgMount(<RotatedTool {...p} />);
    const elements = wrapper.find("#seed-bin").find("circle");
    expect(elements.length).toEqual(2);
    expect(elements.last().props().fill).toEqual("url(#SeedBinGradient)");
  });

  it("renders bin hover styling", () => {
    const p = fakeProps();
    p.tool = ToolName.seedBin;
    p.toolProps.hovered = true;
    const wrapper = svgMount(<RotatedTool {...p} />);
    expect(wrapper.find("#seed-bin").find("circle").length).toEqual(3);
  });

  it("renders special tool styling: tray", () => {
    const p = fakeProps();
    p.tool = ToolName.seedTray;
    const wrapper = svgMount(<RotatedTool {...p} />);
    const elements = wrapper.find("#seed-tray");
    expect(elements.find("circle").length).toEqual(2);
    expect(elements.find("rect").length).toEqual(1);
    expect(elements.find("rect").props().fill).toEqual("url(#SeedTrayPattern)");
  });

  it("renders tray hover styling", () => {
    const p = fakeProps();
    p.tool = ToolName.seedTray;
    p.toolProps.hovered = true;
    const wrapper = svgMount(<RotatedTool {...p} />);
    expect(wrapper.find("#seed-tray").find("circle").length).toEqual(3);
  });

  it("renders special tool styling: trough", () => {
    const p = fakeProps();
    p.tool = ToolName.seedTrough;
    const wrapper = svgMount(<RotatedTool {...p} />);
    const elements = wrapper.find("#seed-trough");
    expect(elements.find("circle").length).toEqual(0);
    expect(elements.find("rect").length).toEqual(1);
  });

  it("renders trough hover styling", () => {
    const p = fakeProps();
    p.tool = ToolName.seedTrough;
    p.toolProps.hovered = true;
    const wrapper = svgMount(<RotatedTool {...p} />);
    expect(wrapper.find("#seed-trough").find("circle").length).toEqual(0);
    expect(wrapper.find("#seed-trough").find("rect").length).toEqual(1);
  });
});

describe("<ToolSVG />", () => {
  const fakeProps = (): ToolSVGProps => ({
    toolName: "seed trough",
  });

  it("renders trough", () => {
    const wrapper = shallow(<ToolSVG {...fakeProps()} />);
    expect(wrapper.find("svg").props().viewBox).toEqual("-40 0 80 1");
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
    const wrapper = shallow(<ToolSlotSVG {...p} />);
    expect(wrapper.find(ToolbaySlot).length).toEqual(1);
    expect(wrapper.html()).not.toContain("side");
  });

  it("renders slot side", () => {
    const p = fakeProps();
    p.profile = true;
    p.toolSlot.body.pullout_direction = ToolPulloutDirection.POSITIVE_Y;
    const wrapper = shallow(<ToolSlotSVG {...p} />);
    expect(wrapper.html()).toContain("side");
  });

  it("doesn't render slot", () => {
    const p = fakeProps();
    p.toolSlot.body.pullout_direction = ToolPulloutDirection.NONE;
    const wrapper = shallow(<ToolSlotSVG {...p} />);
    expect(wrapper.find(ToolbaySlot).length).toEqual(0);
  });
});
