import React from "react";
import {
  fakeToolTransformProps,
} from "../../../../__test_support__/fake_tool_info";
import { svgMount } from "../../../../__test_support__/svg_mount";
import {
  getToolColor, Tool, ToolImplementProfile,
} from "../all_tools";
import { ToolImplementProfileProps, ToolProps } from "../interfaces";
import { ToolType } from "farmbot/dist/resources/api_resources";

describe("getToolColor()", () => {
  it.each<[ToolType, string]>([
    ["rotary_tool", "rgba(238, 102, 102)"],
    ["weeder", "rgba(238, 102, 102)"],
    ["watering_nozzle", "rgba(40, 120, 220)"],
    ["seeder", "rgba(240, 200, 0)"],
    ["soil_sensor", "rgba(128, 128, 128)"],
    ["seed_bin", "rgba(128, 128, 128)"],
    ["seed_tray", "rgba(128, 128, 128)"],
    ["seed_trough", "rgba(128, 128, 128)"],
    ["none", "rgba(102, 102, 102)"],
  ])("returns %s tool color", (toolType, expected) => {
    expect(getToolColor(toolType)).toEqual(expected);
  });

  it("returns default color without a tool", () => {
    expect(getToolColor(undefined)).toEqual("rgba(102, 102, 102)");
  });
});

describe("<Tool />", () => {
  const fakeProps = (): ToolProps => ({
    toolType: "seeder",
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
    const p = fakeProps();
    p.toolProps.toolName = "arbitrary name";
    const wrapper = svgMount(<Tool {...p} />);
    expect(wrapper.container.innerHTML).toContain("seeder");
  });

  it("distinguishes a custom tool from an empty slot", () => {
    const p = fakeProps();
    p.toolType = "none";
    const custom = svgMount(<Tool {...p} />);
    expect(custom.container.querySelector("#tool")).toBeTruthy();
    p.toolType = undefined;
    const empty = svgMount(<Tool {...p} />);
    expect(empty.container.querySelector("#empty-tool-slot")).toBeTruthy();
  });
});

describe("<ToolImplementProfile />", () => {
  const fakeProps = (): ToolImplementProfileProps => ({
    toolType: "seeder",
    x: 0,
    y: 0,
    toolFlipped: false,
    sideView: false,
  });

  it("renders correct tool profile", () => {
    const wrapper = svgMount(<ToolImplementProfile {...fakeProps()} />);
    expect(wrapper.container.innerHTML).toContain("seeder-implement-profile");
  });
});
