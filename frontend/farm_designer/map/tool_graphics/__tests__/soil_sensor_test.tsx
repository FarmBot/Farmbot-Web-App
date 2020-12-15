import React from "react";
import { svgMount } from "../../../../__test_support__/svg_mount";
import { SpecificToolProfileProps, ToolGraphicProps } from "../interfaces";
import { SoilSensor, SoilSensorImplementProfile } from "../soil_sensor";
import { ToolPulloutDirection } from "farmbot/dist/resources/api_resources";
import {
  fakeToolTransformProps,
} from "../../../../__test_support__/fake_tool_info";

describe("<SoilSensor />", () => {
  const fakeProps = (): ToolGraphicProps => ({
    toolName: "soil sensor",
    x: 0,
    y: 0,
    hovered: false,
    dispatch: jest.fn(),
    pulloutDirection: ToolPulloutDirection.NONE,
    flipped: false,
    toolTransformProps: fakeToolTransformProps(),
    uuid: undefined,
  });

  it("renders soil sensor", () => {
    const wrapper = svgMount(<SoilSensor {...fakeProps()} />);
    expect(wrapper.html()).toContain("soil-sensor");
  });
});

describe("<SoilSensorImplementProfile />", () => {
  const fakeProps = (): SpecificToolProfileProps => ({
    x: 0,
    y: 0,
    toolFlipped: false,
    sideView: false,
  });

  it("renders soil sensor profile", () => {
    const wrapper = svgMount(<SoilSensorImplementProfile {...fakeProps()} />);
    expect(wrapper.html()).toContain("soil-sensor-implement-profile");
  });
});
