import React from "react";
import { svgMount } from "../../../../__test_support__/svg_mount";
import { ToolGraphicProps } from "../interfaces";
import { WateringNozzle } from "../watering_nozzle";
import { ToolPulloutDirection } from "farmbot/dist/resources/api_resources";
import {
  fakeToolTransformProps,
} from "../../../../__test_support__/fake_tool_info";

describe("<WateringNozzle />", () => {
  const fakeProps = (): ToolGraphicProps => ({
    toolName: "watering nozzle",
    x: 0,
    y: 0,
    hovered: false,
    dispatch: jest.fn(),
    pulloutDirection: ToolPulloutDirection.NONE,
    flipped: false,
    toolTransformProps: fakeToolTransformProps(),
    uuid: undefined,
  });

  it("renders watering nozzle", () => {
    const wrapper = svgMount(<WateringNozzle {...fakeProps()} />);
    expect(wrapper.html()).toContain("watering-nozzle");
  });
});
