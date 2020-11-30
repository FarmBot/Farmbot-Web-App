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
    expect(troughSize(false)).toEqual({ width: 49, height: 24 });
    expect(troughSize(true)).toEqual({ width: 24, height: 49 });
  });
});

describe("<GantryToolSlot />", () => {
  const fakeProps = (): GantryToolSlotGraphicProps => ({
    x: 0,
    y: 0,
    xySwap: false,
  });

  it("renders slot", () => {
    const wrapper = svgMount(<GantryToolSlot {...fakeProps()} />);
    expect(wrapper.html()).toContain("gantry-toolbay-slot");
  });
});

describe("<SeedTrough />", () => {
  const fakeProps = (): ToolGraphicProps => ({
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
    const wrapper = svgMount(<SeedTrough {...fakeProps()} />);
    expect(wrapper.html()).toContain("seed-trough");
  });
});
