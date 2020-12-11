import React from "react";
import { svgMount } from "../../../../__test_support__/svg_mount";
import { SpecificToolProfileProps, ToolGraphicProps } from "../interfaces";
import { SeedBin, SeedBinImplementProfile } from "../seed_bin";
import { ToolPulloutDirection } from "farmbot/dist/resources/api_resources";
import {
  fakeToolTransformProps,
} from "../../../../__test_support__/fake_tool_info";

describe("<SeedBin />", () => {
  const fakeProps = (): ToolGraphicProps => ({
    toolName: "seed bin",
    x: 0,
    y: 0,
    hovered: false,
    dispatch: jest.fn(),
    pulloutDirection: ToolPulloutDirection.NONE,
    flipped: false,
    toolTransformProps: fakeToolTransformProps(),
    uuid: undefined,
  });

  it("renders seed bin", () => {
    const wrapper = svgMount(<SeedBin {...fakeProps()} />);
    expect(wrapper.html()).toContain("seed-bin");
  });
});

describe("<SeedBinImplementProfile />", () => {
  const fakeProps = (): SpecificToolProfileProps => ({
    x: 0,
    y: 0,
    toolFlipped: false,
    sideView: false,
  });

  it("renders seed bin profile", () => {
    const wrapper = svgMount(<SeedBinImplementProfile {...fakeProps()} />);
    expect(wrapper.html()).toContain("seed-bin-implement-profile");
  });
});
