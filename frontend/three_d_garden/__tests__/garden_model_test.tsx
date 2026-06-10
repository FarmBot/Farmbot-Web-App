let mockIsDesktop = false;
let mockIsMobile = false;

import React from "react";
import { OrbitControls, useGLTF, useTexture } from "@react-three/drei";
import * as threeFiber from "@react-three/fiber";
import * as reactSpring from "@react-spring/three";
import {
  GardenModelProps, GardenModel, SMOOTH_XL_CAMERA_BED_SCALE,
  SMOOTH_XL_CAMERA_HEIGHT_SCALE,
} from "../garden_model";
import { clone } from "lodash";
import { INITIAL, INITIAL_POSITION, SurfaceDebugOption } from "../config";
import { render, waitFor } from "@testing-library/react";
import {
  fakePlant, fakePoint, fakePointGroup, fakeSensor, fakeSensorReading,
  fakeSequence, fakeTool, fakeToolSlot, fakeWeed,
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
import { BooleanSetting } from "../../session_keys";
import { Mode } from "../../farm_designer/map/interfaces";
import * as mapUtil from "../../farm_designer/map/util";
import {
  FallInGroup, GridRevealGroup, LoadStepReady, PopInGroup,
} from "../progressive_load";
import { AxesHelper } from "../components";
import { Clouds } from "../garden/clouds";
import { Ground } from "../garden/ground";
import { NorthArrow } from "../garden/north_arrow";
import { Solar } from "../garden/solar";
import { configureStore, store } from "../../redux/store";
import { resourceReady } from "../../sync/actions";
import { get3DPositionFunc } from "../helpers";
import { ThreeDObjectSelectionLayer } from "../selection/layer";

let isDesktopSpy: jest.SpyInstance;
let isMobileSpy: jest.SpyInstance;
let useStateSpy: jest.SpyInstance;
let resetStoreAfterTest = false;
const originalPathname = location.pathname;
const mountedWrappers: ReturnType<typeof createRenderer>[] = [];

describe("<GardenModel />", () => {
  beforeEach(() => {
    console.log = jest.fn();
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
    if (resetStoreAfterTest) {
      configureStore();
      resetStoreAfterTest = false;
    }
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

  const defaultLayerSetting = (setting: string) =>
    setting == BooleanSetting.show_plants
    || setting == BooleanSetting.show_points
    || setting == BooleanSetting.show_weeds
    || setting == BooleanSetting.show_farmbot;
  const bedSupportNames = ["bed-leg-wood", "caster-bracket", "wheel", "axle"];
  const findPlantInstanceNodes =
    (wrapper: ReturnType<typeof createRenderer>) =>
      wrapper.root.findAll(node => {
        const nodeName = typeof node.props.name == "string"
          ? node.props.name
          : "";
        return `${node.type}` == "instancedMesh" &&
          !bedSupportNames.includes(nodeName);
      });
  const plantInstanceCount = (container: HTMLElement) =>
    [...container.querySelectorAll("instancedmesh")]
      .filter(node => !bedSupportNames.includes(node.getAttribute("name") || ""))
      .length;

  it("renders", async () => {
    const { container } = render(<GardenModel {...fakeProps()} />);
    await waitFor(() =>
      expect(container.innerHTML).toContain("zoom-beacons"));
    expect(container.innerHTML).not.toContain("stats");
    expect(container.innerHTML).toContain("darkgreen");
    expect(container.innerHTML).toContain("bed-load-in");
    expect(container.innerHTML).toContain("grid-load-in");
    expect(container.innerHTML).toContain("zoom-beacons-load-in");
    expect(container.innerHTML).toContain("farmbot-scene-boundary");
    expect(container.innerHTML).toContain("details-scene-boundary");
  });

  it("notifies when the progressive reveal completes", async () => {
    const p = fakeProps();
    p.onLoadComplete = jest.fn();
    render(<GardenModel {...p} />);
    await waitFor(() => expect(p.onLoadComplete).toHaveBeenCalled());
  });

  it("notifies when scene details begin revealing", async () => {
    const p = fakeProps();
    p.onDetailsRevealStart = jest.fn();
    render(<GardenModel {...p} />);
    await waitFor(() =>
      expect(p.onDetailsRevealStart).toHaveBeenCalled());
  });

  it("marks empty optional layers ready without load-in wrappers", () => {
    const p = fakeProps();
    p.config.bot = false;
    p.config.labels = true;
    p.threeDPlants = [];
    p.mapPoints = [];
    p.weeds = [];
    const wrapper = createWrapper(p);
    const readySteps = wrapper.root.findAllByType(LoadStepReady)
      .map(node => node.props.step);
    expect(readySteps).toContain("plants");
    expect(readySteps).toContain("weeds");
    expect(readySteps).toContain("points");

    const optionalLoadIns = [
      ...wrapper.root.findAllByType(PopInGroup),
      ...wrapper.root.findAllByType(FallInGroup),
    ].filter(node =>
      typeof node.props.name == "string" &&
      ["plants-load-in", "weeds-load-in", "points-load-in"]
        .includes(node.props.name));
    expect(optionalLoadIns).toHaveLength(0);
  });

  it("marks hidden grids ready without a load-in wrapper", () => {
    const p = fakeProps();
    p.config.grid = false;
    const wrapper = createWrapper(p);
    const readySteps = wrapper.root.findAllByType(LoadStepReady)
      .map(node => node.props.step);
    expect(readySteps).toContain("grid");
    expect(wrapper.root.findAllByType(GridRevealGroup)).toHaveLength(0);
  });

  it("skips disabled default-off helper mounts", () => {
    const p = fakeProps();
    p.config.bot = false;
    p.config.north = false;
    p.config.solar = false;
    p.config.threeAxes = false;
    p.config.ground = false;
    p.config.clouds = false;
    const wrapper = createWrapper(p);
    expect(wrapper.root.findAllByType(NorthArrow)).toHaveLength(0);
    expect(wrapper.root.findAllByType(Solar)).toHaveLength(0);
    expect(wrapper.root.findAllByType(AxesHelper)).toHaveLength(0);
    expect(wrapper.root.findAllByType(Ground)).toHaveLength(0);
    expect(wrapper.root.findAllByType(Clouds)).toHaveLength(0);
  });

  it("mounts enabled default-off helpers", () => {
    const p = fakeProps();
    p.config.bot = false;
    p.config.north = true;
    p.config.solar = true;
    p.config.threeAxes = true;
    p.config.ground = true;
    p.config.clouds = true;
    const wrapper = createWrapper(p);
    expect(wrapper.root.findAllByType(NorthArrow)).toHaveLength(1);
    expect(wrapper.root.findAllByType(Solar)).toHaveLength(1);
    expect(wrapper.root.findAllByType(AxesHelper)).toHaveLength(1);
    expect(wrapper.root.findAllByType(Ground)).toHaveLength(1);
    expect(wrapper.root.findAllByType(Clouds)).toHaveLength(1);
  });

  it("reuses empty bed resource props across position updates", () => {
    const p = fakeProps();
    const wrapper = createWrapper(p);
    const findBedProps = () => wrapper.root.find(node =>
      node.props.soilSurfaceGeometry && node.props.activePositionRef).props;
    const before = findBedProps();
    actRenderer(() => wrapper.update(<GardenModel
      {...p}
      configPosition={{ ...p.configPosition, x: p.configPosition.x + 1 }} />));
    const after = findBedProps();
    expect(after.images).toBe(before.images);
    expect(after.mapPoints).toBe(before.mapPoints);
    expect(after.sensors).toBe(before.sensors);
    expect(after.sensorReadings).toBe(before.sensorReadings);
  });

  it("reuses soil surface geometry across unrelated config updates", () => {
    const p = fakeProps();
    const wrapper = createWrapper(p);
    const findBedProps = () => wrapper.root.find(node =>
      node.props.soilSurfaceGeometry && node.props.activePositionRef).props;
    const before = findBedProps().soilSurfaceGeometry;

    actRenderer(() => wrapper.update(<GardenModel
      {...p}
      config={{ ...p.config, sun: p.config.sun + 1 }} />));
    expect(findBedProps().soilSurfaceGeometry).toBe(before);

    actRenderer(() => wrapper.update(<GardenModel
      {...p}
      config={{ ...p.config, soilHeight: p.config.soilHeight + 1 }} />));
    expect(findBedProps().soilSurfaceGeometry).not.toBe(before);
  });

  it("reuses plant label nodes across unrelated config updates", () => {
    const p = fakeProps();
    p.config.labels = true;
    p.config.labelsOnHover = false;
    p.threeDPlants = convertPlants(p.config, [fakePlant()]);
    const wrapper = createWrapper(p);
    const findLabels = () => wrapper.root.find(node =>
      node.props.name == "plant-labels").props.children;
    const before = findLabels();

    actRenderer(() => wrapper.update(<GardenModel
      {...p}
      config={{ ...p.config, sun: p.config.sun + 1 }} />));
    expect(findLabels()).toBe(before);

    actRenderer(() => wrapper.update(<GardenModel
      {...p}
      config={{ ...p.config, bedLengthOuter: p.config.bedLengthOuter + 1 }} />));
    expect(findLabels()).not.toBe(before);
  });

  it("reuses static layers across telemetry position updates", () => {
    const p = fakeProps();
    p.addPlantProps = fakeAddPlantProps();
    p.addPlantProps.getConfigValue = jest.fn(defaultLayerSetting);
    p.threeDPlants = convertPlants(p.config, [fakePlant()]);
    const wrapper = createWrapper(p);
    (p.addPlantProps.getConfigValue as jest.Mock).mockClear();

    actRenderer(() => wrapper.update(<GardenModel
      {...p}
      configPosition={{
        ...p.configPosition,
        x: p.configPosition.x + 10,
        y: p.configPosition.y + 20,
      }} />));

    expect(p.addPlantProps.getConfigValue).not.toHaveBeenCalled();
  });

  it("updates static layers when layer settings change", () => {
    location.pathname = Path.mock(Path.designer());
    const p = fakeProps();
    const plant = fakePlant();
    p.config.bot = false;
    p.addPlantProps = fakeAddPlantProps();
    p.addPlantProps.getConfigValue = jest.fn(defaultLayerSetting);
    p.threeDPlants = convertPlants(p.config, [plant]);
    const wrapper = createWrapper(p);
    expect(findPlantInstanceNodes(wrapper).length).toEqual(1);

    const nextAddPlantProps = fakeAddPlantProps();
    nextAddPlantProps.getConfigValue = jest.fn(setting =>
      defaultLayerSetting(setting)
      || setting == BooleanSetting.show_spread);
    actRenderer(() => wrapper.update(<GardenModel
      {...p}
      addPlantProps={nextAddPlantProps} />));

    expect(findPlantInstanceNodes(wrapper).length).toEqual(2);
  });

  it("updates static layers when the route changes", () => {
    location.pathname = Path.mock(Path.designer());
    const p = fakeProps();
    const plant = fakePlant();
    p.config.bot = false;
    p.addPlantProps = fakeAddPlantProps();
    p.addPlantProps.getConfigValue = jest.fn(defaultLayerSetting);
    p.threeDPlants = convertPlants(p.config, [plant]);
    const wrapper = createWrapper(p);
    expect(findPlantInstanceNodes(wrapper).length).toEqual(1);

    location.pathname = Path.mock(Path.cropSearch("mint"));
    actRenderer(() => wrapper.update(<GardenModel {...p} />));

    expect(findPlantInstanceNodes(wrapper).length).toEqual(2);
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

  it("doesn't mount hidden plant spread instances in ordinary mode", () => {
    location.pathname = Path.mock(Path.designer());
    const p = fakeProps();
    const plant = fakePlant();
    p.addPlantProps = fakeAddPlantProps();
    p.addPlantProps.getConfigValue = jest.fn(setting =>
      setting == BooleanSetting.show_plants);
    p.threeDPlants = convertPlants(p.config, [plant]);

    const { container } = render(<GardenModel {...p} />);

    expect(plantInstanceCount(container)).toEqual(1);
  });

  it("mounts plant spread instances when spread is visible", () => {
    location.pathname = Path.mock(Path.designer());
    const p = fakeProps();
    const plant = fakePlant();
    p.addPlantProps = fakeAddPlantProps();
    p.addPlantProps.getConfigValue = jest.fn(setting =>
      setting == BooleanSetting.show_plants
      || setting == BooleanSetting.show_spread);
    p.threeDPlants = convertPlants(p.config, [plant]);

    const { container } = render(<GardenModel {...p} />);

    expect(plantInstanceCount(container)).toEqual(2);
  });

  it("mounts plant spread instances while adding a plant", () => {
    location.pathname = Path.mock(Path.cropSearch("mint"));
    const p = fakeProps();
    const plant = fakePlant();
    p.addPlantProps = fakeAddPlantProps();
    p.addPlantProps.getConfigValue = jest.fn(setting =>
      setting == BooleanSetting.show_plants);
    p.threeDPlants = convertPlants(p.config, [plant]);

    const { container } = render(<GardenModel {...p} />);

    expect(plantInstanceCount(container)).toEqual(2);
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
    plant.body.openfarm_slug = "beet";
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

  it("loads sequence visualization when selected", async () => {
    const sequence = fakeSequence();
    sequence.body.id = 1;
    const p = fakeProps();
    p.addPlantProps = fakeAddPlantProps();
    p.addPlantProps.designer.visualizedSequence = sequence.uuid;

    configureStore().dispatch(resourceReady("Sequence", sequence) as never);
    resetStoreAfterTest = true;
    expect(store.getState().resources.index.references[sequence.uuid])
      .toEqual(sequence);

    const { container } = render(<GardenModel {...p} />);

    await waitFor(() =>
      expect(container.innerHTML).toContain("visualization"));
  });

  it("doesn't render bot", () => {
    const p = fakeProps();
    p.addPlantProps = fakeAddPlantProps();
    p.addPlantProps.getConfigValue = () => false;
    const { container } = render(<GardenModel {...p} />);
    expect(container.innerHTML).not.toContain('name="bot"');
  });

  it("completes the progressive reveal without FarmBot", async () => {
    const p = fakeProps();
    p.addPlantProps = fakeAddPlantProps();
    p.addPlantProps.getConfigValue = () => false;
    p.onLoadComplete = jest.fn();
    render(<GardenModel {...p} />);
    await waitFor(() => expect(p.onLoadComplete).toHaveBeenCalled());
  });

  it("doesn't mount FarmBot while Planter bed focus hides it", async () => {
    const p = fakeProps();
    p.activeFocus = "Planter bed";
    p.addPlantProps = fakeAddPlantProps();
    p.addPlantProps.getConfigValue = jest.fn(setting =>
      setting == BooleanSetting.show_farmbot);
    const useGltfMock = useGLTF as unknown as jest.Mock;
    useGltfMock.mockClear();
    const { container } = render(<GardenModel {...p} />);

    await waitFor(() =>
      expect(container.innerHTML).toContain("farmbot-scene-boundary"));

    expect(container.innerHTML).not.toContain("bot-load-in");
    expect(useGltfMock).not.toHaveBeenCalled();
  });

  it("doesn't mount FarmBot while the 3D Bot layer is hidden", async () => {
    const p = fakeProps();
    p.config.bot = false;
    p.addPlantProps = fakeAddPlantProps();
    p.addPlantProps.getConfigValue = jest.fn(setting =>
      setting == BooleanSetting.show_farmbot);
    const useGltfMock = useGLTF as unknown as jest.Mock;
    useGltfMock.mockClear();
    const { container } = render(<GardenModel {...p} />);

    await waitFor(() =>
      expect(container.innerHTML).toContain("farmbot-scene-boundary"));

    expect(container.innerHTML).not.toContain("bot-load-in");
    expect(useGltfMock).not.toHaveBeenCalled();
  });

  it("unmounts FarmBot after hide animation exits", () => {
    const p = fakeProps();
    const wrapper = createWrapper(p);
    const botLoadIn = wrapper.root.findAllByType(FallInGroup)
      .find(node => node.props.name == "bot-load-in");
    actRenderer(() => {
      botLoadIn?.props.onExitRest();
    });
    expect(botLoadIn).toBeTruthy();
  });

  it("handles FarmBot layer progress callbacks", () => {
    const wrapper = createWrapper(fakeProps());
    const progressNodes = wrapper.root.findAll(node =>
      node.props.progress?.markStep && node.props.progress?.isStepAllowed);
    actRenderer(() => {
      progressNodes.forEach(node => {
        node.props.progress.markStep("farmbot");
        node.props.progress.isStepAllowed("farmbot");
      });
    });
    expect(progressNodes.length).toBeGreaterThan(0);
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
    p.threeDPlants = convertPlants(p.config, [fakePlant()]);
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
    p.threeDPlants = convertPlants(p.config, [fakePlant()]);
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

  it("sets hover on plant pointer move", () => {
    const p = fakeProps();
    p.config.labelsOnHover = true;
    p.threeDPlants = convertPlants(p.config, [fakePlant()]);
    const wrapper = createWrapper(p);
    const e = {
      stopPropagation: jest.fn(),
      intersections: [{ object: { name: "0" } }],
    };
    const plants = wrapper.root.findAll(node => node.props.name == "plants")[0];
    actRenderer(() => {
      plants?.props.onPointerMove(e);
    });
    expect(e.stopPropagation).toHaveBeenCalled();
  });

  it("sets hover with instance id and no plant index map", () => {
    const p = fakeProps();
    p.config.labelsOnHover = true;
    p.threeDPlants = convertPlants(p.config, [fakePlant()]);
    const wrapper = createWrapper(p);
    const e = {
      stopPropagation: jest.fn(),
      intersections: [{
        instanceId: 0,
        object: { userData: {}, name: "0" },
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
    p.threeDPlants = convertPlants(p.config, [fakePlant()]);
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
    p.threeDPlants = convertPlants(p.config, [fakePlant()]);
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

  it("handles scene leave and camera drag callbacks", () => {
    const p = fakeProps();
    const wrapper = createWrapper(p);
    const root = wrapper.root.findAll(node => !!node.props.onPointerLeave)[0];
    const orbitControls = wrapper.root.findByType(OrbitControls);
    actRenderer(() => {
      root.props.onPointerLeave();
      orbitControls.props.onStart();
      orbitControls.props.onEnd();
    });
    expect(root).toBeTruthy();
  });

  it("handles grid hover and location selection", () => {
    location.pathname = Path.mock(Path.designer());
    const p = fakeProps();
    const wrapper = createWrapper(p);
    const hoverTarget = wrapper.root.findByProps({ name: "grid-hover-target" });
    const point = get3DPositionFunc(p.config)({ x: 100, y: 100 });
    const event = {
      point,
      stopPropagation: jest.fn(),
    };
    actRenderer(() => {
      hoverTarget.props.onPointerOver(event);
      hoverTarget.props.onPointerMove(event);
      hoverTarget.props.onPointerOut();
      hoverTarget.props.onClick(event);
      hoverTarget.props.onClick({ ...event, delta: 3 });
      hoverTarget.props.onPointerMove({ point: { x: 100000, y: 100000 } });
    });
    expect(event.stopPropagation).toHaveBeenCalled();
  });

  it("deselects active objects and grid locations on second click", () => {
    location.pathname = Path.mock(Path.designer());
    useStateSpy.mockRestore();
    const actualUseState = jest.requireActual("react")
      .useState as typeof React.useState;
    useStateSpy = jest.spyOn(React, "useState")
      .mockImplementation(actualUseState);
    const p = fakeProps();
    const wrapper = createWrapper(p);
    const staticLayers = wrapper.root.findAll(node =>
      typeof node.props.onSelectObject == "function"
      && typeof node.props.onPlantHoverChange == "function")[0];
    const selectObject = staticLayers.props.onSelectObject;
    const getSelectionLayer = () =>
      wrapper.root.findByType(ThreeDObjectSelectionLayer).props;

    actRenderer(() => selectObject({ kind: "plant", id: 1 }));
    expect(getSelectionLayer().popupSelection)
      .toEqual({ kind: "plant", id: 1 });
    actRenderer(() => selectObject({ kind: "plant", id: 1 }));
    expect(getSelectionLayer().popupSelection).toBeUndefined();

    const hoverTarget = wrapper.root.findByProps({ name: "grid-hover-target" });
    const point = get3DPositionFunc(p.config)({ x: 100, y: 100 });
    const event = {
      point,
      stopPropagation: jest.fn(),
    };
    const locationSelection = { kind: "location", x: 100, y: 100, z: -500 };
    actRenderer(() => hoverTarget.props.onClick(event));
    expect(getSelectionLayer().locationSelection).toEqual(locationSelection);
    actRenderer(() => hoverTarget.props.onClick(event));
    expect(getSelectionLayer().locationSelection).toBeUndefined();
  });

  it("clears grid hover when grid selection becomes blocked", () => {
    const getModeSpy = jest.spyOn(mapUtil, "getMode").mockReturnValue(Mode.none);
    location.pathname = Path.mock(Path.designer());
    const p = fakeProps();
    const wrapper = createWrapper(p);
    const hoverTarget = wrapper.root.findByProps({ name: "grid-hover-target" });
    getModeSpy.mockReturnValue(Mode.cameraSelection);
    const point = get3DPositionFunc(p.config)({ x: 100, y: 100 });
    actRenderer(() => {
      hoverTarget.props.onPointerMove({ point });
    });
    expect(hoverTarget).toBeTruthy();
    getModeSpy.mockRestore();
  });

  it("updates selection callbacks from the model", () => {
    const p = fakeProps();
    p.addPlantProps = fakeAddPlantProps();
    const dispatch = jest.fn();
    p.addPlantProps.dispatch = dispatch;
    const wrapper = createWrapper(p);
    const staticLayers = wrapper.root.findAll(node =>
      typeof node.props.onSelectObject == "function"
      && typeof node.props.onPlantHoverChange == "function")[0];
    const selectionLayer = wrapper.root.findByType(ThreeDObjectSelectionLayer);
    const location = { kind: "location" as const, x: 1, y: 2, z: 3 };
    actRenderer(() => {
      staticLayers.props.onSelectObject({ kind: "plant", id: 1 });
      selectionLayer.props.onUpdateLocationSelection(location);
      selectionLayer.props.onOpenPanel({ kind: "plant", id: 1 });
      selectionLayer.props.onOpenLocationPanel(location);
      selectionLayer.props.onClosePopup();
      staticLayers.props.onHoverObject(true);
      staticLayers.props.onHoverObject(false);
    });
    expect(dispatch).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalled();
  });

  it("updates object selections in selection modes", () => {
    const getModeSpy = jest.spyOn(mapUtil, "getMode")
      .mockReturnValue(Mode.boxSelect);
    const p = fakeProps();
    const point = fakePoint();
    point.body.id = 1;
    p.mapPoints = [point];
    p.allPoints = [point];
    p.addPlantProps = fakeAddPlantProps();
    p.addPlantProps.designer.selectedPoints = [point.uuid];
    p.addPlantProps.designer.selectionPointType = ["GenericPointer"];
    p.addPlantProps.dispatch = jest.fn();
    const wrapper = createWrapper(p);
    const staticLayers = wrapper.root.findAll(node =>
      typeof node.props.onSelectObject == "function"
      && typeof node.props.onPlantHoverChange == "function")[0];
    const selectionLayer = wrapper.root.findByType(ThreeDObjectSelectionLayer);
    expect(selectionLayer.props.selectedObjects)
      .toEqual([{ kind: "point", id: 1 }]);
    expect(staticLayers.props.onSelectObject({ kind: "point", id: 1 }))
      .toBeTruthy();
    expect(staticLayers.props.onSelectObject({ kind: "weed", id: 999 }))
      .toBeFalsy();
    expect(p.addPlantProps.dispatch).toHaveBeenCalled();

    const group = fakePointGroup();
    group.body.id = 2;
    group.body.point_ids = [point.body.id];
    location.pathname = Path.mock(Path.groups(2));
    getModeSpy.mockReturnValue(Mode.editGroup);
    actRenderer(() => wrapper.update(<GardenModel
      {...p}
      groups={[group]}
      addPlantProps={fakeAddPlantProps()} />));
    expect(wrapper.root.findByType(ThreeDObjectSelectionLayer)
      .props.selectedObjects).toEqual([{ kind: "point", id: 1 }]);
    getModeSpy.mockRestore();
  });

  it("opens multi-select from route selection", () => {
    location.pathname = Path.mock(Path.plants(1));
    useStateSpy.mockRestore();
    const actualUseState = jest.requireActual("react")
      .useState as typeof React.useState;
    useStateSpy = jest.spyOn(React, "useState")
      .mockImplementation(actualUseState);
    const plant = fakePlant();
    plant.body.id = 1;
    const point = fakePoint();
    point.body.id = 2;
    const p = fakeProps();
    p.plants = [plant];
    p.mapPoints = [point];
    const addPlantProps = fakeAddPlantProps();
    addPlantProps.dispatch = jest.fn();
    p.addPlantProps = addPlantProps;
    const addEventSpy = jest.spyOn(window, "addEventListener");
    const wrapper = createWrapper(p);
    const staticLayers = wrapper.root.findAll(node =>
      typeof node.props.onSelectObject == "function"
      && typeof node.props.onPlantHoverChange == "function")[0];
    const selectObject = staticLayers.props.onSelectObject;
    const keydownHandler = addEventSpy.mock.calls
      .find(call => call[0] == "keydown")?.[1] as
      ((event: KeyboardEvent) => void) | undefined;
    const keyupHandler = addEventSpy.mock.calls
      .find(call => call[0] == "keyup")?.[1] as
      ((event: KeyboardEvent) => void) | undefined;
    const blurHandler = addEventSpy.mock.calls
      .find(call => call[0] == "blur")?.[1] as
      (() => void) | undefined;

    actRenderer(() => {
      keydownHandler?.(new KeyboardEvent("keydown", { ctrlKey: true }));
      selectObject({ kind: "plant", id: 1 });
      selectObject({ kind: "point", id: 2 });
      keyupHandler?.(new KeyboardEvent("keyup"));
      blurHandler?.();
    });

    addEventSpy.mockRestore();
    expect(addPlantProps.dispatch).toHaveBeenCalledWith({
      type: "SET_SELECTION_POINT_TYPE",
      payload: ["Plant", "GenericPointer", "Weed", "ToolSlot"],
    });
  });

  it("suppresses promo popups for FarmBot hardware", () => {
    const p = fakeProps();
    p.promo = true;
    const wrapper = createWrapper(p);
    const selectObject = wrapper.root.findAll(node =>
      typeof node.props.onSelectObject == "function")[0].props.onSelectObject;
    expect(selectObject({ kind: "camera", id: 0 })).toBeTruthy();
    expect(wrapper.root.findByType(ThreeDObjectSelectionLayer)
      .props.popupSelection).toBeUndefined();
  });

  it("renders object hover labels", () => {
    useStateSpy.mockRestore();
    const actualUseState = jest.requireActual("react")
      .useState as typeof React.useState;
    useStateSpy = jest.spyOn(React, "useState")
      .mockImplementation(actualUseState);
    const p = fakeProps();
    p.config.labelsOnHover = true;
    const weed = fakeWeed();
    weed.body.id = 1;
    weed.body.name = "Weed label";
    const point = fakePoint();
    point.body.id = 2;
    point.body.name = "Point label";
    const tool = fakeTool();
    tool.body.name = "Tool label";
    const toolSlot = fakeToolSlot();
    toolSlot.body.id = 3;
    toolSlot.body.tool_id = tool.body.id;
    p.weeds = [weed];
    p.mapPoints = [point];
    p.toolSlots = [{ toolSlot, tool }];
    const wrapper = createWrapper(p);
    const staticLayers = wrapper.root.findAll(node =>
      typeof node.props.onHoverObject == "function"
      && typeof node.props.onPlantHoverChange == "function")[0];
    const garden = wrapper.root.findAll(node =>
      typeof node.props.onPointerMove == "function"
      && typeof node.props.onPointerLeave == "function")[0];
    const setHoverLabel = wrapper.root.findAll(node =>
      typeof node.props.onHoverLabel == "function")[0].props.onHoverLabel;
    const hasText = (text: string) => wrapper.root.findAll(node =>
      node.children.includes(text)).length > 0;

    actRenderer(() => {
      staticLayers.props.onHoverObject(true);
      staticLayers.props.onHoverObject(false);
      garden.props.onPointerMove({ intersections: [] });
    });
    actRenderer(() => setHoverLabel({ kind: "weed", id: 1 }));
    expect(hasText("Weed label")).toBeTruthy();
    actRenderer(() => setHoverLabel({ kind: "point", id: 2 }));
    expect(hasText("Point label")).toBeTruthy();
    actRenderer(() => setHoverLabel({ kind: "slot", id: 3 }));
    expect(hasText("Tool label")).toBeTruthy();
    actRenderer(() => setHoverLabel({ kind: "weed", id: 999 }));
    expect(hasText("Weed label")).toBeFalsy();
    actRenderer(() => setHoverLabel({ kind: "camera", id: 0 }));
    expect(hasText("Point label")).toBeFalsy();
  });

  it("closes selections on Escape", () => {
    location.pathname = Path.mock(Path.designer());
    useStateSpy.mockRestore();
    const actualUseState = jest.requireActual("react")
      .useState as typeof React.useState;
    useStateSpy = jest.spyOn(React, "useState")
      .mockImplementation(actualUseState);
    const addEventSpy = jest.spyOn(window, "addEventListener");
    const wrapper = createWrapper(fakeProps());
    const selectionLayer = wrapper.root.findByType(ThreeDObjectSelectionLayer);
    actRenderer(() => {
      selectionLayer.props.onUpdateLocationSelection({
        kind: "location",
        x: 1,
        y: 2,
        z: 3,
      });
    });
    const keydownHandlers = addEventSpy.mock.calls
      .filter(call => call[0] == "keydown")
      .map(call => call[1]);
    const keydownHandler = keydownHandlers[keydownHandlers.length - 1] as
      ((event: KeyboardEvent) => void) | undefined;
    expect(keydownHandler).toBeDefined();
    actRenderer(() => {
      keydownHandler?.(new KeyboardEvent("keydown", { key: "Escape" }));
    });
    addEventSpy.mockRestore();
    expect(wrapper.root.findByType(ThreeDObjectSelectionLayer)
      .props.locationSelection).toBeUndefined();
    unmountRenderer(wrapper);
    mountedWrappers.splice(mountedWrappers.indexOf(wrapper), 1);
  });

  it("applies scene cursor styles", () => {
    const canvas = document.createElement("canvas");
    const connected = document.createElement("div");
    const model = document.createElement("div");
    model.className = "garden-bed-3d-model";
    model.appendChild(canvas);
    const state = {
      gl: {
        domElement: canvas,
        info: {
          render: { calls: 0, triangles: 0, points: 0, lines: 0 },
          memory: { geometries: 0, textures: 0 },
        },
      },
      events: { connected },
      scene: { traverse: jest.fn() },
      pointer: { x: 0, y: 0 },
      camera: {},
      raycaster: {
        setFromCamera: jest.fn(),
        intersectObjects: jest.fn(() => []),
      },
      size: { width: 800, height: 600 },
    };
    jest.spyOn(threeFiber, "useThree")
      .mockImplementation(() => state);
    const wrapper = createWrapper(fakeProps());
    expect(canvas.style.cursor).toEqual("grab");
    unmountRenderer(wrapper);
    mountedWrappers.pop();
    expect(canvas.style.cursor).toEqual("");
  });

  const mockSceneCursorTarget = () => {
    const canvas = document.createElement("canvas");
    const connected = document.createElement("div");
    const model = document.createElement("div");
    model.className = "garden-bed-3d-model";
    model.appendChild(canvas);
    const state = {
      gl: {
        domElement: canvas,
        info: {
          render: { calls: 0, triangles: 0, points: 0, lines: 0 },
          memory: { geometries: 0, textures: 0 },
        },
      },
      events: { connected },
      scene: { traverse: jest.fn() },
      pointer: { x: 0, y: 0 },
      camera: {},
      raycaster: {
        setFromCamera: jest.fn(),
        intersectObjects: jest.fn(() => []),
      },
      size: { width: 800, height: 600 },
    };
    const useThreeSpy = jest.spyOn(threeFiber, "useThree")
      .mockImplementation(() => state);
    return { canvas, useThreeSpy };
  };

  it("applies pointer cursor while hovering selectable objects", () => {
    useStateSpy.mockRestore();
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
        const setter = jest.fn((next: S | ((value: S) => S)) => {
          if (typeof next == "function") {
            (next as (value: S | undefined) => S)(value);
          }
        });
        if (initialState === 0) {
          return [1, setter];
        }
        return [value, setter];
      });
    const { canvas, useThreeSpy } = mockSceneCursorTarget();
    const wrapper = createWrapper(fakeProps());
    const staticLayers = wrapper.root.findAll(node =>
      typeof node.props.onHoverObject == "function"
      && typeof node.props.onPlantHoverChange == "function")[0];
    const root = wrapper.root.findAll(node => !!node.props.onPointerMove)[0];
    actRenderer(() => {
      staticLayers.props.onHoverObject(true);
      root.props.onPointerMove({
        intersections: [{
          object: { userData: { plantIndexes: [0] }, name: "plant" },
        }],
      });
    });
    expect(canvas.style.cursor).toEqual("pointer");
    useThreeSpy.mockRestore();
  });

  it("applies grabbing cursor while dragging the camera", () => {
    useStateSpy.mockRestore();
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
        if (initialState === false) {
          return [true, jest.fn()];
        }
        return [value, jest.fn()];
      });
    const { canvas, useThreeSpy } = mockSceneCursorTarget();
    createWrapper(fakeProps());
    expect(canvas.style.cursor).toEqual("grabbing");
    useThreeSpy.mockRestore();
  });

  it("renders grid hover crosshairs with real state", () => {
    useStateSpy.mockRestore();
    const actualUseState = jest.requireActual("react")
      .useState as typeof React.useState;
    useStateSpy = jest.spyOn(React, "useState")
      .mockImplementation(actualUseState);
    location.pathname = Path.mock(Path.designer());
    const p = fakeProps();
    const wrapper = createWrapper(p);
    const hoverTarget = wrapper.root.findByProps({ name: "grid-hover-target" });
    const point = get3DPositionFunc(p.config)({ x: 100, y: 100 });
    actRenderer(() => {
      hoverTarget.props.onPointerMove({ point });
    });
    expect(wrapper.root.findAllByProps({ name: "grid-hover-crosshairs" }).length)
      .toBeGreaterThan(0);
  });

  it("smooths config changes", () => {
    const springSpy = jest.spyOn(reactSpring, "useSpring")
      .mockImplementation((props: Parameters<typeof reactSpring.useSpring>[0]) => {
        const resolved = typeof props == "function" ? props() : props;
        const api = {
          start: jest.fn((update: {
            onChange?: (result: { value: Record<string, number> }) => void;
            onRest?: () => void;
          }) => {
            update.onChange?.({ value: { bedLengthOuter: 1400 } });
            update.onRest?.();
            return Promise.resolve();
          }),
        };
        return [resolved, api] as unknown as ReturnType<typeof reactSpring.useSpring>;
      });
    const p = fakeProps();
    p.smoothConfigTransitions = true;
    const wrapper = createWrapper(p);
    actRenderer(() => wrapper.update(<GardenModel
      {...p}
      config={{ ...p.config, bedLengthOuter: p.config.bedLengthOuter + 1 }} />));
    expect(springSpy).toHaveBeenCalled();
  });

  it("preloads inactive environment scenes", async () => {
    const p = fakeProps();
    p.preloadEnvironmentScenes = true;
    p.config.bot = false;
    p.config.zoomBeacons = false;
    p.onLoadComplete = jest.fn();
    render(<GardenModel {...p} />);
    await waitFor(() =>
      expect(p.onLoadComplete).toHaveBeenCalled());
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

  it("mounts only the selected scene details", async () => {
    const countSceneNodes = (
      container: HTMLElement,
      name: string,
    ) =>
      container.querySelectorAll(`group[name="${name}"]`).length;

    const outdoorProps = fakeProps();
    outdoorProps.config.scene = "Outdoor";
    const outdoor = render(<GardenModel {...outdoorProps} />);
    expect(countSceneNodes(outdoor.container, "lab-environment")).toEqual(0);
    expect(countSceneNodes(outdoor.container, "greenhouse-environment"))
      .toEqual(0);

    const labProps = fakeProps();
    labProps.config.scene = "Lab";
    const lab = render(<GardenModel {...labProps} />);
    await waitFor(() =>
      expect(countSceneNodes(lab.container, "lab-environment")).toEqual(1));
    expect(countSceneNodes(lab.container, "greenhouse-environment")).toEqual(0);

    const greenhouseProps = fakeProps();
    greenhouseProps.config.scene = "Greenhouse";
    const greenhouse = render(<GardenModel {...greenhouseProps} />);
    expect(countSceneNodes(greenhouse.container, "lab-environment")).toEqual(0);
    await waitFor(() =>
      expect(countSceneNodes(greenhouse.container, "greenhouse-environment"))
        .toEqual(1));
  });

  it("shows night sky", () => {
    const p = fakeProps();
    p.config.sun = 0;
    const { container } = render(<GardenModel {...p} />);
    expect(container.innerHTML).toContain("color=\"0,0,0\"");
  });
});
