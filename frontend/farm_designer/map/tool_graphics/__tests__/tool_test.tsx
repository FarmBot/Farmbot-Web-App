import React from "react";
import { svgMount } from "../../../../__test_support__/svg_mount";
import { EmptySlot, StandardTool } from "../tool";
import { ToolGraphicProps } from "../interfaces";
import { ToolPulloutDirection } from "farmbot/dist/resources/api_resources";
import {
  fakeToolTransformProps,
} from "../../../../__test_support__/fake_tool_info";

describe("<StandardTool />", () => {
  const fakeProps = (): ToolGraphicProps => ({
    toolName: "tool",
    x: 0,
    y: 0,
    hovered: false,
    dispatch: jest.fn(),
    pulloutDirection: ToolPulloutDirection.NONE,
    flipped: false,
    toolTransformProps: fakeToolTransformProps(),
    uuid: undefined,
  });

  it("renders tool", () => {
    const wrapper = svgMount(<StandardTool {...fakeProps()} />);
    expect(wrapper.html()).toContain("tool");
  });
});

describe("<EmptySlot />", () => {
  const fakeProps = (): ToolGraphicProps => ({
    toolName: undefined,
    x: 0,
    y: 0,
    hovered: false,
    dispatch: jest.fn(),
    pulloutDirection: ToolPulloutDirection.NONE,
    flipped: false,
    toolTransformProps: fakeToolTransformProps(),
    uuid: undefined,
  });

  it("renders tool", () => {
    const wrapper = svgMount(<EmptySlot {...fakeProps()} />);
    expect(wrapper.html()).toContain("empty-tool-slot");
  });
});
