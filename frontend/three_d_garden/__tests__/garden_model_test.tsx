let mockIsDesktop = false;
let mockIsMobile = false;

import React from "react";
import { OrbitControls, useTexture } from "@react-three/drei";
import {
  GardenModelProps, GardenModel, SMOOTH_XL_CAMERA_BED_SCALE,
  SMOOTH_XL_CAMERA_HEIGHT_SCALE,
} from "../garden_model";
import { clone } from "lodash";
import { INITIAL, INITIAL_POSITION, SurfaceDebugOption } from "../config";
import { render, waitFor } from "@testing-library/react";
import {
  fakePlant, fakePoint, fakeSensor, fakeSensorReading, fakeWeed,
} from "../../__test_support__/fake_state/resources";
import { fakeAddPlantProps } from "../../__test_support__/fake_props";
import { Path } from "../../internal_urls";
import { fakeDrawnPoint } from "../../__test_support__/fake_designer_state";
import { convertPlants } from "../../farm_designer/three_d_garden_map";
import * as screenSize from "../../screen_size";
import {
  actRenderer,
  createRenderer,
  unmountRenderer,
} from "../../__test_support__/test_renderer";
import { PLANT_ICON_ATLAS } from "../garden/plant_icon_atlas";
import { cameraInit } from "../camera";
import { getCamera } from "../zoom_beacons_constants";

let isDesktopSpy: jest.SpyInstance;
let isMobileSpy: jest.SpyInstance;
let useStateSpy: jest.SpyInstance;
const originalPathname = location.pathname;
const mountedWrappers: ReturnType<typeof createRenderer>[] = [];

describe("<GardenModel />", () => {
  beforeEach(() => {
    mockIsDesktop = false;
    mockIsMobile = false;
    useStateSpy = jest.spyOn(React, "useState")
      // eslint-disable-next-line comma-spacing
      .mockImplementation(<S,>(initialState?: S | (() => S)) => {
        // eslint-disable-next-line no-null/no-null
        if (initialState === null) {
          return [{}, jest.fn()];
        }
        const value = typeof initialState == "function"
          ? (initialState as () => S)()
          : initialState;
        return [value, jest.fn()];
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
    delete PLANT_ICON_ATLAS["/crops/icons/beet.avif"];
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

  it("renders", async () => {
    const { container } = render(<GardenModel {...fakeProps()} />);
    await waitFor(() =>
      expect(container.innerHTML).toContain("zoom-beacons"));
    expect(container.innerHTML).not.toContain("stats");
    expect(container.innerHTML).toContain("darkgreen");
    expect(container.innerHTML).toContain("bed-load-in");
    expect(container.innerHTML).toContain("grid-load-in");
    expect(container.innerHTML).toContain("plants-load-in");
    expect(container.innerHTML).toContain("points-load-in");
    expect(container.innerHTML).toContain("weeds-load-in");
    expect(container.innerHTML).toContain("zoom-beacons-load-in");
  });

  it("renders top down view", () => {
    mockIsMobile = true;
    const p = fakeProps();
    p.config.topDown = true;
    p.config.viewpointHeading = 90;
    const wrapper = createWrapper(p);
    const orbitControls = wrapper.root.findByType(OrbitControls);
    expect(orbitControls.props.minAzimuthAngle).toEqual(Math.PI / 2);
    expect(orbitControls.props.maxAzimuthAngle).toEqual(Math.PI / 2);
  });

  it("rounds top down heading up to the nearest 90 degrees", () => {
    mockIsMobile = true;
    const p = fakeProps();
    p.config.topDown = true;
    p.config.viewpointHeading = 1;
    const wrapper = createWrapper(p);
    const orbitControls = wrapper.root.findByType(OrbitControls);
    expect(orbitControls.props.minAzimuthAngle).toEqual(Math.PI / 2);
    expect(orbitControls.props.maxAzimuthAngle).toEqual(Math.PI / 2);
  });

  it("scales top down zoom by bed length", () => {
    const p = fakeProps();
    p.config.topDown = true;
    p.config.bedLengthOuter = 6000;
    const wrapper = createWrapper(p);
    const camera = wrapper.root.findAll(node => node.props.name == "camera")[0];
    expect(camera?.props.zoom).toEqual(0.125);
  });

  it("increases top down zoom for shorter beds", () => {
    const p = fakeProps();
    p.config.topDown = true;
    p.config.bedLengthOuter = 1500;
    const wrapper = createWrapper(p);
    const camera = wrapper.root.findAll(node => node.props.name == "camera")[0];
    expect(camera?.props.zoom).toEqual(0.5);
  });

  it("keeps focused camera coordinates with smooth transitions disabled", () => {
    const p = fakeProps();
    p.activeFocus = "What you can grow";
    p.smoothFocusTransitions = true;
    p.config.animate = false;
    const wrapper = createWrapper(p);
    const camera = wrapper.root.findAll(node => node.props.name == "camera")[0];
    const defaultCamera = cameraInit({
      topDown: p.config.topDown,
      viewpointHeading: p.config.viewpointHeading,
      bedSize: { x: p.config.bedLengthOuter, y: p.config.bedWidthOuter },
    });
    const expectedCamera = getCamera(
      p.config,
      p.configPosition,
      p.activeFocus,
      defaultCamera,
    );
    expect(camera?.props.position).toEqual(expectedCamera.position);
    expect(wrapper.root.findByType(OrbitControls).props.target)
      .toEqual(expectedCamera.target);
  });

  it("moves the smooth XL default camera back and higher", () => {
    const p = fakeProps();
    p.smoothFocusTransitions = true;
    p.config.animate = false;
    p.config.sizePreset = "Genesis XL";
    p.config.bedLengthOuter = 6000;
    p.config.bedWidthOuter = 2860;
    const wrapper = createWrapper(p);
    const camera = wrapper.root.findAll(node => node.props.name == "camera")[0];
    const expectedCamera = cameraInit({
      topDown: p.config.topDown,
      viewpointHeading: p.config.viewpointHeading,
      bedSize: {
        x: p.config.bedLengthOuter * SMOOTH_XL_CAMERA_BED_SCALE,
        y: p.config.bedWidthOuter * SMOOTH_XL_CAMERA_BED_SCALE,
      },
    });
    expect(camera?.props.position).toEqual([
      expectedCamera.position[0],
      expectedCamera.position[1],
      expectedCamera.position[2] * SMOOTH_XL_CAMERA_HEIGHT_SCALE,
    ]);
  });

  it("renders camera selection view", async () => {
    const p = fakeProps();
    p.config.cameraSelectionView = true;
    p.config.viewpointHeading = 45;
    const { container } = render(<GardenModel {...p} />);
    await waitFor(() =>
      expect(container.innerHTML).toContain("camera-selection"));
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
    p.config.labels = true;
    p.config.labelsOnHover = false;
    p.threeDPlants = convertPlants(p.config, [plant]);
    const { queryAllByText } = render(<GardenModel {...p} />);
    const plantLabels = queryAllByText("Beet");
    expect(plantLabels.length).toEqual(1);
  });

  it("doesn't build plant label nodes when labels are disabled", () => {
    const p = fakeProps();
    const plant = fakePlant();
    plant.body.name = "Beet";
    p.config.labels = false;
    p.config.labelsOnHover = false;
    p.threeDPlants = convertPlants(p.config, [plant]);
    const { queryAllByText } = render(<GardenModel {...p} />);
    const plantLabels = queryAllByText("Beet");
    expect(plantLabels.length).toEqual(0);
  });

  it("preloads the atlas texture for mapped plant icons", () => {
    PLANT_ICON_ATLAS["/crops/icons/beet.avif"] = {
      atlasUrl: "/crops/icons/atlas.avif",
      textureWidth: 256,
      textureHeight: 256,
      x: 0,
      y: 0,
      width: 64,
      height: 64,
    };
    const p = fakeProps();
    const plant = fakePlant();
    plant.body.name = "Beet";
    p.threeDPlants = convertPlants(p.config, [plant]);

    render(<GardenModel {...p} />);

    expect(useTexture).toHaveBeenCalledWith("/crops/icons/atlas.avif");
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
    useStateSpy = jest.spyOn(React, "useState")
      // eslint-disable-next-line comma-spacing
      .mockImplementation(<S,>(initialState?: S | (() => S)) => {
        if (initialState === undefined) {
          return [0, jest.fn()];
        }
        // eslint-disable-next-line no-null/no-null
        if (initialState === null) {
          return [{}, jest.fn()];
        }
        const value = typeof initialState == "function"
          ? (initialState as () => S)()
          : initialState;
        return [value, jest.fn()];
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
    expect(container.innerHTML).toContain("marker");
    expect(container.innerHTML).toContain("weed-icons");
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

  it("renders other options", async () => {
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
    await waitFor(() => expect(container.innerHTML).toContain("stats"));
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
