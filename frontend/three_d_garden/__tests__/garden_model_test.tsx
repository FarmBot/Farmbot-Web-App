let mockIsDesktop = false;
let mockIsMobile = false;

import React from "react";
import { GardenModelProps, GardenModel } from "../garden_model";
import { clone } from "lodash";
import { INITIAL, INITIAL_POSITION, SurfaceDebugOption } from "../config";
import { render } from "@testing-library/react";
import {
  fakePlant, fakePoint, fakeSensor, fakeSensorReading, fakeWeed,
} from "../../__test_support__/fake_state/resources";
import { fakeAddPlantProps } from "../../__test_support__/fake_props";
import { ASSETS } from "../constants";
import { Path } from "../../internal_urls";
import { fakeDrawnPoint } from "../../__test_support__/fake_designer_state";
import { convertPlants } from "../../farm_designer/three_d_garden_map";
import * as screenSize from "../../screen_size";
import {
  actRenderer,
  createRenderer,
  unmountRenderer,
} from "../../__test_support__/test_renderer";

let isDesktopSpy: jest.SpyInstance;
let isMobileSpy: jest.SpyInstance;
let useStateSpy: jest.SpyInstance;
const originalPathname = location.pathname;
const mountedWrappers: ReturnType<typeof createRenderer>[] = [];

describe("<GardenModel />", () => {
  beforeEach(() => {
    mockIsDesktop = false;
    mockIsMobile = false;
    let useStateCalls = 0;
    useStateSpy = jest.spyOn(React, "useState")
      // eslint-disable-next-line comma-spacing
      .mockImplementation(<S,>(initialState?: S | (() => S)) => {
        useStateCalls += 1;
        if (useStateCalls == 2) {
          return [{} as S, jest.fn()];
        }
        const value = typeof initialState == "function"
          ? (initialState as () => S)()
          : initialState;
        return [value as S, jest.fn()];
      });
    isDesktopSpy = jest.spyOn(screenSize, "isDesktop")
      .mockImplementation(() => mockIsDesktop);
    isMobileSpy = jest.spyOn(screenSize, "isMobile")
      .mockImplementation(() => mockIsMobile);
  });

  afterEach(() => {
    mountedWrappers.splice(0).forEach(wrapper =>
      unmountRenderer(wrapper));
    useStateSpy.mockRestore();
    isDesktopSpy.mockRestore();
    isMobileSpy.mockRestore();
    location.pathname = originalPathname;
  });

  const fakeProps = (): GardenModelProps => ({
    config: clone(INITIAL),
    configPosition: clone(INITIAL_POSITION),
    activeFocus: "",
    setActiveFocus: jest.fn(),
    addPlantProps: fakeAddPlantProps(),
    threeDPlants: [],
  });

  const createWrapper = (p: GardenModelProps) => {
    const wrapper = createRenderer(<GardenModel {...p} />);
    mountedWrappers.push(wrapper);
    return wrapper;
  };

  it("renders", () => {
    const { container } = render(<GardenModel {...fakeProps()} />);
    expect(container.innerHTML).toContain("zoom-beacons");
    expect(container.innerHTML).not.toContain("stats");
    expect(container.innerHTML).toContain("darkgreen");
  });

  it("renders top down view", () => {
    mockIsMobile = true;
    const p = fakeProps();
    const addPlantProps = fakeAddPlantProps();
    addPlantProps.designer.threeDTopDownView = true;
    p.addPlantProps = addPlantProps;
    const { container } = render(<GardenModel {...p} />);
    expect(container.innerHTML).toContain("darkgreen");
  });

  it("renders no user plants", () => {
    const p = fakeProps();
    p.threeDPlants = convertPlants(p.config, []);
    const { queryAllByText } = render(<GardenModel {...p} />);
    const plantLabels = queryAllByText("Beet");
    expect(plantLabels.length).toEqual(0);
  });

  it("renders user plant", () => {
    const p = fakeProps();
    const plant = fakePlant();
    plant.body.name = "Beet";
    p.threeDPlants = convertPlants(p.config, [plant]);
    const { queryAllByText } = render(<GardenModel {...p} />);
    const plantLabels = queryAllByText("Beet");
    expect(plantLabels.length).toEqual(1);
  });

  it("doesn't render hover labels without a hovered plant", () => {
    const p = fakeProps();
    const plant = fakePlant();
    plant.body.name = "Beet";
    p.config.labels = true;
    p.config.labelsOnHover = true;
    p.threeDPlants = convertPlants(p.config, [plant]);
    const { queryAllByText } = render(<GardenModel {...p} />);
    const plantLabels = queryAllByText("Beet");
    expect(plantLabels.length).toEqual(0);
  });

  it("renders only the hovered label when labels on hover are enabled", () => {
    useStateSpy.mockRestore();
    let useStateCalls = 0;
    useStateSpy = jest.spyOn(React, "useState")
      // eslint-disable-next-line comma-spacing
      .mockImplementation(<S,>(initialState?: S | (() => S)) => {
        useStateCalls += 1;
        if (useStateCalls == 1) {
          return [0 as S, jest.fn()];
        }
        if (useStateCalls == 2) {
          return [{} as S, jest.fn()];
        }
        const value = typeof initialState == "function"
          ? (initialState as () => S)()
          : initialState;
        return [value as S, jest.fn()];
      });
    const p = fakeProps();
    const plant = fakePlant();
    plant.body.name = "Beet";
    p.config.labels = true;
    p.config.labelsOnHover = true;
    p.threeDPlants = convertPlants(p.config, [plant]);
    const { queryAllByText } = render(<GardenModel {...p} />);
    const plantLabels = queryAllByText("Beet");
    expect(plantLabels.length).toEqual(1);
  });

  it("renders points and weeds", () => {
    const p = fakeProps();
    p.mapPoints = [fakePoint()];
    p.weeds = [fakeWeed()];
    const { container } = render(<GardenModel {...p} />);
    expect(container.innerHTML).toContain("cylinder");
    expect(container.innerHTML).toContain(ASSETS.other.weed);
  });

  it("renders drawn point", () => {
    location.pathname = Path.mock(Path.points("add"));
    const p = fakeProps();
    const addPlantProps = fakeAddPlantProps();
    addPlantProps.designer.drawnPoint = fakeDrawnPoint();
    p.addPlantProps = addPlantProps;
    const { container } = render(<GardenModel {...p} />);
    expect(container.innerHTML).toContain("drawn-point");
  });

  it("doesn't render bot", () => {
    const p = fakeProps();
    p.addPlantProps = fakeAddPlantProps();
    p.addPlantProps.getConfigValue = () => false;
    const { container } = render(<GardenModel {...p} />);
    expect(container.innerHTML).not.toContain('name="bot"');
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
    p.config.lightsDebug = true;
    p.config.surfaceDebug = SurfaceDebugOption.normals;
    p.config.moistureDebug = true;
    p.activeFocus = "plant";
    p.addPlantProps = undefined;
    const { container } = render(<GardenModel {...p} />);
    expect(container.innerHTML).toContain("gray");
    expect(container.innerHTML).toContain("stats");
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
    expect(container.innerHTML).toContain("gray");
  });

  it("renders without sensor readings", () => {
    mockIsDesktop = false;
    const p = fakeProps();
    p.sensorReadings = undefined;
    p.config.moistureDebug = true;
    const { container } = render(<GardenModel {...p} />);
    expect(container.innerHTML).toContain("gray");
  });

  it("sets hover", () => {
    const p = fakeProps();
    p.config.labelsOnHover = true;
    const wrapper = createWrapper(p);
    const e = {
      stopPropagation: jest.fn(),
      intersections: [{ object: { name: "obj" } }],
    };
    const plants = wrapper.root.findAll(node => node.props.name == "plants")[0];
    actRenderer(() => {
      plants?.props.onPointerEnter(e);
    });
    expect(e.stopPropagation).toHaveBeenCalled();
  });

  it("sets hover with instance id", () => {
    const p = fakeProps();
    p.config.labelsOnHover = true;
    const wrapper = createWrapper(p);
    const e = {
      stopPropagation: jest.fn(),
      intersections: [{
        instanceId: 0,
        object: { userData: { plantIndexes: [0] }, name: "0" },
      }],
    };
    const plants = wrapper.root.findAll(node => node.props.name == "plants")[0];
    actRenderer(() => {
      plants?.props.onPointerEnter(e);
    });
    expect(e.stopPropagation).toHaveBeenCalled();
  });

  it("sets hover: buttons", () => {
    const p = fakeProps();
    p.config.labelsOnHover = true;
    const wrapper = createWrapper(p);
    const e = {
      stopPropagation: jest.fn(),
      buttons: true,
    };
    const plants = wrapper.root.findAll(node => node.props.name == "plants")[0];
    actRenderer(() => {
      plants?.props.onPointerEnter(e);
    });
    expect(e.stopPropagation).toHaveBeenCalled();
  });

  it("un-sets hover", () => {
    const p = fakeProps();
    p.config.labelsOnHover = true;
    const wrapper = createWrapper(p);
    const e = {
      stopPropagation: jest.fn(),
      intersections: [{ object: { name: "obj" } }],
    };
    const plants = wrapper.root.findAll(node => node.props.name == "plants")[0];
    actRenderer(() => {
      plants?.props.onPointerLeave(e);
    });
    expect(e.stopPropagation).toHaveBeenCalled();
  });

  it("doesn't set hover", () => {
    const p = fakeProps();
    p.config.labels = true;
    p.config.labelsOnHover = false;
    const wrapper = createWrapper(p);
    const e = { stopPropagation: jest.fn() };
    const plants = wrapper.root.findAll(node => node.props.name == "plants")[0];
    actRenderer(() => {
      plants?.props.onPointerEnter && plants.props.onPointerEnter(e);
    });
    expect(e.stopPropagation).not.toHaveBeenCalled();
  });

  it("logs debug event", () => {
    const consoleLogSpy = jest.spyOn(console, "log")
      .mockImplementation(jest.fn());
    const p = fakeProps();
    p.config.eventDebug = true;
    const wrapper = createWrapper(p);
    const root = wrapper.root.findAll(node => !!node.props.onPointerMove)[0];
    actRenderer(() => {
      root?.props.onPointerMove({
        intersections: [
          { object: { name: "1" } },
          { object: { name: "2" } },
        ],
      });
    });
    expect(consoleLogSpy).toHaveBeenCalledWith(["1", "2"]);
    consoleLogSpy.mockRestore();
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
