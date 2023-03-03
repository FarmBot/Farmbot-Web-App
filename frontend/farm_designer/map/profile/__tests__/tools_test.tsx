import React from "react";
import { svgMount } from "../../../../__test_support__/svg_mount";
import { ToolProfilePoint, UTMProfile } from "../tools";
import { ProfilePointProps, ProfileUtmProps } from "../interfaces";
import {
  fakeTool, fakeToolSlot,
} from "../../../../__test_support__/fake_state/resources";
import { TaggedToolSlotPointer } from "farmbot";
import { fakeMountedToolInfo } from "../../../../__test_support__/fake_tool_info";
import {
  fakeDesignerState,
} from "../../../../__test_support__/fake_designer_state";

describe("<ToolProfilePoint />", () => {
  const fakeProps = (): ProfilePointProps<TaggedToolSlotPointer> => ({
    point: fakeToolSlot(),
    tools: [fakeTool()],
    getX: () => 0,
    profileAxis: "x",
    reversed: false,
    soilHeight: 0,
    getConfigValue: () => true,
    designer: fakeDesignerState(),
  });

  it("renders tool profile", () => {
    const p = fakeProps();
    const tool = fakeTool();
    tool.body.id = 1;
    tool.body.name = "seeder";
    const slot = fakeToolSlot();
    slot.body.tool_id = 1;
    p.point = slot;
    p.tools = [tool];
    const wrapper = svgMount(<ToolProfilePoint {...p} />);
    expect(wrapper.html()).toContain("seeder-implement-profile");
  });
});

describe("<UTMProfile />", () => {
  const fakeProps = (): ProfileUtmProps => ({
    getX: () => 0,
    profileAxis: "y",
    reversed: false,
    expanded: true,
    selectionWidth: 100,
    position: { x: 0, y: 0 },
    botPosition: { x: 0, y: 0, z: 0 },
    mountedToolInfo: fakeMountedToolInfo(),
    gantryHeight: 0,
  });

  it("renders front view", () => {
    const p = fakeProps();
    p.mountedToolInfo.name = "soil sensor";
    p.profileAxis = "y";
    const wrapper = svgMount(<UTMProfile {...p} />);
    expect(wrapper.html()).toContain("front");
    expect(wrapper.html()).not.toContain("side");
  });

  it("renders side view", () => {
    const p = fakeProps();
    p.mountedToolInfo.name = "soil sensor";
    p.profileAxis = "x";
    const wrapper = svgMount(<UTMProfile {...p} />);
    expect(wrapper.html()).not.toContain("front");
    expect(wrapper.html()).toContain("side");
  });
});
