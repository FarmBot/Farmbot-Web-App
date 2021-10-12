import React from "react";
import { svgMount } from "../../../../__test_support__/svg_mount";
import { SpecificToolProfileProps, ToolGraphicProps } from "../interfaces";
import { RotaryTool, RotaryToolImplementProfile } from "../rotary_tool";
import { ToolPulloutDirection } from "farmbot/dist/resources/api_resources";
import {
  fakeToolTransformProps,
} from "../../../../__test_support__/fake_tool_info";

describe("<RotaryTool />", () => {
  const fakeProps = (): ToolGraphicProps => ({
    toolName: "rotary",
    x: 0,
    y: 0,
    hovered: false,
    dispatch: jest.fn(),
    pulloutDirection: ToolPulloutDirection.NONE,
    flipped: false,
    toolTransformProps: fakeToolTransformProps(),
    uuid: undefined,
  });

  it("renders rotary tool", () => {
    const wrapper = svgMount(<RotaryTool {...fakeProps()} />);
    expect(wrapper.html()).toContain("rotary-tool");
  });
});

describe("<RotaryToolImplementProfile />", () => {
  const fakeProps = (): SpecificToolProfileProps => ({
    x: 0,
    y: 0,
    toolFlipped: false,
    sideView: false,
  });

  it("renders rotary tool profile", () => {
    const wrapper = svgMount(<RotaryToolImplementProfile {...fakeProps()} />);
    expect(wrapper.html()).toContain("rotary-tool-implement-profile");
  });
});
