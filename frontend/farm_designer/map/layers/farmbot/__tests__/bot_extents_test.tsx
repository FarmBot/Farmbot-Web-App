import React from "react";
import { BotExtents } from "../bot_extents";
import { render } from "@testing-library/react";
import { bot } from "../../../../../__test_support__/fake_state/bot";
import { BotExtentsProps } from "../../../interfaces";
import {
  fakeMapTransformProps,
} from "../../../../../__test_support__/map_transform_props";

describe("<VirtualFarmBot/>", () => {
  function fakeProps(): BotExtentsProps {
    const mcuParams = bot.hardware.mcu_params;
    mcuParams.movement_stop_at_home_x = 1;
    mcuParams.movement_stop_at_home_y = 1;
    return {
      mapTransformProps: fakeMapTransformProps(),
      stopAtHome: { x: true, y: true },
      botSize: {
        x: { value: 3000, isDefault: true },
        y: { value: 1500, isDefault: true },
        z: { value: 400, isDefault: true },
      }
    };
  }

  const renderExtents = (props: BotExtentsProps) =>
    render(<svg><BotExtents {...props} /></svg>);

  const lineProps = (line: Element) => ({
    x1: Number(line.getAttribute("x1")),
    x2: Number(line.getAttribute("x2")),
    y1: Number(line.getAttribute("y1")),
    y2: Number(line.getAttribute("y2")),
  });

  const lines = (container: HTMLElement, selector: string) =>
    Array.from(container.querySelectorAll(selector));

  it("renders home lines", () => {
    const p = fakeProps();
    const { container } = renderExtents(p);
    const home = lines(container, "#home-lines line");
    expect(lineProps(home[0])).toEqual({ x1: 2, x2: 2, y1: 2, y2: 1500 });
    expect(lineProps(home[1])).toEqual({ x1: 2, x2: 3000, y1: 2, y2: 2 });
    const max = lines(container, "#max-lines line");
    expect(max.length).toEqual(0);
  });

  it("renders home and max lines", () => {
    const p = fakeProps();
    p.botSize = {
      x: { value: 100, isDefault: false },
      y: { value: 100, isDefault: false },
      z: { value: 400, isDefault: true },
    };
    const { container } = renderExtents(p);
    const home = lines(container, "#home-lines line");
    expect(lineProps(home[0])).toEqual({ x1: 2, x2: 2, y1: 2, y2: 100 });
    expect(lineProps(home[1])).toEqual({ x1: 2, x2: 100, y1: 2, y2: 2 });
    const max = lines(container, "#max-lines line");
    expect(lineProps(max[0])).toEqual({ x1: 100, x2: 100, y1: 2, y2: 100 });
    expect(lineProps(max[1])).toEqual({ x1: 2, x2: 100, y1: 100, y2: 100 });
  });

  it("renders home and max lines for one axis only", () => {
    const p = fakeProps();
    p.stopAtHome.x = false;
    p.botSize = {
      x: { value: 3000, isDefault: true },
      y: { value: 100, isDefault: false },
      z: { value: 400, isDefault: true },
    };
    const { container } = renderExtents(p);
    const home = lines(container, "#home-lines line");
    expect(lineProps(home[0])).toEqual({ x1: 2, x2: 3000, y1: 2, y2: 2 });
    expect(home.length).toEqual(1);
    const max = lines(container, "#max-lines line");
    expect(lineProps(max[0])).toEqual({ x1: 2, x2: 3000, y1: 100, y2: 100 });
    expect(max.length).toEqual(1);
  });

  it("renders max lines", () => {
    const p = fakeProps();
    p.stopAtHome.x = false;
    p.stopAtHome.y = false;
    p.botSize = {
      x: { value: 100, isDefault: false },
      y: { value: 100, isDefault: false },
      z: { value: 400, isDefault: true },
    };
    const { container } = renderExtents(p);
    const home = lines(container, "#home-lines line");
    expect(home.length).toEqual(0);
    const max = lines(container, "#max-lines line");
    expect(lineProps(max[0])).toEqual({ x1: 100, x2: 100, y1: 2, y2: 100 });
    expect(lineProps(max[1])).toEqual({ x1: 2, x2: 100, y1: 100, y2: 100 });
  });

  it("renders home and max lines in correct location for quadrant 1", () => {
    const p = fakeProps();
    p.mapTransformProps.quadrant = 1;
    p.botSize = {
      x: { value: 100, isDefault: false },
      y: { value: 100, isDefault: false },
      z: { value: 400, isDefault: true },
    };
    const { container } = renderExtents(p);
    const home = lines(container, "#home-lines line");
    expect(lineProps(home[0])).toEqual({
      x1: 2998, x2: 2998, y1: 2, y2: 100,
    });
    expect(lineProps(home[1])).toEqual({
      x1: 2998, x2: 2900, y1: 2, y2: 2,
    });
    const max = lines(container, "#max-lines line");
    expect(lineProps(max[0])).toEqual({
      x1: 2900, x2: 2900, y1: 2, y2: 100,
    });
    expect(lineProps(max[1])).toEqual({
      x1: 2998, x2: 2900, y1: 100, y2: 100,
    });
  });

  it("renders max line in correct location", () => {
    const p = fakeProps();
    p.stopAtHome.x = false;
    p.stopAtHome.y = false;
    p.botSize = {
      x: { value: 100, isDefault: false },
      y: { value: 100, isDefault: true },
      z: { value: 400, isDefault: true },
    };
    const { container } = renderExtents(p);
    const max = lines(container, "#max-lines line");
    expect(lineProps(max[0])).toEqual({ x1: 100, x2: 100, y1: 2, y2: 100 });
  });

  it("renders max line in correct location with swapped axes", () => {
    const p = fakeProps();
    p.stopAtHome.x = false;
    p.stopAtHome.y = false;
    p.mapTransformProps.xySwap = true;
    p.botSize = {
      x: { value: 100, isDefault: false },
      y: { value: 100, isDefault: true },
      z: { value: 400, isDefault: true },
    };
    const { container } = renderExtents(p);
    const max = lines(container, "#max-lines line");
    expect(lineProps(max[0])).toEqual({ x1: 2, x2: 100, y1: 100, y2: 100 });
  });

  it("renders no lines", () => {
    const p = fakeProps();
    p.stopAtHome.x = false;
    p.stopAtHome.y = false;
    const { container } = renderExtents(p);
    const home = lines(container, "#home-lines line");
    expect(home.length).toEqual(0);
    const max = lines(container, "#max-lines line");
    expect(max.length).toEqual(0);
  });
});
