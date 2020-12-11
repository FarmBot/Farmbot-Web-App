import React from "react";
import { svgMount } from "../../../../__test_support__/svg_mount";
import { SpecificToolProfileProps, ToolGraphicProps } from "../interfaces";
import { Seeder, SeederImplementProfile } from "../seeder";
import { ToolPulloutDirection } from "farmbot/dist/resources/api_resources";
import {
  fakeToolTransformProps,
} from "../../../../__test_support__/fake_tool_info";

describe("<Seeder />", () => {
  const fakeProps = (): ToolGraphicProps => ({
    toolName: "seeder",
    x: 0,
    y: 0,
    hovered: false,
    dispatch: jest.fn(),
    pulloutDirection: ToolPulloutDirection.NONE,
    flipped: false,
    toolTransformProps: fakeToolTransformProps(),
    uuid: undefined,
  });

  it("renders seeder", () => {
    const wrapper = svgMount(<Seeder {...fakeProps()} />);
    expect(wrapper.html()).toContain("seeder");
  });
});

describe("<SeederImplementProfile />", () => {
  const fakeProps = (): SpecificToolProfileProps => ({
    x: 0,
    y: 0,
    toolFlipped: false,
    sideView: false,
  });

  it("renders seeder profile", () => {
    const wrapper = svgMount(<SeederImplementProfile {...fakeProps()} />);
    expect(wrapper.html()).toContain("seeder-implement-profile");
  });
});
