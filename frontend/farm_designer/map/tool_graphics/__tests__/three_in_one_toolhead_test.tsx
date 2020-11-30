import React from "react";
import {
  fakeToolTransformProps,
} from "../../../../__test_support__/fake_tool_info";
import { svgMount } from "../../../../__test_support__/svg_mount";
import { ThreeInOneToolHeadProps } from "../interfaces";
import { ThreeInOneToolHead } from "../three_in_one_toolhead";
import { ToolPulloutDirection } from "farmbot/dist/resources/api_resources";

describe("<ThreeInOneToolHead />", () => {
  const fakeProps = (): ThreeInOneToolHeadProps => ({
    x: 0,
    y: 0,
    color: "gray",
    toolTransformProps: fakeToolTransformProps(),
    pulloutDirection: ToolPulloutDirection.NONE,
  });

  it("renders toolhead", () => {
    const wrapper = svgMount(<ThreeInOneToolHead {...fakeProps()} />);
    expect(wrapper.html()).toContain("three-in-one-tool-head");
  });
});
