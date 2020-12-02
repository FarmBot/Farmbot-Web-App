import React from "react";
import { svgMount } from "../../../../__test_support__/svg_mount";
import { ToolProfilePoint } from "../tools";
import { ProfilePointProps } from "../interfaces";
import {
  fakeTool, fakeToolSlot,
} from "../../../../__test_support__/fake_state/resources";
import { TaggedToolSlotPointer } from "farmbot";

describe("<ToolProfilePoint />", () => {
  const fakeProps = (): ProfilePointProps<TaggedToolSlotPointer> => ({
    point: fakeToolSlot(),
    tools: [fakeTool()],
    getX: () => 0,
    profileAxis: "x",
    reversed: false,
    soilHeight: 0,
    getConfigValue: () => true,
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
