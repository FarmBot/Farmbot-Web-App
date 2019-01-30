import * as React from "react";
import { mount } from "enzyme";
import {
  ToolbaySlot, Tool, ToolProps, ToolGraphicProps, ToolSlotGraphicProps
} from "../tool_graphics";
import { BotOriginQuadrant } from "../../../../interfaces";
import { Color } from "../../../../../ui";

describe("<ToolbaySlot />", () => {
  const fakeProps = (): ToolSlotGraphicProps => {
    return {
      id: undefined,
      x: 10,
      y: 20,
      pulloutDirection: 0,
      quadrant: 2,
      xySwap: false,
    };
  };

  const checkSlotDirection =
    (direction: number,
      quadrant: BotOriginQuadrant,
      xySwap: boolean,
      expected: string) => {
      it(`renders slot, pullout: ${direction} quad: ${quadrant} yx: ${xySwap}`,
        () => {
          const p = fakeProps();
          p.pulloutDirection = direction;
          p.quadrant = quadrant;
          p.xySwap = xySwap;
          const wrapper = mount(<ToolbaySlot {...p} />);
          expect(wrapper.find("use").props().transform).toEqual(expected);
        });
    };
  checkSlotDirection(0, 2, false, "rotate(0, 10, 20)");
  checkSlotDirection(1, 1, false, "rotate(180, 10, 20)");
  checkSlotDirection(1, 2, false, "rotate(0, 10, 20)");
  checkSlotDirection(1, 3, false, "rotate(0, 10, 20)");
  checkSlotDirection(1, 4, false, "rotate(180, 10, 20)");
  checkSlotDirection(2, 3, false, "rotate(180, 10, 20)");
  checkSlotDirection(3, 1, false, "rotate(90, 10, 20)");
  checkSlotDirection(3, 2, false, "rotate(90, 10, 20)");
  checkSlotDirection(3, 3, false, "rotate(270, 10, 20)");
  checkSlotDirection(3, 4, false, "rotate(270, 10, 20)");
  checkSlotDirection(4, 3, false, "rotate(90, 10, 20)");

  checkSlotDirection(0, 2, true, "rotate(180, 10, 20)");
  checkSlotDirection(1, 1, true, "rotate(90, 10, 20)");
  checkSlotDirection(1, 2, true, "rotate(90, 10, 20)");
  checkSlotDirection(1, 3, true, "rotate(270, 10, 20)");
  checkSlotDirection(1, 4, true, "rotate(270, 10, 20)");
  checkSlotDirection(2, 3, true, "rotate(90, 10, 20)");
  checkSlotDirection(3, 1, true, "rotate(180, 10, 20)");
  checkSlotDirection(3, 2, true, "rotate(0, 10, 20)");
  checkSlotDirection(3, 3, true, "rotate(0, 10, 20)");
  checkSlotDirection(3, 4, true, "rotate(180, 10, 20)");
  checkSlotDirection(4, 3, true, "rotate(180, 10, 20)");
});

describe("<Tool/>", () => {
  const fakeToolProps = (): ToolGraphicProps => {
    return {
      x: 10,
      y: 20,
      hovered: false,
      setHoverState: jest.fn()
    };
  };

  const fakeProps = (): ToolProps => {
    return {
      tool: "fake tool",
      toolProps: fakeToolProps()
    };
  };

  it("renders standard tool styling", () => {
    const wrapper = mount(<Tool {...fakeProps()} />);
    const props = wrapper.find("circle").last().props();
    expect(props.r).toEqual(35);
    expect(props.cx).toEqual(10);
    expect(props.cy).toEqual(20);
    expect(props.fill).toEqual(Color.mediumGray);
  });

  it("tool hover", () => {
    const p = fakeProps();
    p.toolProps.hovered = true;
    const wrapper = mount(<Tool {...p} />);
    const props = wrapper.find("circle").last().props();
    expect(props.fill).toEqual(Color.darkGray);
  });

  it("renders special tool styling: bin", () => {
    const p = fakeProps();
    p.tool = "seedBin";
    const wrapper = mount(<Tool {...p} />);
    const elements = wrapper.find("#seed-bin").find("circle");
    expect(elements.length).toEqual(2);
    expect(elements.last().props().fill).toEqual("url(#SeedBinGradient)");
  });

  it("bin hover", () => {
    const p = fakeProps();
    p.tool = "seedBin";
    p.toolProps.hovered = true;
    const wrapper = mount(<Tool {...p} />);
    p.toolProps.hovered = true;
    expect(wrapper.find("#seed-bin").find("circle").length).toEqual(3);
  });

  it("renders special tool styling: tray", () => {
    const p = fakeProps();
    p.tool = "seedTray";
    const wrapper = mount(<Tool {...p} />);
    const elements = wrapper.find("#seed-tray");
    expect(elements.find("circle").length).toEqual(2);
    expect(elements.find("rect").length).toEqual(1);
    expect(elements.find("rect").props().fill).toEqual("url(#SeedTrayPattern)");
  });

  it("tray hover", () => {
    const p = fakeProps();
    p.tool = "seedTray";
    p.toolProps.hovered = true;
    const wrapper = mount(<Tool {...p} />);
    p.toolProps.hovered = true;
    expect(wrapper.find("#seed-tray").find("circle").length).toEqual(3);
  });
});
