jest.mock("../../layers/points/interpolation_map", () => ({
  getInterpolationData: () => [{ x: 111, y: 112, z: 113 }],
  fetchInterpolationOptions: () => ({ stepSize: 100 }),
}));

import React from "react";
import { mount } from "enzyme";
import { getProfileX, ProfileSvg } from "../content";
import { ProfileSvgProps } from "../interfaces";
import {
  fakeBotLocationData, fakeBotSize,
} from "../../../../__test_support__/fake_bot_data";
import {
  fakePlant,
  fakePoint, fakeTool, fakeToolSlot, fakeWeed,
} from "../../../../__test_support__/fake_state/resources";
import { fakeMountedToolInfo } from "../../../../__test_support__/fake_tool_info";
import { Color } from "../../../../ui";
import {
  fakeMapTransformProps,
} from "../../../../__test_support__/map_transform_props";
import { BotPosition } from "../../../../devices/interfaces";
import { BotOriginQuadrant } from "../../../interfaces";
import { ToolPulloutDirection } from "farmbot/dist/resources/api_resources";
import { ToolDimensions } from "../../tool_graphics/tool";
import { SlotDimensions } from "../../tool_graphics/slot";
import {
  fakeDesignerState,
} from "../../../../__test_support__/fake_designer_state";
import { Path } from "../../../../internal_urls";

describe("<ProfileSvg />", () => {
  const fakeProps = (): ProfileSvgProps => ({
    allPoints: [],
    designer: fakeDesignerState(),
    position: { x: 0, y: 110 },
    expanded: false,
    botSize: fakeBotSize(),
    botLocationData: fakeBotLocationData(),
    peripheralValues: [],
    negativeZ: true,
    sourceFbosConfig: () => ({ value: 0, consistent: true }),
    mountedToolInfo: fakeMountedToolInfo(),
    tools: [],
    mapTransformProps: fakeMapTransformProps(),
    getConfigValue: () => true,
    farmwareEnvs: [],
  });

  it("renders without points", () => {
    const wrapper = mount(<ProfileSvg {...fakeProps()} />);
    expect(wrapper.html()).not.toContain("profile-point");
  });

  it("renders with no matching points", () => {
    const p = fakeProps();
    p.allPoints = [fakePoint(), fakePoint()];
    p.allPoints[0].body.y = 0;
    p.allPoints[1].body.y = 210;
    const wrapper = mount(<ProfileSvg {...p} />);
    expect(wrapper.html()).not.toContain("profile-point");
    expect(wrapper.html()).not.toContain("text");
    expect(wrapper.find("#UTM").find("rect").length).toEqual(0);
  });

  it("renders expanded", () => {
    const p = fakeProps();
    p.expanded = true;
    p.designer.profileAxis = "y";
    p.allPoints = [fakePoint(), fakePoint()];
    p.allPoints[0].body.x = 200;
    p.allPoints[0].body.y = 100;
    p.allPoints[0].body.z = 200;
    p.allPoints[0].body.meta.color = "green";
    p.allPoints[1].body.x = 0;
    p.allPoints[1].body.y = 100;
    p.allPoints[1].body.z = 0;
    p.allPoints[1].body.meta.color = "green";
    const wrapper = mount(<ProfileSvg {...p} />);
    expect(wrapper.html()).toContain("text");
    expect(wrapper.html()).toContain("line");
    expect(wrapper.html()).toContain("circle");
    expect(wrapper.text()).toContain("-100");
  });

  it("renders expanded: positive z", () => {
    const p = fakeProps();
    p.expanded = true;
    p.negativeZ = false;
    const wrapper = mount(<ProfileSvg {...p} />);
    expect(wrapper.html()).toContain("text");
    expect(wrapper.text()).not.toContain("-100");
  });

  it("doesn't render soil fill", () => {
    const wrapper = mount(<ProfileSvg {...fakeProps()} />);
    expect(wrapper.find("#soil-height").find("rect").length).toEqual(0);
  });

  it("renders soil fill", () => {
    const p = fakeProps();
    p.sourceFbosConfig = () => ({ value: 100, consistent: true });
    const wrapper = mount(<ProfileSvg {...p} />);
    expect(wrapper.find("#soil-height").find("rect").length).toEqual(1);
  });

  it("renders UTM", () => {
    const p = fakeProps();
    p.designer.profileAxis = "y";
    p.botLocationData.position = { x: 200, y: 100, z: 100 };
    const wrapper = mount(<ProfileSvg {...p} />);
    expect(wrapper.find("#UTM-and-axis").find("line").length).toEqual(1);
    expect(wrapper.find("#UTM-and-axis").find("rect").length).toEqual(1);
    expect(wrapper.html()).not.toContain("image");
  });

  it("renders UTM when expanded", () => {
    const p = fakeProps();
    p.expanded = true;
    p.designer.profileAxis = "y";
    p.botLocationData.position = { x: 200, y: 100, z: 100 };
    const wrapper = mount(<ProfileSvg {...p} />);
    expect(wrapper.find("#UTM-and-axis").find("rect").length).toEqual(4);
    expect(wrapper.html()).toContain("image");
  });

  it("renders UTM when expanded: y-axis", () => {
    const p = fakeProps();
    p.expanded = true;
    p.designer.profileAxis = "y";
    p.botLocationData.position = { x: 200, y: 100, z: 100 };
    const wrapper = mount(<ProfileSvg {...p} />);
    expect(wrapper.find("#UTM-and-axis").find("rect").length).toEqual(4);
    expect(wrapper.html()).toContain("image");
  });

  it("renders with matching points", () => {
    const p = fakeProps();
    p.designer.profileAxis = "y";
    p.botSize.z = { value: 100, isDefault: false };
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
    const wrapper = mount(<ProfileSvg {...p} />);
    expect(wrapper.find("line").at(0).props()).toEqual({
      stroke: Color.gridSoil, x1: 0, y1: 0, x2: 3000, y2: 0, strokeWidth: 3,
    });
    expect(wrapper.find("line").at(1).props()).toEqual({
      stroke: Color.blue, x1: 0, y1: 0, x2: 3000, y2: 0, strokeWidth: 3,
    });
    expect(wrapper.find("line").at(2).props()).toEqual({
      stroke: Color.gray, x1: 0, y1: 100, x2: 3000, y2: 100, strokeWidth: 3,
      strokeDasharray: 10,
    });
    expect(wrapper.find("line").at(3).props()).toEqual({
      id: "profile-point-connector",
      x1: 200, y1: 200, x2: 100, y2: 100, strokeWidth: 20, opacity: 0.5,
    });
    expect(wrapper.find("line").at(4).props()).toEqual({
      id: "profile-point-connector",
      x1: 100, y1: 100, x2: 0, y2: 0, strokeWidth: 20, opacity: 0.5,
    });
    expect(wrapper.find("line").at(5).props()).toEqual({
      id: "profile-point-connector",
      x1: 400, y1: 400, x2: 300, y2: 300, strokeWidth: 20, opacity: 0.5,
    });
  });

  it("renders tools", () => {
    const p = fakeProps();
    p.expanded = true;
    p.designer.profileAxis = "y";
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
    const wrapper = mount(<ProfileSvg {...p} />);
    expect(wrapper.find("#profile-tool").first().find("rect").props()).toEqual({
      id: "tool-body", fill: "url(#tool-body-gradient-tool)", opacity: 0.75,
      x: 200 - ToolDimensions.radius, y: 200,
      width: ToolDimensions.diameter,
      height: ToolDimensions.thickness,
    });
    expect(wrapper.find("#profile-tool").last().find("rect").props()).toEqual({
      id: "tool-body", fill: "url(#tool-body-gradient-tool)", opacity: 0.75,
      x: -ToolDimensions.radius, y: 200,
      width: ToolDimensions.diameter,
      height: ToolDimensions.thickness,
    });
  });

  it("renders trough at new coordinate", () => {
    const p = fakeProps();
    p.expanded = true;
    p.designer.profileAxis = "y";
    p.botLocationData.position.x = 1000;
    const trough = fakeTool();
    trough.body.id = 1;
    trough.body.name = "Seed trough";
    p.tools = [trough];
    const troughSlot = fakeToolSlot();
    troughSlot.body.tool_id = trough.body.id;
    troughSlot.body.x = 1000;
    troughSlot.body.y = 110;
    troughSlot.body.z = 200;
    troughSlot.body.gantry_mounted = true;
    p.allPoints = [troughSlot];
    const wrapper = mount(<ProfileSvg {...p} />);
    expect(wrapper.find("#profile-tool").first().find("rect").props()).toEqual({
      id: "tool-body", fill: "rgba(128, 128, 128)", opacity: 0.75,
      x: 976.25, y: 200, width: 47.5, height: ToolDimensions.thickness,
    });
  });

  const toolGraphicsProps = () => {
    const p = fakeProps();
    p.expanded = true;
    const rotaryTool = fakeTool();
    rotaryTool.body.name = "rotary tool";
    rotaryTool.body.id = 5;
    const weeder = fakeTool();
    weeder.body.name = "weeder";
    weeder.body.id = 1;
    const seeder = fakeTool();
    seeder.body.name = "seeder";
    seeder.body.id = 2;
    const seedBin = fakeTool();
    seedBin.body.name = "seed bin";
    seedBin.body.id = 3;
    const soilSensor = fakeTool();
    soilSensor.body.name = "soil sensor";
    soilSensor.body.id = 4;
    p.tools = [rotaryTool, weeder, seeder, seedBin, soilSensor];
    const rotarySlot = fakeToolSlot();
    rotarySlot.body.x = 0;
    rotarySlot.body.y = 110;
    rotarySlot.body.z = 200;
    rotarySlot.body.tool_id = rotaryTool.body.id;
    rotarySlot.body.pullout_direction = 1;
    const weederSlot = fakeToolSlot();
    weederSlot.body.x = 0;
    weederSlot.body.y = 110;
    weederSlot.body.z = 200;
    weederSlot.body.tool_id = weeder.body.id;
    weederSlot.body.pullout_direction = 1;
    const seederSlot = fakeToolSlot();
    seederSlot.body.x = 0;
    seederSlot.body.y = 110;
    seederSlot.body.z = 200;
    seederSlot.body.tool_id = seeder.body.id;
    seederSlot.body.pullout_direction = 1;
    const seedBinSlot = fakeToolSlot();
    seedBinSlot.body.x = 0;
    seedBinSlot.body.y = 110;
    seedBinSlot.body.z = 200;
    seedBinSlot.body.tool_id = seedBin.body.id;
    seedBinSlot.body.pullout_direction = 1;
    const soilSensorSlot = fakeToolSlot();
    soilSensorSlot.body.x = 0;
    soilSensorSlot.body.y = 110;
    soilSensorSlot.body.z = 200;
    soilSensorSlot.body.tool_id = soilSensor.body.id;
    soilSensorSlot.body.pullout_direction = 0;
    p.allPoints = [rotarySlot, weederSlot, seederSlot, seedBinSlot, soilSensorSlot];
    return p;
  };

  it("renders tool implements: side", () => {
    const p = toolGraphicsProps();
    p.designer.profileAxis = "y";
    const wrapper = mount(<ProfileSvg {...p} />);
    expect(wrapper.find("#rotary-tool-implement-profile").length).toEqual(1);
    expect(wrapper.find("#weeder-implement-profile").length).toEqual(1);
    expect(wrapper.find("#seeder-implement-profile").length).toEqual(1);
    expect(wrapper.find("#seed-bin-implement-profile").length).toEqual(1);
    expect(wrapper.find("#soil-sensor-implement-profile").length).toEqual(1);
    expect(wrapper.find("#no-tool-implement-profile").length).toEqual(0);
    expect(wrapper.find("#no-slot-direction").length).toEqual(1);
    expect(wrapper.find("#slot-side-profile").length).toEqual(4);
    expect(wrapper.find("#slot-front-profile").length).toEqual(0);
    expect(wrapper.find("#rotary-tool-front-view").length).toEqual(0);
    expect(wrapper.find("#rotary-tool-side-view").length).toEqual(1);
    expect(wrapper.find("#weeder-front-view").length).toEqual(0);
    expect(wrapper.find("#weeder-side-view").length).toEqual(1);
    expect(wrapper.find("#soil-sensor-front-view").length).toEqual(0);
    expect(wrapper.find("#soil-sensor-side-view").length).toEqual(1);
  });

  it("renders tool implements: front", () => {
    const p = toolGraphicsProps();
    p.designer.profileAxis = "x";
    const wrapper = mount(<ProfileSvg {...p} />);
    expect(wrapper.find("#rotary-tool-implement-profile").length).toEqual(1);
    expect(wrapper.find("#weeder-implement-profile").length).toEqual(1);
    expect(wrapper.find("#seeder-implement-profile").length).toEqual(1);
    expect(wrapper.find("#seed-bin-implement-profile").length).toEqual(1);
    expect(wrapper.find("#soil-sensor-implement-profile").length).toEqual(1);
    expect(wrapper.find("#no-tool-implement-profile").length).toEqual(0);
    expect(wrapper.find("#no-slot-direction").length).toEqual(1);
    expect(wrapper.find("#slot-side-profile").length).toEqual(0);
    expect(wrapper.find("#slot-front-profile").length).toEqual(4);
    expect(wrapper.find("#rotary-tool-front-view").length).toEqual(1);
    expect(wrapper.find("#rotary-tool-side-view").length).toEqual(0);
    expect(wrapper.find("#weeder-front-view").length).toEqual(1);
    expect(wrapper.find("#weeder-side-view").length).toEqual(0);
    expect(wrapper.find("#soil-sensor-front-view").length).toEqual(1);
    expect(wrapper.find("#soil-sensor-side-view").length).toEqual(0);
  });

  it("renders all points", () => {
    const p = fakeProps();
    p.expanded = true;
    p.designer.profileWidth = 10000;
    p.allPoints = [fakePlant(), fakeWeed(), fakeToolSlot(), fakePoint()];
    const wrapper = mount(<ProfileSvg {...p} />);
    expect(wrapper.find("#profile-map-point").length).toEqual(1);
    expect(wrapper.find("#plant-profile-point").length).toEqual(1);
    expect(wrapper.find("#weed-profile-point").length).toEqual(1);
    expect(wrapper.find("#no-tool-implement-profile").length).toEqual(1);
  });

  it("doesn't render any points", () => {
    const p = fakeProps();
    p.expanded = true;
    p.designer.profileWidth = 10000;
    p.getConfigValue = () => false;
    p.allPoints = [fakePlant(), fakeWeed(), fakeToolSlot(), fakePoint()];
    const wrapper = mount(<ProfileSvg {...p} />);
    expect(wrapper.find("#profile-map-point").length).toEqual(0);
    expect(wrapper.find("#plant-profile-point").length).toEqual(0);
    expect(wrapper.find("#weed-profile-point").length).toEqual(0);
    expect(wrapper.find("#no-tool-implement-profile").length).toEqual(0);
  });

  const SLOT_FRONT = "slot-front-";
  const SLOT_SIDE = "slot-side-";
  const SENSOR_FRONT = "-sensor-front-";
  const SENSOR_SIDE = "-sensor-side-";
  const SLOT_LEFT = `h -${SlotDimensions.toolToTopBend}`;
  const SLOT_RIGHT = `h ${SlotDimensions.toolToTopBend}`;

  it.each<[
    "x" | "y", BotOriginQuadrant, boolean, ToolPulloutDirection, boolean, string[],
  ]>([
    ["x", 1, false, 1, false, [SLOT_FRONT, SENSOR_FRONT]],
    ["x", 1, false, 2, false, [SLOT_FRONT, SENSOR_FRONT]],
    ["x", 1, false, 3, false, [SLOT_SIDE, SLOT_LEFT, SENSOR_SIDE, "112"]],
    ["x", 1, false, 4, false, [SLOT_SIDE, SLOT_RIGHT, SENSOR_SIDE, "108"]],
    ["x", 2, false, 1, false, [SLOT_FRONT, SENSOR_FRONT]],
    ["x", 2, false, 2, false, [SLOT_FRONT, SENSOR_FRONT]],
    ["x", 2, false, 3, false, [SLOT_SIDE, SLOT_RIGHT, SENSOR_SIDE, "1388"]],
    ["x", 2, false, 4, false, [SLOT_SIDE, SLOT_LEFT, SENSOR_SIDE, "1392"]],
    ["x", 3, false, 3, false, [SLOT_SIDE, SLOT_LEFT, SENSOR_SIDE, "112"]],
    ["x", 4, false, 4, false, [SLOT_SIDE, SLOT_LEFT, SENSOR_SIDE, "1392"]],
    ["y", 1, true, 1, false, [SLOT_SIDE, SLOT_LEFT, SENSOR_SIDE, "2"]],
    ["y", 1, true, 2, false, [SLOT_SIDE, SLOT_RIGHT, SENSOR_SIDE, "-2"]],
    ["y", 1, true, 1, true, [SLOT_SIDE, SLOT_LEFT, SENSOR_SIDE, "-2"]],
    ["y", 1, true, 2, true, [SLOT_SIDE, SLOT_RIGHT, SENSOR_SIDE, "2"]],
  ])("renders orientation: %s-axis, origin: %s, xySwap: %s, slot: %s, flip: %s",
    (axis, quadrant, xySwap, slotDirection, flipped, expected) => {
      const p = fakeProps();
      p.designer.profileAxis = axis;
      p.mapTransformProps.quadrant = quadrant;
      p.mapTransformProps.xySwap = xySwap;
      p.expanded = true;
      const soilSensor = fakeTool();
      soilSensor.body.name = "soil sensor";
      soilSensor.body.id = 3;
      p.tools = [soilSensor];
      const soilSensorSlot = fakeToolSlot();
      soilSensorSlot.body.x = 0;
      soilSensorSlot.body.y = 110;
      soilSensorSlot.body.z = 200;
      soilSensorSlot.body.tool_id = soilSensor.body.id;
      soilSensorSlot.body.meta.tool_direction = flipped ? "flipped" : "";
      soilSensorSlot.body.pullout_direction = slotDirection;
      p.allPoints = [soilSensorSlot];
      const wrapper = mount(<ProfileSvg {...p} />);
      expected.map(string =>
        expect(wrapper.html().toLowerCase()).toContain(string));
    });

  it("renders interpolated soil", () => {
    location.pathname = Path.mock(Path.location());
    const p = fakeProps();
    p.expanded = true;
    p.designer.profileAxis = "y";
    p.sourceFbosConfig = () => ({ value: 100, consistent: true });
    const wrapper = mount(<ProfileSvg {...p} />);
    expect(wrapper.find("#interpolated-soil-height").find("rect").length)
      .toEqual(1);
  });
});

describe("getProfileX()", () => {
  it.each<["x" | "y", BotOriginQuadrant, boolean, number, BotPosition, number]>([
    ["x", 2, false, 100, { x: 1, y: 2, z: 3 }, 1],
    ["y", 2, false, 100, { x: 1, y: 2, z: 3 }, 98],
    ["x", 3, false, 100, { x: 1, y: 2, z: 3 }, 1],
    ["y", 3, false, 100, { x: 1, y: 2, z: 3 }, 2],
    ["x", 4, false, 100, { x: 1, y: 2, z: 3 }, 99],
    ["y", 4, false, 100, { x: 1, y: 2, z: 3 }, 98],
    ["x", 1, false, 100, { x: 1, y: 2, z: 3 }, 99],
    ["y", 1, false, 100, { x: 1, y: 2, z: 3 }, 2],
    ["x", 2, true, 100, { x: 1, y: 2, z: 3 }, 1],
    ["y", 2, true, 100, { x: 1, y: 2, z: 3 }, 2],
    ["x", 3, true, 100, { x: 1, y: 2, z: 3 }, 99],
    ["y", 3, true, 100, { x: 1, y: 2, z: 3 }, 2],
    ["x", 4, true, 100, { x: 1, y: 2, z: 3 }, 99],
    ["y", 4, true, 100, { x: 1, y: 2, z: 3 }, 98],
    ["x", 1, true, 100, { x: 1, y: 2, z: 3 }, 1],
    ["y", 1, true, 100, { x: 1, y: 2, z: 3 }, 98],
  ])("returns correct position: %s-axis, quadrant %s, rotated: %s",
    (axis, quadrant, xySwap, width, coordinate, expected) => {
      const mapTransformProps = fakeMapTransformProps();
      mapTransformProps.quadrant = quadrant;
      mapTransformProps.xySwap = xySwap;
      expect(getProfileX({
        profileAxis: axis,
        mapTransformProps,
        width,
      })(coordinate)).toEqual(expected);
    });
});
