import React from "react";
import { svgMount } from "../../../../__test_support__/svg_mount";
import { SpecificToolProfileProps, ToolGraphicProps } from "../interfaces";
import { Weeder, WeederImplementProfile } from "../weeder";
import { ToolPulloutDirection } from "farmbot/dist/resources/api_resources";
import {
  fakeToolTransformProps,
} from "../../../../__test_support__/fake_tool_info";

describe("<Weeder />", () => {
  const fakeProps = (): ToolGraphicProps => ({
    toolName: "weeder",
    x: 0,
    y: 0,
    hovered: false,
    dispatch: jest.fn(),
    pulloutDirection: ToolPulloutDirection.NONE,
    flipped: false,
    toolTransformProps: fakeToolTransformProps(),
    uuid: undefined,
  });

  it("renders weeder", () => {
    const wrapper = svgMount(<Weeder {...fakeProps()} />);
    expect(wrapper.html()).toContain("weeder");
  });
});

describe("<WeederImplementProfile />", () => {
  const fakeProps = (): SpecificToolProfileProps => ({
    x: 0,
    y: 0,
    toolFlipped: false,
    sideView: false,
  });

  it("renders weeder profile", () => {
    const wrapper = svgMount(<WeederImplementProfile {...fakeProps()} />);
    expect(wrapper.html()).toContain("weeder-implement-profile");
  });
});
