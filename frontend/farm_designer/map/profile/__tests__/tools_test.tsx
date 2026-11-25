import React from "react";
import { render } from "@testing-library/react";
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
import {
  MountStage, ToolPulloutDirection,
} from "farmbot/dist/resources/api_resources";

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
    tool.body.name = "arbitrary name";
    tool.body.type = "seeder";
    const slot = fakeToolSlot();
    slot.body.tool_id = 1;
    p.point = slot;
    p.tools = [tool];
    const wrapper = svgMount(<ToolProfilePoint {...p} />);
    expect(wrapper.container.innerHTML).toContain("seeder-implement-profile");
  });

  it("treats a Y-stage slot as mounted", () => {
    const p = fakeProps();
    p.point.body.mount_stage = MountStage.Y;
    p.point.body.pullout_direction = ToolPulloutDirection.POSITIVE_X;
    const wrapper = svgMount(<ToolProfilePoint {...p} />);
    expect(wrapper.container.innerHTML).toContain("no-slot-direction");
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
    p.mountedToolInfo.type = "soil_sensor";
    p.profileAxis = "y";
    const wrapper = svgMount(<UTMProfile {...p} />);
    expect(wrapper.container.innerHTML).toContain("front");
    expect(wrapper.container.innerHTML).not.toContain("side");
  });

  it("renders side view", () => {
    const p = fakeProps();
    p.mountedToolInfo.name = "soil sensor";
    p.mountedToolInfo.type = "soil_sensor";
    p.profileAxis = "x";
    const wrapper = svgMount(<UTMProfile {...p} />);
    expect(wrapper.container.innerHTML).not.toContain("front");
    expect(wrapper.container.innerHTML).toContain("side");
  });

  it("renders liquid ports when no tool is mounted", () => {
    const p = fakeProps();
    p.mountedToolInfo.type = undefined;
    p.getX = () => 100;
    p.botPosition.z = -50;
    const { container } = render(<svg><UTMProfile {...p} /></svg>);
    const ports = container.querySelectorAll("#liquid-ports rect");
    expect(ports).toHaveLength(3);
    expect(Array.from(ports, port => port.getAttribute("x")))
      .toEqual(["76", "116", "96"]);
    ports.forEach(port => {
      expect(port).toHaveAttribute("y", "50");
      expect(port).toHaveAttribute("width", "8");
      expect(port).toHaveAttribute("height", "2");
    });
    expect(container.querySelector("#profile-tool")).not.toBeInTheDocument();
  });
});
