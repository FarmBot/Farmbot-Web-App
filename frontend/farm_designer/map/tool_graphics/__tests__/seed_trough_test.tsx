import React from "react";
import { svgMount } from "../../../../__test_support__/svg_mount";
import { GantryToolSlotGraphicProps, ToolGraphicProps } from "../interfaces";
import { GantryToolSlot, SeedTrough, troughSize } from "../seed_trough";
import { ToolPulloutDirection } from "farmbot/dist/resources/api_resources";
import {
  fakeToolTransformProps,
} from "../../../../__test_support__/fake_tool_info";

describe("troughSize()", () => {
  it("returns correct size", () => {
    expect(troughSize(false)).toEqual({ width: 47.5, height: 22.5 });
    expect(troughSize(true)).toEqual({ width: 22.5, height: 47.5 });
  });
});

describe("<GantryToolSlot />", () => {
  const fakeProps = (): GantryToolSlotGraphicProps => ({
    x: 0,
    y: 0,
    xySwap: false,
  });

  it("renders slot", () => {
    const mounted = svgMount(<GantryToolSlot {...fakeProps()} />) as
      | { container?: HTMLElement; html?: () => string };
    const html = typeof mounted.html == "function"
      ? mounted.html()
      : mounted.container?.innerHTML || "";
    expect(html).toContain("gantry-toolbay-slot");
  });
});

describe("<SeedTrough />", () => {
  const fakeProps = (): ToolGraphicProps => ({
    toolName: "seed trough",
    x: 0,
    y: 0,
    hovered: false,
    dispatch: jest.fn(),
    pulloutDirection: ToolPulloutDirection.NONE,
    flipped: false,
    toolTransformProps: fakeToolTransformProps(),
    uuid: undefined,
  });

  it("renders seed trough", () => {
    const mounted = svgMount(<SeedTrough {...fakeProps()} />) as
      | { container?: HTMLElement; html?: () => string };
    const html = typeof mounted.html == "function"
      ? mounted.html()
      : mounted.container?.innerHTML || "";
    expect(html).toContain("seed-trough");
  });
});
