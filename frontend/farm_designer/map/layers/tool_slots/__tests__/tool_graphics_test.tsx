import * as React from "react";
import {
  ToolbaySlot, Tool, ToolProps, ToolGraphicProps, ToolSlotGraphicProps,
  ToolNames, ToolSVG, ToolSVGProps, ToolSlotSVG, ToolSlotSVGProps,
} from "../tool_graphics";
import { BotOriginQuadrant } from "../../../../interfaces";
import { Color } from "../../../../../ui";
import { svgMount } from "../../../../../__test_support__/svg_mount";
import { Actions } from "../../../../../constants";
import { shallow } from "enzyme";
import { fakeToolSlot } from "../../../../../__test_support__/fake_state/resources";
import { ToolPulloutDirection } from "farmbot/dist/resources/api_resources";

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
    p.pulloutDirection = 1.1;
    p.quadrant = 1.1;
    const wrapper = svgMount(<ToolbaySlot {...p} />);
    expect(wrapper.find("use").props().transform).toEqual("rotate(0, 10, 20)");
  });
});

describe("<Tool/>", () => {
  const fakeToolProps = (): ToolGraphicProps => ({
    x: 10,
    y: 20,
    hovered: false,
    dispatch: jest.fn(),
    uuid: "fakeUuid",
    xySwap: false,
  });

  const fakeProps = (): ToolProps => ({
    tool: "fake tool",
    toolProps: fakeToolProps()
  });

  const testHoverActions = (toolName: string) => {
    const p = fakeProps();
    p.tool = toolName;
    const wrapper = svgMount(<Tool {...p} />);
    wrapper.find("g").simulate("mouseOver");
    expect(p.toolProps.dispatch).toHaveBeenCalledWith({
      type: Actions.HOVER_TOOL_SLOT, payload: "fakeUuid"
    });
    wrapper.find("g").simulate("mouseLeave");
    expect(p.toolProps.dispatch).toHaveBeenCalledWith({
      type: Actions.HOVER_TOOL_SLOT, payload: undefined
    });
  };

  it("renders empty tool slot styling", () => {
    const p = fakeProps();
    p.tool = ToolNames.emptyToolSlot;
    const wrapper = svgMount(<Tool {...p} />);
    const props = wrapper.find("circle").last().props();
    expect(props.r).toEqual(34);
    expect(props.fill).toEqual("none");
    expect(props.strokeDasharray).toEqual("10 5");
  });

  it("renders empty tool slot hover styling", () => {
    const p = fakeProps();
    p.tool = ToolNames.emptyToolSlot;
    p.toolProps.hovered = true;
    const wrapper = svgMount(<Tool {...p} />);
    const props = wrapper.find("circle").first().props();
    expect(props.fill).toEqual(Color.darkGray);
  });

  it("sets hover state for empty tool slot", () => {
    testHoverActions(ToolNames.emptyToolSlot);
  });

  it("renders standard tool styling", () => {
    const wrapper = svgMount(<Tool {...fakeProps()} />);
    const props = wrapper.find("circle").last().props();
    expect(props.r).toEqual(35);
    expect(props.cx).toEqual(10);
    expect(props.cy).toEqual(20);
    expect(props.fill).toEqual(Color.mediumGray);
  });

  it("renders tool hover styling", () => {
    const p = fakeProps();
    p.toolProps.hovered = true;
    const wrapper = svgMount(<Tool {...p} />);
    const props = wrapper.find("circle").last().props();
    expect(props.fill).toEqual(Color.darkGray);
  });

  it("sets hover state for tool", () => {
    testHoverActions(ToolNames.tool);
  });

  it("renders special tool styling: weeder", () => {
    const p = fakeProps();
    p.tool = ToolNames.weeder;
    const wrapper = svgMount(<Tool {...p} />);
    const elements = wrapper.find("#weeder").find("line");
    expect(elements.length).toEqual(2);
  });

  it("renders weeder hover styling", () => {
    const p = fakeProps();
    p.tool = ToolNames.weeder;
    p.toolProps.hovered = true;
    const wrapper = svgMount(<Tool {...p} />);
    expect(wrapper.find("#weeder").find("circle").props().fill)
      .toEqual(Color.darkGray);
  });

  it("sets hover state for weeder", () => {
    testHoverActions(ToolNames.weeder);
  });

  it("renders special tool styling: watering nozzle", () => {
    const p = fakeProps();
    p.tool = ToolNames.wateringNozzle;
    const wrapper = svgMount(<Tool {...p} />);
    const elements = wrapper.find("#watering-nozzle").find("circle");
    expect(elements.length).toEqual(3);
  });

  it("renders watering nozzle hover styling", () => {
    const p = fakeProps();
    p.tool = ToolNames.wateringNozzle;
    p.toolProps.hovered = true;
    const wrapper = svgMount(<Tool {...p} />);
    expect(wrapper.find("#watering-nozzle").find("circle").at(1).props().fill)
      .toEqual(Color.darkGray);
  });

  it("sets hover state for watering nozzle", () => {
    testHoverActions(ToolNames.wateringNozzle);
  });

  it("renders special tool styling: seeder", () => {
    const p = fakeProps();
    p.tool = ToolNames.seeder;
    const wrapper = svgMount(<Tool {...p} />);
    const elements = wrapper.find("#seeder").find("circle");
    expect(elements.length).toEqual(2);
  });

  it("renders seeder hover styling", () => {
    const p = fakeProps();
    p.tool = ToolNames.seeder;
    p.toolProps.hovered = true;
    const wrapper = svgMount(<Tool {...p} />);
    expect(wrapper.find("#seeder").find("circle").first().props().fill)
      .toEqual(Color.darkGray);
  });

  it("sets hover state for seeder", () => {
    testHoverActions(ToolNames.seeder);
  });

  it("renders special tool styling: soil sensor", () => {
    const p = fakeProps();
    p.tool = ToolNames.soilSensor;
    const wrapper = svgMount(<Tool {...p} />);
    const elements = wrapper.find("#soil-sensor").find("line");
    expect(elements.length).toEqual(2);
  });

  it("renders soil sensor hover styling", () => {
    const p = fakeProps();
    p.tool = ToolNames.soilSensor;
    p.toolProps.hovered = true;
    const wrapper = svgMount(<Tool {...p} />);
    expect(wrapper.find("#soil-sensor").find("circle").props().fill)
      .toEqual(Color.darkGray);
  });

  it("sets hover state for soil sensor", () => {
    testHoverActions(ToolNames.soilSensor);
  });

  it("renders special tool styling: bin", () => {
    const p = fakeProps();
    p.tool = ToolNames.seedBin;
    const wrapper = svgMount(<Tool {...p} />);
    const elements = wrapper.find("#seed-bin").find("circle");
    expect(elements.length).toEqual(2);
    expect(elements.last().props().fill).toEqual("url(#SeedBinGradient)");
  });

  it("renders bin hover styling", () => {
    const p = fakeProps();
    p.tool = ToolNames.seedBin;
    p.toolProps.hovered = true;
    const wrapper = svgMount(<Tool {...p} />);
    expect(wrapper.find("#seed-bin").find("circle").length).toEqual(3);
  });

  it("sets hover state for bin", () => {
    testHoverActions(ToolNames.seedBin);
  });

  it("renders special tool styling: tray", () => {
    const p = fakeProps();
    p.tool = ToolNames.seedTray;
    const wrapper = svgMount(<Tool {...p} />);
    const elements = wrapper.find("#seed-tray");
    expect(elements.find("circle").length).toEqual(2);
    expect(elements.find("rect").length).toEqual(1);
    expect(elements.find("rect").props().fill).toEqual("url(#SeedTrayPattern)");
  });

  it("renders tray hover styling", () => {
    const p = fakeProps();
    p.tool = ToolNames.seedTray;
    p.toolProps.hovered = true;
    const wrapper = svgMount(<Tool {...p} />);
    expect(wrapper.find("#seed-tray").find("circle").length).toEqual(3);
  });

  it("sets hover state for tray", () => {
    testHoverActions(ToolNames.seedTray);
  });

  it("renders special tool styling: trough", () => {
    const p = fakeProps();
    p.tool = ToolNames.seedTrough;
    const wrapper = svgMount(<Tool {...p} />);
    const elements = wrapper.find("#seed-trough");
    expect(elements.find("circle").length).toEqual(0);
    expect(elements.find("rect").length).toEqual(1);
  });

  it("renders trough hover styling", () => {
    const p = fakeProps();
    p.tool = ToolNames.seedTrough;
    p.toolProps.hovered = true;
    const wrapper = svgMount(<Tool {...p} />);
    expect(wrapper.find("#seed-trough").find("circle").length).toEqual(0);
    expect(wrapper.find("#seed-trough").find("rect").length).toEqual(1);
  });

  it("sets hover state for trough", () => {
    testHoverActions(ToolNames.seedTrough);
  });
});

describe("<ToolSVG />", () => {
  const fakeProps = (): ToolSVGProps => ({
    toolName: "seed trough",
  });

  it("renders trough", () => {
    const wrapper = shallow(<ToolSVG {...fakeProps()} />);
    expect(wrapper.find("svg").props().viewBox).toEqual("-25 0 50 1");
  });
});

describe("<ToolSlotSVG />", () => {
  const fakeProps = (): ToolSlotSVGProps => ({
    toolSlot: fakeToolSlot(),
    toolName: "seeder",
    renderRotation: false,
    xySwap: false,
    quadrant: 2,
  });

  it("renders slot", () => {
    const p = fakeProps();
    p.toolSlot.body.pullout_direction = ToolPulloutDirection.POSITIVE_X;
    const wrapper = shallow(<ToolSlotSVG {...p} />);
    expect(wrapper.find(ToolbaySlot).length).toEqual(1);
  });

  it("doesn't render slot", () => {
    const p = fakeProps();
    p.toolSlot.body.pullout_direction = ToolPulloutDirection.NONE;
    const wrapper = shallow(<ToolSlotSVG {...p} />);
    expect(wrapper.find(ToolbaySlot).length).toEqual(0);
  });
});
