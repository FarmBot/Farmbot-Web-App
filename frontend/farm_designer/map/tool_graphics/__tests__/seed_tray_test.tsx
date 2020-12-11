import React from "react";
import { svgMount } from "../../../../__test_support__/svg_mount";
import { ToolGraphicProps } from "../interfaces";
import { SeedTray } from "../seed_tray";
import { ToolPulloutDirection } from "farmbot/dist/resources/api_resources";
import {
  fakeToolTransformProps,
} from "../../../../__test_support__/fake_tool_info";

describe("<SeedTray />", () => {
  const fakeProps = (): ToolGraphicProps => ({
    toolName: "seed tray",
    x: 0,
    y: 0,
    hovered: false,
    dispatch: jest.fn(),
    pulloutDirection: ToolPulloutDirection.NONE,
    flipped: false,
    toolTransformProps: fakeToolTransformProps(),
    uuid: undefined,
  });

  it("renders seed tray", () => {
    const wrapper = svgMount(<SeedTray {...fakeProps()} />);
    expect(wrapper.html()).toContain("seed-tray");
  });
});
