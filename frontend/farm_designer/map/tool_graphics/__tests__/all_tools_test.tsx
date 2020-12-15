import React from "react";
import {
  fakeToolTransformProps,
} from "../../../../__test_support__/fake_tool_info";
import { svgMount } from "../../../../__test_support__/svg_mount";
import {
  getToolColor, reduceToolName, Tool, ToolImplementProfile, ToolName,
} from "../all_tools";
import { ToolImplementProfileProps, ToolProps } from "../interfaces";

describe("getToolColor()", () => {
  it("returns tool color", () => {
    expect(getToolColor("weeder")).toEqual("rgba(238, 102, 102)");
    expect(getToolColor("N/A")).toEqual("rgba(102, 102, 102)");
  });
});

describe("reduceToolName()", () => {
  it("returns tool name", () => {
    expect(reduceToolName("SEEDER")).toEqual(ToolName.seeder);
  });
});

describe("<Tool />", () => {
  const fakeProps = (): ToolProps => ({
    tool: ToolName.seeder,
    toolProps: {
      toolName: "seeder",
      x: 10,
      y: 20,
      hovered: false,
      dispatch: jest.fn(),
      uuid: "fakeUuid",
      toolTransformProps: fakeToolTransformProps(),
      pulloutDirection: 0,
      flipped: false,
    },
  });

  it("renders correct tool graphic", () => {
    const wrapper = svgMount(<Tool {...fakeProps()} />);
    expect(wrapper.html()).toContain("seeder");
  });
});

describe("<ToolImplementProfile />", () => {
  const fakeProps = (): ToolImplementProfileProps => ({
    toolName: ToolName.seeder,
    x: 0,
    y: 0,
    toolFlipped: false,
    sideView: false,
  });

  it("renders correct tool profile", () => {
    const wrapper = svgMount(<ToolImplementProfile {...fakeProps()} />);
    expect(wrapper.html()).toContain("seeder-implement-profile");
  });
});
