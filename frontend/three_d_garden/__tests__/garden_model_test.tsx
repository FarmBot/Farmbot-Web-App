let mockIsDesktop = false;
let mockIsMobile = false;
jest.mock("../../screen_size", () => ({
  isDesktop: () => mockIsDesktop,
  isMobile: () => mockIsMobile,
}));

jest.mock("../performance_monitor", () => {
  const React = require("react");
  return {
    ThreeDPerformanceMonitor: () =>
      React.createElement("div", { id: "three-profiler" }),
  };
});

import React from "react";
import { mount } from "enzyme";
import { GardenModelProps, GardenModel } from "../garden_model";
import { clone } from "lodash";
import { Config, INITIAL, SurfaceDebugOption } from "../config";
import { render } from "@testing-library/react";
import {
  fakePlant, fakePoint, fakeSensor, fakeSensorReading, fakeWeed,
} from "../../__test_support__/fake_state/resources";
import { PointMarkerInstances, WeedSphereInstances } from "../garden";
import { fakeAddPlantProps } from "../../__test_support__/fake_props";
import { ASSETS } from "../constants";
import { Path } from "../../internal_urls";
import { fakeDrawnPoint } from "../../__test_support__/fake_designer_state";
import { convertPlants } from "../../farm_designer/three_d_garden_map";
import { PERFORMANCE_PROFILER_KEY } from "../../util/performance_profiler_settings";
import { BooleanSetting } from "../../session_keys";

describe("<GardenModel />", () => {
  beforeEach(() => {
    mockIsMobile = false;
    localStorage.clear();
  });

  const fakeProps = (): GardenModelProps => ({
    config: clone(INITIAL),
    activeFocus: "",
    setActiveFocus: jest.fn(),
    addPlantProps: fakeAddPlantProps(),
    threeDPlants: [],
  });

  it("renders", () => {
    const { container } = render(<GardenModel {...fakeProps()} />);
    expect(container).toContainHTML("zoom-beacons");
    expect(container).not.toContainHTML("stats");
    expect(container).toContainHTML("darkgreen");
  });

  it("renders profiler monitor when enabled", () => {
    localStorage.setItem(PERFORMANCE_PROFILER_KEY, "true");
    const { container } = render(<GardenModel {...fakeProps()} />);
    expect(container.querySelector("#three-profiler")).not.toBeNull();
  });

  it("renders top down view", () => {
    mockIsMobile = true;
    const p = fakeProps();
    const addPlantProps = fakeAddPlantProps();
    addPlantProps.designer.threeDTopDownView = true;
    p.addPlantProps = addPlantProps;
    const { container } = render(<GardenModel {...p} />);
    expect(container).toContainHTML("darkgreen");
  });

  it("renders no user plants", () => {
    const p = fakeProps();
    p.config.labels = true;
    p.config.labelsOnHover = false;
    p.threeDPlants = convertPlants(p.config, []);
    const { container } = render(<GardenModel {...p} />);
    expect(container.querySelector("[name='label-Beet']"))
      .toBeNull();
  });

  it("renders user plant", () => {
    const p = fakeProps();
    const plant = fakePlant();
    plant.body.name = "Beet";
    p.threeDPlants = convertPlants(p.config, [plant]);
    p.config.labels = true;
    p.config.labelsOnHover = false;
    const { container } = render(<GardenModel {...p} />);
    expect(container.querySelector("[name='label-Beet']"))
      .not.toBeNull();
  });

  it("skips plant hover handlers in click-to-add mode", () => {
    location.pathname = Path.mock(Path.cropSearch("mint"));
    const p = fakeProps();
    p.config.labelsOnHover = true;
    const wrapper = mount(<GardenModel {...p} />);
    const plantGroup = wrapper.find("group[name='plants']");
    expect(plantGroup.props().onPointerMove).toBeUndefined();
  });

  it("adds plant hover handlers outside hover modes", () => {
    location.pathname = Path.mock(Path.designer());
    const p = fakeProps();
    p.config.labelsOnHover = true;
    const wrapper = mount(<GardenModel {...p} />);
    const plantGroup = wrapper.find("group[name='plants']");
    expect(plantGroup.props().onPointerMove).toBeDefined();
  });

  it("skips plant hover handlers when plants layer is off", () => {
    location.pathname = Path.mock(Path.designer());
    const p = fakeProps();
    p.config.labelsOnHover = true;
    p.addPlantProps = fakeAddPlantProps();
    p.addPlantProps.getConfigValue = jest.fn(key =>
      key === BooleanSetting.show_plants ? false : true);
    const wrapper = mount(<GardenModel {...p} />);
    const plantGroup = wrapper.find("group[name='plants']");
    expect(plantGroup.props().onPointerMove).toBeUndefined();
  });

  it("renders points and weeds", () => {
    const p = fakeProps();
    p.mapPoints = [fakePoint()];
    p.weeds = [fakeWeed()];
    const { container } = render(<GardenModel {...p} />);
    expect(container).toContainHTML("instancedmesh");
    expect(container).toContainHTML(ASSETS.other.weed);
  });

  it("passes label config to point and weed instances", () => {
    const p = fakeProps();
    p.config.labels = true;
    p.config.labelsOnHover = true;
    p.mapPoints = [fakePoint()];
    p.weeds = [fakeWeed()];
    const wrapper = mount(<GardenModel {...p} />);
    const pointInstances = wrapper.find(PointMarkerInstances).first();
    expect(pointInstances.props().config.labels).toEqual(true);
    expect(pointInstances.props().config.labelsOnHover).toEqual(true);
    const weedInstances = wrapper.find(WeedSphereInstances).first();
    expect(weedInstances.props().config.labels).toEqual(true);
    expect(weedInstances.props().config.labelsOnHover).toEqual(true);
  });

  it("passes sun config dimensions", () => {
    const p = fakeProps();
    p.config.bedLengthOuter = 1111;
    p.config.bedWidthOuter = 2222;
    p.config.bedXOffset = 33;
    p.config.bedYOffset = 44;
    p.config.botSizeX = 55;
    p.config.botSizeY = 66;
    p.config.columnLength = 77;
    p.config.zGantryOffset = 88;
    const wrapper = mount(<GardenModel {...p} />);
    const sunConfig = wrapper.find("Sun").prop("config") as Config;
    expect(sunConfig.bedLengthOuter).toEqual(1111);
    expect(sunConfig.bedWidthOuter).toEqual(2222);
    expect(sunConfig.bedXOffset).toEqual(33);
    expect(sunConfig.bedYOffset).toEqual(44);
    expect(sunConfig.botSizeX).toEqual(55);
    expect(sunConfig.botSizeY).toEqual(66);
    expect(sunConfig.columnLength).toEqual(77);
    expect(sunConfig.zGantryOffset).toEqual(88);
  });

  it("renders drawn point", () => {
    location.pathname = Path.mock(Path.points("add"));
    const p = fakeProps();
    const addPlantProps = fakeAddPlantProps();
    addPlantProps.designer.drawnPoint = fakeDrawnPoint();
    p.addPlantProps = addPlantProps;
    const { container } = render(<GardenModel {...p} />);
    expect(container).toContainHTML("drawn-point");
  });

  it("doesn't render bot", () => {
    const p = fakeProps();
    p.addPlantProps = fakeAddPlantProps();
    p.addPlantProps.getConfigValue = () => false;
    const { container } = render(<GardenModel {...p} />);
    expect(container).not.toContainHTML("bot");
  });

  it("renders other options", () => {
    mockIsDesktop = false;
    const p = fakeProps();
    p.config.perspective = false;
    p.config.plants = "";
    p.config.labels = true;
    p.config.labelsOnHover = false;
    p.config.sunInclination = -1;
    p.config.sizePreset = "Genesis XL";
    p.config.stats = true;
    p.config.viewCube = true;
    p.config.lab = true;
    p.config.lightsDebug = true;
    p.config.surfaceDebug = SurfaceDebugOption.normals;
    p.config.moistureDebug = true;
    p.activeFocus = "plant";
    p.addPlantProps = undefined;
    const { container } = render(<GardenModel {...p} />);
    expect(container).toContainHTML("gray");
    expect(container).toContainHTML("stats");
  });

  it("renders debug options", () => {
    mockIsDesktop = false;
    const p = fakeProps();
    const sensor = fakeSensor();
    sensor.body.id = 1;
    sensor.body.label = "soil moisture";
    p.sensors = [sensor];
    const reading0 = fakeSensorReading();
    reading0.body.pin = 1;
    reading0.body.x = 100;
    reading0.body.y = 100;
    reading0.body.z = 100;
    reading0.body.value = 1000;
    const reading1 = fakeSensorReading();
    reading1.body.pin = 1;
    reading1.body.x = 0;
    reading1.body.y = 0;
    reading1.body.z = 0;
    reading1.body.value = 1000;
    p.sensorReadings = [reading0, reading1];
    p.config.surfaceDebug = SurfaceDebugOption.height;
    p.config.moistureDebug = true;
    const { container } = render(<GardenModel {...p} />);
    expect(container).toContainHTML("gray");
  });

  it("renders without sensor readings", () => {
    mockIsDesktop = false;
    const p = fakeProps();
    p.sensorReadings = undefined;
    p.config.moistureDebug = true;
    const { container } = render(<GardenModel {...p} />);
    expect(container).toContainHTML("gray");
  });

  it("sets hover", () => {
    const p = fakeProps();
    p.config.labelsOnHover = true;
    const wrapper = mount(<GardenModel {...p} />);
    const e = {
      stopPropagation: jest.fn(),
      intersections: [{ object: { name: "obj" } }],
    };
    wrapper.find({ name: "plants" }).first().simulate("pointerEnter", e);
    expect(e.stopPropagation).toHaveBeenCalled();
  });

  it("sets hover: buttons", () => {
    const p = fakeProps();
    p.config.labelsOnHover = true;
    const wrapper = mount(<GardenModel {...p} />);
    const e = {
      stopPropagation: jest.fn(),
      buttons: true,
    };
    wrapper.find({ name: "plants" }).first().simulate("pointerEnter", e);
    expect(e.stopPropagation).toHaveBeenCalled();
  });

  it("un-sets hover", () => {
    const p = fakeProps();
    p.config.labelsOnHover = true;
    const wrapper = mount(<GardenModel {...p} />);
    const e = {
      stopPropagation: jest.fn(),
      intersections: [{ object: { name: "obj" } }],
    };
    wrapper.find({ name: "plants" }).first().simulate("pointerLeave", e);
    expect(e.stopPropagation).toHaveBeenCalled();
  });

  it("doesn't set hover", () => {
    const p = fakeProps();
    p.config.labels = true;
    p.config.labelsOnHover = false;
    const wrapper = mount(<GardenModel {...p} />);
    const e = { stopPropagation: jest.fn() };
    wrapper.find({ name: "plants" }).first().simulate("pointerEnter", e);
    expect(e.stopPropagation).not.toHaveBeenCalled();
  });

  it("logs debug event", () => {
    console.log = jest.fn();
    const p = fakeProps();
    p.config.eventDebug = true;
    const wrapper = mount(<GardenModel {...p} />);
    wrapper.simulate("pointerMove", {
      intersections: [
        { object: { name: "1" } },
        { object: { name: "2" } },
      ],
    });
    expect(console.log).toHaveBeenCalledWith(["1", "2"]);
  });

  it.each<[string, string]>([
    ["Greenhouse", "ground Greenhouse"],
    ["Lab", "ground Lab"],
    ["Outdoor", "ground Outdoor"],
  ])("renders different ground based on scene: %s %s",
    (sceneName, expectedClass) => {
      const p = fakeProps();
      p.config.scene = sceneName;
      const { container } = render(<GardenModel {...p} />);
      expect(container.innerHTML).toContain(expectedClass);
    });

  it("shows night sky", () => {
    const p = fakeProps();
    p.config.sun = 0;
    const { container } = render(<GardenModel {...p} />);
    expect(container.innerHTML).toContain("color=\"0,0,0\"");
  });
});
