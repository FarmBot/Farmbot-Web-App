import React from "react";
import { svgMount } from "../../../../__test_support__/svg_mount";
import { ProfileSvg } from "../content";
import { ProfileSvgProps } from "../interfaces";
import { fakeBotSize } from "../../../../__test_support__/fake_bot_data";
import {
  fakePoint, fakeTool, fakeToolSlot,
} from "../../../../__test_support__/fake_state/resources";
import { fakeMountedToolInfo } from "../../../../__test_support__/fake_tool_info";
import { Color } from "../../../../ui";

describe("<ProfileSvg />", () => {
  const fakeProps = (): ProfileSvgProps => ({
    allPoints: [],
    width: 100,
    axis: "y",
    position: { x: 0, y: 110 },
    expanded: false,
    botSize: fakeBotSize(),
    botPosition: { x: undefined, y: undefined, z: undefined },
    negativeZ: true,
    sourceFbosConfig: () => ({ value: 0, consistent: true }),
    mountedToolInfo: fakeMountedToolInfo(),
    tools: [],
  });

  it("renders without points", () => {
    const wrapper = svgMount(<ProfileSvg {...fakeProps()} />);
    expect(wrapper.html()).not.toContain("profile-point");
  });

  it("renders with no matching points", () => {
    const p = fakeProps();
    p.allPoints = [fakePoint(), fakePoint()];
    p.allPoints[0].body.y = 0;
    p.allPoints[1].body.y = 210;
    const wrapper = svgMount(<ProfileSvg {...p} />);
    expect(wrapper.html()).not.toContain("profile-point");
    expect(wrapper.html()).not.toContain("text");
    expect(wrapper.find("#UTM").find("rect").length).toEqual(0);
  });

  it("renders expanded", () => {
    const p = fakeProps();
    p.expanded = true;
    p.allPoints = [fakePoint(), fakePoint()];
    p.allPoints[0].body.x = 200;
    p.allPoints[0].body.y = 100;
    p.allPoints[0].body.z = 200;
    p.allPoints[0].body.meta.color = "green";
    p.allPoints[1].body.x = 0;
    p.allPoints[1].body.y = 100;
    p.allPoints[1].body.z = 0;
    p.allPoints[1].body.meta.color = "green";
    const wrapper = svgMount(<ProfileSvg {...p} />);
    expect(wrapper.html()).toContain("text");
    expect(wrapper.html()).toContain("line");
    expect(wrapper.html()).toContain("circle");
    expect(wrapper.text()).toContain("-100");
  });

  it("renders expanded: positive z", () => {
    const p = fakeProps();
    p.expanded = true;
    p.negativeZ = false;
    const wrapper = svgMount(<ProfileSvg {...p} />);
    expect(wrapper.html()).toContain("text");
    expect(wrapper.text()).not.toContain("-100");
  });

  it("renders UTM", () => {
    const p = fakeProps();
    p.botPosition = { x: 200, y: 100, z: 100 };
    const wrapper = svgMount(<ProfileSvg {...p} />);
    expect(wrapper.find("#UTM").find("line").length).toEqual(1);
    expect(wrapper.find("#UTM").find("rect").length).toEqual(1);
    expect(wrapper.html()).not.toContain("image");
  });

  it("renders UTM when expanded", () => {
    const p = fakeProps();
    p.expanded = true;
    p.botPosition = { x: 200, y: 100, z: 100 };
    const wrapper = svgMount(<ProfileSvg {...p} />);
    expect(wrapper.find("#UTM").find("rect").length).toEqual(3);
    expect(wrapper.html()).toContain("image");
  });

  it("renders UTM when expanded: y-axis", () => {
    const p = fakeProps();
    p.expanded = true;
    p.axis = "y";
    p.botPosition = { x: 200, y: 100, z: 100 };
    const wrapper = svgMount(<ProfileSvg {...p} />);
    expect(wrapper.find("#UTM").find("rect").length).toEqual(3);
    expect(wrapper.html()).toContain("image");
  });

  it("renders with matching points", () => {
    const p = fakeProps();
    p.allPoints = [
      fakePoint(), fakePoint(), fakePoint(), fakePoint(), fakePoint(),
    ];
    p.allPoints[0].body.x = 200;
    p.allPoints[0].body.y = 110;
    p.allPoints[0].body.z = 200;
    p.allPoints[0].body.meta.color = "green";
    p.allPoints[1].body.x = 0;
    p.allPoints[1].body.y = 90;
    p.allPoints[1].body.z = 0;
    p.allPoints[1].body.meta.color = "green";
    p.allPoints[2].body.x = 100;
    p.allPoints[2].body.y = 100;
    p.allPoints[2].body.z = 100;
    p.allPoints[2].body.meta.color = "green";
    p.allPoints[3].body.x = 300;
    p.allPoints[3].body.y = 100;
    p.allPoints[3].body.z = 300;
    p.allPoints[3].body.meta.color = "blue";
    p.allPoints[4].body.x = 400;
    p.allPoints[4].body.y = 100;
    p.allPoints[4].body.z = 400;
    p.allPoints[4].body.meta.color = "blue";
    const wrapper = svgMount(<ProfileSvg {...p} />);
    expect(wrapper.find("line").at(0).props()).toEqual({
      x1: 0, y1: 0, x2: 3000, y2: 0, strokeWidth: 3, stroke: Color.gridSoil,
    });
    expect(wrapper.find("line").at(1).props()).toEqual({
      x1: 0, y1: 0, x2: 3000, y2: 0, strokeWidth: 3, stroke: Color.blue,
    });
    expect(wrapper.find("line").at(2).props()).toEqual({
      x1: 0, y1: 0, x2: 100, y2: 100, strokeWidth: 20,
    });
    expect(wrapper.find("line").at(3).props()).toEqual({
      x1: 100, y1: 100, x2: 200, y2: 200, strokeWidth: 20,
    });
    expect(wrapper.find("line").at(4).props()).toEqual({
      x1: 300, y1: 300, x2: 400, y2: 400, strokeWidth: 20,
    });
  });

  it("renders tools", () => {
    const p = fakeProps();
    p.expanded = true;
    const tool = fakeTool();
    tool.body.id = 1;
    p.tools = [tool];
    const toolSlot = fakeToolSlot();
    toolSlot.body.x = 200;
    toolSlot.body.y = 110;
    toolSlot.body.z = 200;
    toolSlot.body.tool_id = 1;
    const troughSlot = fakeToolSlot();
    troughSlot.body.x = 1000;
    troughSlot.body.y = 110;
    troughSlot.body.z = 200;
    troughSlot.body.gantry_mounted = true;
    p.allPoints = [toolSlot, troughSlot];
    const wrapper = svgMount(<ProfileSvg {...p} />);
    expect(wrapper.find("#profile-tool").first().find("rect").props()).toEqual({
      x: -30, y: 200, width: 60, height: 20, fill: "rgba(102, 102, 102)",
    });
    expect(wrapper.find("#profile-tool").last().find("rect").props()).toEqual({
      x: 170, y: 200, width: 60, height: 20, fill: "rgba(102, 102, 102)",
    });
  });

  it("renders trough at new coordinate", () => {
    const p = fakeProps();
    p.expanded = true;
    p.botPosition.x = 1000;
    const troughSlot = fakeToolSlot();
    troughSlot.body.x = 1000;
    troughSlot.body.y = 110;
    troughSlot.body.z = 200;
    troughSlot.body.gantry_mounted = true;
    p.allPoints = [troughSlot];
    const wrapper = svgMount(<ProfileSvg {...p} />);
    expect(wrapper.find("#profile-tool").first().find("rect").props()).toEqual({
      x: 970, y: 200, width: 60, height: 20, fill: "rgba(102, 102, 102)",
    });
  });
});
