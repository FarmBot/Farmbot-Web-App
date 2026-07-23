let mockIsDesktop = false;
let mockIsMobile = false;

import React from "react";
import {
  OrbitControls, PerspectiveCamera, useGLTF, useTexture,
} from "@react-three/drei";
import * as threeFiber from "@react-three/fiber";
import * as reactSpring from "@react-spring/three";
import {
  advanceSpaceflightOrbit, cameraAtRadius, cameraRadius,
  blockCameraFollowEscape,
  cameraFitRadiusForZoom,
  cameraSideStarClipEnabled,
  constellationDiscoveryEnabled,
  createCameraFitRequest, createGardenRouteSnapshot,
  createStartingCameraSelector,
  createViewDirectionRequest,
  FarmDesignerViewPrism,
  GardenCameraRig,
  GardenSceneBackground,
  GardenCameraRequest, GardenModelProps, GardenModel,
  getSpaceflightCamera,
  getVisibleSpaceflightViewport,
  getViewPrismCameraProjection,
  getViewPrismColors,
  notifyStartingCameraSaved,
  PANEL_CAMERA_TRANSITION_MS,
  retargetCameraRequestFov,
  selectGardenViewportHeight, selectGardenViewportWidth,
  stargazingOrbitPolarLimits,
  GardenCameraControllerProps,
  useGardenCameraController,
  useShiftModifier,
  usePanelCameraViewOffset,
  SPACEFLIGHT_CAMERA,
  SPACEFLIGHT_FOV,
  SPACEFLIGHT_VIEWPORT_MARGIN_RATIO,
  ViewPrismBridge,
  VIEW_PRISM_VIEWPORT_SIZE,
} from "../garden_model";
import { createPanelCameraStore } from "../panel_camera";
import { clone } from "lodash";
import { INITIAL, INITIAL_POSITION, SurfaceDebugOption } from "../config";
import {
  act, render, renderHook, waitFor,
} from "@testing-library/react";
import {
  fakePlant, fakePoint, fakePointGroup, fakeSensor, fakeSensorReading,
  fakeSceneObject, fakeSequence, fakeTool, fakeToolSlot, fakeWeed,
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
import {
  cameraInit, distanceForFov, getCameraFit, getPanelCameraViewOffset,
  getSphereCameraFit,
} from "../camera";
import * as cameraModule from "../camera";
import { BigDistance } from "../constants";
import { getCamera } from "../zoom_beacons_constants";
import { BooleanSetting } from "../../session_keys";
import { Mode } from "../../farm_designer/map/interfaces";
import { DEFAULT_SCENE_OBJECT } from "../../scene_objects/add";
import * as mapUtil from "../../farm_designer/map/util";
import {
  FallInGroup, GridRevealGroup, LoadStepReady, PopInGroup,
} from "../progressive_load";
import { AxesHelper, Primitive } from "../components";
import { Clouds } from "../garden/clouds";
import { GROUND_TEXTURE_URLS, Ground } from "../garden/ground";
import { NorthArrow } from "../garden/north_arrow";
import { LegacySolar } from "../garden/solar";
import { Sun } from "../garden/sun";
import { configureStore, store } from "../../redux/store";
import { resourceReady } from "../../sync/actions";
import { get3DPositionFunc, getGardenPositionFunc } from "../helpers";
import { ThreeDObjectSelectionLayer } from "../selection/layer";
import { GardenAreaSelectionOverlay, GroupAreaSelectionOverlay } from
  "../selection/area_selection";
import { Bed } from "../bed";
import { getStargazingCamera, Telescope } from "../bed/objects/telescope";
import { Actions } from "../../constants";
import { SECTION_CLIPPING_EXEMPT } from "../section";
import { SectionGroundOverlays } from "../section_overlays";
import { SectionControls } from "../section_controls";
import {
  ViewPrism, VIEW_PRISM_TOP_CENTER,
  VIEW_PRISM_TOP_CENTER_BOUNDING_RADIUS,
} from "../view_prism";
import { success } from "../../toast/toast";
import * as toast from "../../toast/toast";
import {
  Color, Group as ThreeGroup,
  PerspectiveCamera as ThreePerspectiveCamera, Vector3,
} from "three";
import { SceneObjects, staticSceneObjects } from "../scene_objects";
import * as sceneObjectActions from "../../scene_objects/actions";
import * as pointGroupActions from "../../point_groups/actions";
import * as crud from "../../api/crud";
import { bot as fakeBot } from "../../__test_support__/fake_state/bot";

let isDesktopSpy: jest.SpyInstance;
let isMobileSpy: jest.SpyInstance;
let useStateSpy: jest.SpyInstance;
const useStateSetters: jest.Mock[] = [];
let setCameraUrlParamsSpy: jest.SpyInstance | undefined;
let resetStoreAfterTest = false;
const originalPathname = location.pathname;
const mountedWrappers: ReturnType<typeof createRenderer>[] = [];

describe("<GardenModel />", () => {
  beforeEach(() => {
    console.log = jest.fn();
    mockIsDesktop = false;
    mockIsMobile = false;
    useStateSetters.length = 0;
    useStateSpy = jest.spyOn(React, "useState")
      // eslint-disable-next-line comma-spacing
      .mockImplementation(<S,>(initialState?: S | (() => S)) => {
        const setter = jest.fn();
        useStateSetters.push(setter);
        // eslint-disable-next-line no-null/no-null
        if (initialState === null) {
          return [{}, setter];
        }
        const value = typeof initialState == "function"
          ? (initialState as () => S)()
          : initialState;
        return [value, setter];
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
    setCameraUrlParamsSpy?.mockRestore();
    setCameraUrlParamsSpy = undefined;
  });

  const fakeProps = (): GardenModelProps => ({
    config: clone(INITIAL),
    configPosition: clone(INITIAL_POSITION),
    activeFocus: "",
    setActiveFocus: jest.fn(),
    addPlantProps: fakeAddPlantProps(),
    firmwareSettings: fakeBot.hardware.mcu_params,
    threeDPlants: [],
  });

  const createWrapper = (p: GardenModelProps) => {
    const wrapper = createRenderer(<GardenModel {...p} />);
    mountedWrappers.push(wrapper);
    return wrapper;
  };

  const restoreActualReactState = () => {
    useStateSpy.mockRestore();
    const actualUseState = jest.requireActual("react")
      .useState as typeof React.useState;
    useStateSpy = jest.spyOn(React, "useState")
      .mockImplementation(actualUseState);
  };

  const renderCompletedAreaSelection = (p: GardenModelProps) => {
    location.pathname = Path.mock(Path.designer());
    restoreActualReactState();
    const wrapper = createWrapper(p);
    const hoverTarget = wrapper.root.findByProps({
      name: "grid-hover-target",
    });
    const start = get3DPositionFunc(p.config)({ x: 100, y: 100 });
    const end = get3DPositionFunc(p.config)({ x: 400, y: 400 });
    actRenderer(() => {
      window.dispatchEvent(new KeyboardEvent("keydown", {
        key: "Shift",
        shiftKey: true,
      }));
      hoverTarget.props.onPointerMove({ point: start });
    });
    actRenderer(() => {
      hoverTarget.props.onClick({
        point: start,
        shiftKey: true,
        intersections: [],
        stopPropagation: jest.fn(),
      });
    });
    actRenderer(() => {
      window.dispatchEvent(new KeyboardEvent("keyup", {
        key: "Shift",
        shiftKey: false,
      }));
      hoverTarget.props.onPointerMove({ point: end });
    });
    actRenderer(() => {
      hoverTarget.props.onClick({
        point: end,
        shiftKey: false,
        intersections: [],
        stopPropagation: jest.fn(),
      });
    });
    return {
      wrapper,
      overlay: () => wrapper.root.findByType(GardenAreaSelectionOverlay),
    };
  };

  const areaSelectionActionProps = () => {
    const plant = fakePlant();
    plant.body.id = 1;
    plant.body.x = 150;
    plant.body.y = 150;
    const p = fakeProps();
    p.plants = [plant];
    p.addPlantProps = fakeAddPlantProps();
    const dispatch = jest.fn();
    p.addPlantProps.dispatch = dispatch;
    p.addPlantProps.getConfigValue = jest.fn(() => true);
    return { dispatch, p, plant };
  };

  const createCameraUrlWrapper = (promo = true) => {
    setCameraUrlParamsSpy = jest.spyOn(cameraModule, "setCameraUrlParams")
      .mockImplementation(jest.fn());
    const p = fakeProps();
    p.promo = promo;
    p.config.urlCameraPos = true;
    const wrapper = createWrapper(p);
    const controls = () => wrapper.root.findByType(OrbitControls);
    const expectedCamera = cameraInit({
      viewpointHeading: p.config.viewpointHeading,
      bedSize: {
        x: p.config.bedLengthOuter,
        y: p.config.bedWidthOuter,
      },
      zoomFactor: p.config.zoomFactor,
    });
    const expectedFit = getCameraFit({
      viewport: { width: 800, height: 600 },
      bedSize: {
        x: p.config.bedLengthOuter,
        y: p.config.bedWidthOuter,
      },
    });
    return {
      controls,
      expectedCamera: cameraAtRadius(expectedCamera, expectedFit.cameraRadius),
      p,
      wrapper,
    };
  };
  const waitForCameraUrlSave = () =>
    new Promise<void>(resolve => window.setTimeout(resolve, 200));

  const defaultLayerSetting = (setting: string) =>
    setting == BooleanSetting.show_plants
    || setting == BooleanSetting.show_points
    || setting == BooleanSetting.show_weeds
    || setting == BooleanSetting.show_farmbot;
  const plantInstanceNames = [
    "plant-icon-instances",
    "plant-spread-instances",
  ];
  const findPlantInstanceNodes =
    (wrapper: ReturnType<typeof createRenderer>) =>
      wrapper.root.findAll(node => {
        const nodeName = typeof node.props.name == "string"
          ? node.props.name
          : "";
        return `${node.type}` == "instancedMesh" &&
          plantInstanceNames.includes(nodeName);
      });
  const plantInstanceCount = (container: HTMLElement) =>
    [...container.querySelectorAll("instancedmesh")]
      .filter(node =>
        plantInstanceNames.includes(node.getAttribute("name") || ""))
      .length;

  it("renders", async () => {
    const { container } = render(<GardenModel {...fakeProps()} />);
    await waitFor(() =>
      expect(container.innerHTML).toContain("zoom-beacons"));
    expect(container.innerHTML).not.toContain("stats");
    expect(container.innerHTML).toContain("#ddd");
    expect(container.innerHTML).toContain("bed-load-in");
    expect(container.innerHTML).toContain("grid-load-in");
    expect(container.innerHTML).toContain("zoom-beacons-load-in");
    expect(container.innerHTML).toContain("farmbot-scene-boundary");
    expect(container.innerHTML).toContain("details-scene-boundary");
  });

  it("isolates generic panel routes from the heavy scene", () => {
    window.localStorage.setItem("FB_PERF_BENCHMARK", "true");
    location.pathname = Path.mock(Path.plants());
    const p = fakeProps();
    const wrapper = createWrapper(p);
    const initialRenders =
      window.__fbPerf?.counts["render.GardenModel"];

    location.pathname = Path.mock(Path.designer());
    actRenderer(() => wrapper.update(<GardenModel {...p} />));
    expect(window.__fbPerf?.counts["render.GardenModel"])
      .toEqual(initialRenders);

    location.pathname = Path.mock(Path.plants(1));
    actRenderer(() => wrapper.update(<GardenModel {...p} />));
    expect(window.__fbPerf?.counts["render.GardenModel"])
      .toBeGreaterThan(initialRenders || 0);
  });

  it("distinguishes scene-relevant routes", () => {
    const setRoute = (route: string) => {
      const [pathname, search = ""] = Path.mock(route).split("?");
      location.pathname = pathname;
      location.search = search ? `?${search}` : "";
      return createGardenRouteSnapshot(
        location.pathname,
        location.search,
      );
    };
    const generic = setRoute(Path.plants());
    expect(setRoute(Path.designer()).key).toEqual(generic.key);

    const plant = setRoute(Path.plants(1));
    expect(plant.selection).toEqual({ kind: "plant", id: 1 });
    expect(plant.key).not.toEqual(generic.key);

    const point = setRoute(Path.points(2));
    expect(point.selection).toEqual({ kind: "point", id: 2 });

    const group = setRoute(Path.groups(3));
    expect(group.groupId).toEqual(3);

    const selectedLocation = setRoute(
      Path.location({ x: 10, y: 20, z: 30 }),
    );
    expect(selectedLocation.locationSelection).toEqual({
      kind: "location",
      x: 10,
      y: 20,
      z: 30,
    });

    const sceneObject = setRoute(Path.sceneObjects("add"));
    expect(sceneObject.addingSceneObject).toBeTruthy();
  });

  it("selects primitive canvas viewport dimensions", () => {
    const size = { width: 800, height: 600 };
    expect(selectGardenViewportWidth({ size } as never)).toEqual(800);
    expect(selectGardenViewportHeight({ size } as never)).toEqual(600);
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
    expect(wrapper.root.findAllByType(LegacySolar)).toHaveLength(0);
    expect(wrapper.root.findAllByType(AxesHelper)).toHaveLength(0);
    expect(wrapper.root.findAllByType(Ground)
      .filter(node => node.props.config === p.config)).toHaveLength(1);
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
    expect(wrapper.root.findAllByType(LegacySolar)).toHaveLength(1);
    expect(wrapper.root.findAllByType(AxesHelper)).toHaveLength(1);
    expect(wrapper.root.findAllByType(Ground)
      .filter(node => node.props.config === p.config)).toHaveLength(1);
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
    expect(after.plants).toBe(before.plants);
    expect(after.weeds).toBe(before.weeds);
    expect(after.sensors).toBe(before.sensors);
    expect(after.sensorReadings).toBe(before.sensorReadings);
  });

  it("passes visible alignment resources to the bed", () => {
    const p = fakeProps();
    p.threeDPlants = convertPlants(p.config, [fakePlant()]);
    p.mapPoints = [fakePoint()];
    p.weeds = [fakeWeed()];
    const wrapper = createWrapper(p);
    const bedProps = wrapper.root.findByType(Bed).props;

    expect(bedProps.plants).toBe(p.threeDPlants);
    expect(bedProps.mapPoints).toBe(p.mapPoints);
    expect(bedProps.weeds).toBe(p.weeds);
    expect(bedProps.showPlants).toBeTruthy();
    expect(bedProps.showPoints).toBeTruthy();
    expect(bedProps.showWeeds).toBeTruthy();
  });

  it("keeps the existing plant layer visible during grid placement", () => {
    const p = fakeProps();
    p.activeFocus = "Planter bed";
    p.threeDPlants = convertPlants(p.config, [fakePlant()]);
    p.addPlantProps = fakeAddPlantProps();
    p.addPlantProps.getConfigValue = jest.fn(() => false);
    p.addPlantProps.designer.gridPlanting = {
      token: "grid-token",
      gridId: "grid-token",
      cropSlug: "mint",
      itemName: "Mint",
      defaultSpacing: 250,
    };
    const wrapper = createWrapper(p);
    const plantLoadIn = wrapper.root.findAllByType(PopInGroup)
      .find(node => node.props.name == "plants-load-in");

    expect(wrapper.root.findByType(Bed).props.showPlants).toBeTruthy();
    expect(plantLoadIn?.props.reveal).toBeTruthy();
  });

  it("keeps the existing point layer visible during point grid placement",
    () => {
      const p = fakeProps();
      p.addPlantProps = fakeAddPlantProps();
      p.addPlantProps.getConfigValue = jest.fn(() => false);
      p.addPlantProps.designer.gridPlanting = {
        token: "point-grid-token",
        gridId: "point-grid-token",
        gridType: "point",
        itemName: "Point",
        defaultSpacing: 60,
        radius: 30,
      };
      const wrapper = createWrapper(p);

      expect(wrapper.root.findByType(Bed).props.showPoints).toBeTruthy();
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

  it("keeps the perspective camera unchanged in section view", () => {
    const getCameraFromUrlParamsSpy = jest
      .spyOn(cameraModule, "getCameraFromUrlParams")
      .mockReturnValue({
        position: [1, 2, 3],
        target: [4, 5, 6],
      });
    const p = fakeProps();
    p.config.urlCameraPos = true;
    p.config.perspective = true;
    p.config.rotate = false;
    p.config.pan = true;
    p.config.zoom = true;
    p.addPlantProps!.designer.threeDSectionOpen = true;
    p.addPlantProps!.designer.threeDSectionAxis = "y";
    const wrapper = createWrapper(p);
    const camera = wrapper.root.findAll(node => node.props.name == "camera")[0];
    const cutFaces = wrapper.root.findAll(node =>
      node.props.name == "section-cut-faces")[0];
    const sceneObjects = wrapper.root.findByProps({ name: "scene-objects" });
    const bedSupports = wrapper.root.findByProps({ name: "bed-supports" });
    const controls = wrapper.root.findByType(OrbitControls);

    expect(wrapper.root.findAllByType(PerspectiveCamera).length)
      .toBeGreaterThan(0);
    expect(camera.props.position).toEqual([1, 2, 3]);
    expect(camera.props.near).toEqual(10);
    expect(camera.props.far).toEqual(75000);
    expect(controls.props.target).toEqual([4, 5, 6]);
    expect(controls.props.enableRotate).toEqual(false);
    expect(controls.props.enablePan).toEqual(true);
    expect(controls.props.enableZoom).toEqual(true);
    expect(cutFaces.props.userData[SECTION_CLIPPING_EXEMPT]).toEqual(true);
    expect(sceneObjects.props.userData[SECTION_CLIPPING_EXEMPT]).toEqual(true);
    expect(bedSupports.props.userData[SECTION_CLIPPING_EXEMPT]).toEqual(false);
    expect(wrapper.root.findAllByType(SectionGroundOverlays)).toHaveLength(1);
    expect(wrapper.root.findAllByType(SectionControls)).toHaveLength(1);
    const sectionOverlays = wrapper.root.findByType(SectionGroundOverlays);
    expect(sectionOverlays.props.sectionOpacity).toEqual(1);
    const sectionControls = wrapper.root.findByType(SectionControls);
    expect(sectionControls.props.axis).toEqual("y");
    expect(sectionControls.props.opacity).toEqual(1);
    expect(sectionControls.props.interactive).toEqual(true);
    expect(Number.isFinite(sectionControls.props.center)).toEqual(true);
    expect(Number.isFinite(sectionControls.props.width)).toEqual(true);
    getCameraFromUrlParamsSpy.mockRestore();
  });

  it("suspends camera springs while following during FOV changes", () => {
    useStateSpy.mockRestore();
    const actualUseState = jest.requireActual("react")
      .useState as typeof React.useState;
    useStateSpy = jest.spyOn(React, "useState")
      .mockImplementation(actualUseState);
    interface CameraSpringUpdate {
      onRest(result?: { cancelled?: boolean }): void;
    }
    let springUpdate: CameraSpringUpdate | undefined;
    const springApi = {
      start: jest.fn((update: CameraSpringUpdate) => {
        springUpdate = update;
        return Promise.resolve();
      }),
      stop: jest.fn(),
    };
    const springSpy = jest.spyOn(reactSpring, "useSpring")
      .mockImplementation(props => {
        const resolved = typeof props == "function" ? props() : props;
        return [resolved, springApi] as unknown as
          ReturnType<typeof reactSpring.useSpring>;
      });
    const normalDistance = 5000;
    const narrowDistance = distanceForFov(normalDistance, 40, 1);
    const target: [number, number, number] = [0, 0, 0];
    const narrowCamera = {
      position: [narrowDistance, 0, 0] as [number, number, number],
      target,
    };
    const normalCamera = {
      position: [normalDistance, 0, 0] as [number, number, number],
      target,
    };
    const controlsCamera = new ThreePerspectiveCamera(1);
    controlsCamera.position.set(...narrowCamera.position);
    const controls = {
      target: new Vector3(...target),
      update: jest.fn(),
    };
    const rigProps: React.ComponentProps<typeof GardenCameraRig> = {
      camera: narrowCamera,
      zoom: 1,
      fov: 1,
      smooth: true,
      interpolation: undefined,
      cancelRef: { current: undefined },
      onRest: undefined,
      controlsCamera,
      setControlsCamera: jest.fn(),
      controls,
      setControls: jest.fn(),
      panelCameraView: getPanelCameraViewOffset(
        { width: 800, height: 600 },
        undefined,
      ),
      cameraPhase: "normal",
      spaceflightCamera: SPACEFLIGHT_CAMERA,
      viewMode: "normal",
      cameraFollow: false,
      utmFollow: false,
      rotate: true,
      zoomEnabled: true,
      pan: true,
      lightsDebug: false,
      onStart: jest.fn(),
      onChange: jest.fn(),
      onEnd: jest.fn(),
    };
    const wrapper = createRenderer(<GardenCameraRig {...rigProps} />);
    mountedWrappers.push(wrapper);
    const orbitControls = () => wrapper.root.findByType(OrbitControls);

    expect(orbitControls().props.maxDistance)
      .toBeCloseTo(narrowDistance * 1.25);
    const initialSpringStarts = springApi.start.mock.calls.length;
    const initialSpringHooks = springSpy.mock.calls.length;

    actRenderer(() => wrapper.update(<GardenCameraRig
      {...rigProps}
      cameraFollow={true} />));
    expect(orbitControls().props.enableRotate).toEqual(false);
    expect(orbitControls().props.enablePan).toEqual(false);
    expect(orbitControls().props.enableZoom).toEqual(false);
    expect(orbitControls().props.minDistance).toEqual(0);
    expect(orbitControls().props.maxDistance).toEqual(Infinity);
    expect(springApi.stop).toHaveBeenCalled();

    actRenderer(() => wrapper.update(<GardenCameraRig
      {...rigProps}
      zoomEnabled={false}
      utmFollow={true} />));
    expect(orbitControls().props.enableRotate).toEqual(false);
    expect(orbitControls().props.enablePan).toEqual(false);
    expect(orbitControls().props.enableZoom).toEqual(true);
    expect(orbitControls().props.zoomToCursor).toEqual(false);
    expect(orbitControls().props.minDistance).toEqual(500);
    expect(orbitControls().props.maxDistance)
      .toBeCloseTo(narrowDistance * 1.25);

    actRenderer(() => wrapper.update(<GardenCameraRig
      {...rigProps}
      camera={normalCamera}
      fov={40}
      cameraFollow={true} />));

    expect(springApi.start).toHaveBeenCalledTimes(initialSpringStarts);
    expect(springSpy).toHaveBeenCalledTimes(initialSpringHooks);
    expect(orbitControls().props.maxDistance).toEqual(Infinity);

    actRenderer(() => wrapper.update(<GardenCameraRig
      {...rigProps}
      camera={normalCamera}
      fov={40}
      cameraFollow={false} />));

    expect(orbitControls().props.maxDistance)
      .toBeCloseTo(narrowDistance * 1.25);
    expect(springSpy).toHaveBeenCalledTimes(initialSpringHooks + 1);
    expect(springApi.start.mock.calls.length)
      .toBeGreaterThan(initialSpringStarts);

    actRenderer(() => springUpdate?.onRest({ cancelled: false }));

    expect(orbitControls().props.maxDistance).toEqual(BigDistance.zoom);
    springSpy.mockRestore();
  });

  it("finds hovered objects in the featured scene", async () => {
    const p = fakeProps();
    p.config.scene = "Lab";
    p.addPlantProps!.designer.featuredScene = "Outdoor";
    const featuredObject = staticSceneObjects("Outdoor")[0];
    p.addPlantProps!.designer.hoveredSceneObject = featuredObject.uuid;
    const wrapper = createWrapper(p);
    await waitFor(() =>
      expect(wrapper.root.findAllByType(SceneObjects)).toHaveLength(1));
    const sceneObjects = wrapper.root.findByType(SceneObjects);

    expect(sceneObjects.props.hoverSelection).toEqual({
      kind: "sceneObject",
      id: 0,
      uuid: featuredObject.uuid,
    });
  });

  it("enters stargazing with the requested FOV and constrained orbit", () => {
    const p = fakeProps();
    p.addPlantProps!.designer.threeDViewMode = "stargazing";
    p.addPlantProps!.designer.threeDStargazingFov = 35;
    const wrapper = createWrapper(p);
    const controls = wrapper.root.findByType(OrbitControls);
    expect(controls.props.enableRotate).toEqual(true);
    expect(controls.props.enablePan).toEqual(false);
    expect(controls.props.enableZoom).toEqual(false);
    expect(controls.props.minPolarAngle).toEqual(Math.PI / 2);
    expect(controls.props.maxPolarAngle).toEqual(Math.PI);
    expect(wrapper.root.findByType(Sun).props.showSun).toEqual(true);
    expect(wrapper.root.findByType(Sun).props.cameraSideClipEnabled)
      .toEqual(false);
    expect(wrapper.root.findByType(Sun).props.constellationDiscoveryEnabled)
      .toEqual(true);
    expect(wrapper.root.findAllByType(GridRevealGroup)).toHaveLength(1);

    const cameraRequests = useStateSetters.flatMap(setter =>
      (setter.mock.calls as unknown[][])
        .map(call => call[0])
        .filter((value): value is GardenCameraRequest =>
          typeof value == "object" && !!value
          && "camera" in value && "fov" in value));
    const stargazingRequest = cameraRequests.find(request =>
      request.fov == 35);
    expect(stargazingRequest).toBeTruthy();
    expect(stargazingRequest?.camera)
      .toEqual(getStargazingCamera(p.config));
    actRenderer(() => controls.props.onChange());
    actRenderer(() => controls.props.onEnd());
  });

  it("enters spaceflight with z-axis orbit controls", () => {
    const p = fakeProps();
    p.addPlantProps!.designer.threeDViewMode = "spaceflight";
    const wrapper = createWrapper(p);
    const controls = wrapper.root.findByType(OrbitControls);

    expect(controls.props.enableRotate).toEqual(true);
    expect(controls.props.enablePan).toEqual(false);
    expect(controls.props.enableZoom).toEqual(false);
    expect(controls.props.minPolarAngle)
      .toEqual(controls.props.maxPolarAngle);
    const cameraRequests = useStateSetters.flatMap(setter =>
      (setter.mock.calls as unknown[][])
        .map(call => call[0])
        .filter((value): value is GardenCameraRequest =>
          typeof value == "object" && !!value
          && "camera" in value && "fov" in value));
    const visibleViewport = getVisibleSpaceflightViewport(
      { width: 800, height: 600 },
      { width: window.innerWidth, height: window.innerHeight },
    );
    expect(cameraRequests).toContainEqual(expect.objectContaining({
      camera: getSpaceflightCamera(visibleViewport),
      fov: SPACEFLIGHT_FOV,
    }));
    const sun = wrapper.root.findByType(Sun);
    expect(sun.props.cameraSideClipEnabled).toEqual(true);
    expect(sun.props.constellationDiscoveryEnabled).toEqual(true);
    expect(sun.props.showSun).toEqual(false);
    expect(wrapper.root.findAllByType(GridRevealGroup)).toHaveLength(0);
  });

  it("advances the spaceflight orbit at fixed radius and elevation", () => {
    const next = advanceSpaceflightOrbit(SPACEFLIGHT_CAMERA, 1);

    expect(next.target).toEqual(SPACEFLIGHT_CAMERA.target);
    expect(next.position[2]).toEqual(SPACEFLIGHT_CAMERA.position[2]);
    expect(Math.hypot(
      next.position[0] - next.target[0],
      next.position[1] - next.target[1],
    )).toBeCloseTo(Math.hypot(
      SPACEFLIGHT_CAMERA.position[0] - SPACEFLIGHT_CAMERA.target[0],
      SPACEFLIGHT_CAMERA.position[1] - SPACEFLIGHT_CAMERA.target[1],
    ));
    expect(next.position).not.toEqual(SPACEFLIGHT_CAMERA.position);
  });

  it("moves the spaceflight camera out for a narrow viewport", () => {
    const wide = getSpaceflightCamera({ width: 1200, height: 600 });
    const narrow = getSpaceflightCamera({ width: 375, height: 667 });

    expect(cameraRadius(narrow)).toBeGreaterThan(cameraRadius(wide));
    expect(narrow.target[2]).toBeLessThan(wide.target[2]);
  });

  it("fits spaceflight to the browser-visible canvas area", () => {
    const canvasViewport = { width: 1650, height: 600 };
    const visibleViewport = getVisibleSpaceflightViewport(
      canvasViewport,
      { width: 1200, height: 800 },
    );

    expect(visibleViewport).toEqual({ width: 1200, height: 600 });
    expect(cameraRadius(getSpaceflightCamera(visibleViewport)))
      .toBeGreaterThan(cameraRadius(getSpaceflightCamera(canvasViewport)));
  });

  it("fits the spaceflight camera to the stars sphere", () => {
    const viewport = { width: 1200, height: 600 };
    const camera = getSpaceflightCamera(viewport);
    const fit = getSphereCameraFit({
      viewport,
      radius: BigDistance.sunVisual,
      fov: SPACEFLIGHT_FOV,
      marginRatio: 0.05,
    });

    expect(SPACEFLIGHT_VIEWPORT_MARGIN_RATIO).toEqual(0.05);
    expect(Math.hypot(...camera.position)).toBeCloseTo(Math.hypot(
      fit.centerDepth,
      fit.centerVerticalOffset,
    ));
  });

  it("renders the sky through the scene background", () => {
    const wrapper = createWrapper(fakeProps());
    const backgroundColor =
      wrapper.root.findByType(Sun).props.backgroundColor;
    const background = wrapper.root.findAllByType(Primitive)
      .find(node => node.props.attach == "background");

    expect(backgroundColor).toBeInstanceOf(Color);
    expect(background?.props.object).toBe(backgroundColor);
    expect(wrapper.root.findAll(node => node.props.name == "sky"))
      .toHaveLength(0);
  });

  it("holds the scene background until the environment is ready", () => {
    const backgroundColor = new Color("#2c362f");
    const wrapper = createRenderer(<GardenSceneBackground
      backgroundColor={backgroundColor}
      ready={false} />);
    mountedWrappers.push(wrapper);
    expect(wrapper.root.findAllByType(Primitive)).toHaveLength(0);

    actRenderer(() => wrapper.update(<GardenSceneBackground
      backgroundColor={backgroundColor}
      ready={true} />));
    expect(wrapper.root.findByType(Primitive).props.object)
      .toBe(backgroundColor);
  });

  it("hides focus beacons while stargazing", () => {
    const p = fakeProps();
    const beaconLoadIn = (wrapper: ReturnType<typeof createRenderer>) =>
      wrapper.root.findAll(node =>
        node.props.name == "zoom-beacons-load-in");
    const wrapper = createWrapper(p);
    expect(beaconLoadIn(wrapper).length).toBeGreaterThan(0);

    p.addPlantProps = {
      ...p.addPlantProps!,
      designer: {
        ...p.addPlantProps!.designer,
        threeDViewMode: "stargazing",
      },
    };
    actRenderer(() => wrapper.update(<GardenModel {...p} />));
    expect(beaconLoadIn(wrapper)).toHaveLength(0);

    p.addPlantProps = {
      ...p.addPlantProps,
      designer: {
        ...p.addPlantProps.designer,
        threeDViewMode: "normal",
      },
    };
    actRenderer(() => wrapper.update(<GardenModel {...p} />));
    expect(beaconLoadIn(wrapper).length).toBeGreaterThan(0);
  });

  it("passes spaceflight state to the telescope", () => {
    const p = fakeProps();
    p.addPlantProps!.designer.threeDViewMode = "spaceflight";
    const wrapper = createWrapper(p);
    expect(wrapper.root.findByType(Telescope).props.spaceflight).toEqual(true);
    expect(wrapper.root.findByType(Telescope).props.stargazing).toEqual(false);
  });

  it("hides the telescope throughout the promo", () => {
    const p = fakeProps();
    p.promo = true;
    p.config.scene = "Lab";
    const wrapper = createWrapper(p);
    expect(wrapper.root.findAllByType(Telescope)).toHaveLength(0);

    p.config.scene = "Outdoor";
    actRenderer(() => wrapper.update(<GardenModel {...p} />));
    expect(wrapper.root.findAllByType(Telescope)).toHaveLength(0);

    p.config.scene = "Greenhouse";
    actRenderer(() => wrapper.update(<GardenModel {...p} />));
    expect(wrapper.root.findAllByType(Telescope)).toHaveLength(0);

    p.promo = false;
    p.config.scene = "Lab";
    actRenderer(() => wrapper.update(<GardenModel {...p} />));
    expect(wrapper.root.findAllByType(Telescope)).toHaveLength(1);
  });

  it("hides the telescope and sphere in section view", () => {
    const p = fakeProps();
    const wrapper = createWrapper(p);
    expect(wrapper.root.findAllByType(Telescope)).toHaveLength(1);

    p.addPlantProps = {
      ...p.addPlantProps!,
      designer: {
        ...p.addPlantProps!.designer,
        threeDSectionOpen: true,
      },
    };
    actRenderer(() => wrapper.update(<GardenModel {...p} />));
    expect(wrapper.root.findAllByType(Telescope)).toHaveLength(0);

    p.addPlantProps = {
      ...p.addPlantProps,
      designer: {
        ...p.addPlantProps.designer,
        threeDSectionOpen: false,
      },
    };
    actRenderer(() => wrapper.update(<GardenModel {...p} />));
    expect(wrapper.root.findAllByType(Telescope)).toHaveLength(1);
  });

  it("disables legacy solar shadows in the promo", () => {
    const p = fakeProps();
    p.promo = true;
    p.config.solar = true;
    const wrapper = createWrapper(p);

    expect(wrapper.root.findByType(LegacySolar).props.shadows)
      .toEqual(false);
  });

  it("returns to the top corner after stargazing", () => {
    const p = fakeProps();
    p.addPlantProps!.designer.threeDViewMode = "stargazing";
    const wrapper = createWrapper(p);

    p.addPlantProps = {
      ...p.addPlantProps!,
      designer: {
        ...p.addPlantProps!.designer,
        threeDViewMode: "normal",
      },
    };
    actRenderer(() => wrapper.update(<GardenModel {...p} />));

    const cameraRequests = useStateSetters.flatMap(setter =>
      (setter.mock.calls as unknown[][])
        .map(call => call[0])
        .filter((value): value is GardenCameraRequest =>
          typeof value == "object" && !!value
          && "camera" in value && "fov" in value));
    const restored = cameraRequests[cameraRequests.length - 1];
    expect(restored.fov).not.toEqual(
      p.addPlantProps.designer.threeDStargazingFov,
    );
    expect(restored.camera.position[0]).toBeGreaterThan(0);
    expect(restored.camera.position[1]).toBeLessThan(0);
    expect(restored.camera.position[2]).toBeGreaterThan(0);
  });

  it("keeps polar limits permissive during stargazing transitions", () => {
    expect(stargazingOrbitPolarLimits("transitioning")).toEqual({
      min: 0,
      max: Math.PI,
    });
  });

  it("disables camera-side star clipping after stargazing settles", () => {
    expect(cameraSideStarClipEnabled("normal")).toEqual(true);
    expect(cameraSideStarClipEnabled("spaceflight")).toEqual(true);
    expect(cameraSideStarClipEnabled("transitioning")).toEqual(true);
    expect(cameraSideStarClipEnabled("stargazing")).toEqual(false);
  });

  it("discovers constellations only in settled celestial modes", () => {
    expect(constellationDiscoveryEnabled("normal", "normal"))
      .toEqual(false);
    expect(constellationDiscoveryEnabled("stargazing", "transitioning"))
      .toEqual(false);
    expect(constellationDiscoveryEnabled("spaceflight", "transitioning"))
      .toEqual(false);
    expect(constellationDiscoveryEnabled("stargazing", "stargazing"))
      .toEqual(true);
    expect(constellationDiscoveryEnabled("spaceflight", "spaceflight"))
      .toEqual(true);
  });

  it("locks the spaceflight polar angle", () => {
    const limits = stargazingOrbitPolarLimits("spaceflight");

    expect(limits.min).toEqual(limits.max);
    expect(limits.min).toBeGreaterThan(0);
    expect(limits.max).toBeLessThan(Math.PI);
  });

  it("only exempts raised bed supports from section clipping", () => {
    const p = fakeProps();
    const wrapper = createWrapper(p);
    const bedSupports = () =>
      wrapper.root.findByProps({ name: "bed-supports" });

    expect(bedSupports().props.userData[SECTION_CLIPPING_EXEMPT])
      .toEqual(false);

    p.config = { ...p.config, bedZOffset: 100 };
    actRenderer(() => wrapper.update(<GardenModel {...p} />));

    expect(bedSupports().props.userData[SECTION_CLIPPING_EXEMPT])
      .toEqual(true);

    p.config = { ...p.config, bedZOffset: 0 };
    actRenderer(() => wrapper.update(<GardenModel {...p} />));

    expect(bedSupports().props.userData[SECTION_CLIPPING_EXEMPT])
      .toEqual(false);
  });

  it("only renders ground projections in section view", () => {
    const closed = createWrapper(fakeProps());
    expect(closed.root.findAllByType(SectionGroundOverlays)).toHaveLength(0);
    expect(closed.root.findAllByType(SectionControls)).toHaveLength(0);

    const p = fakeProps();
    p.addPlantProps!.designer.threeDSectionOpen = true;
    const open = createWrapper(p);
    expect(open.root.findAllByType(SectionGroundOverlays)).toHaveLength(1);
    expect(open.root.findAllByType(SectionControls)).toHaveLength(1);
  });

  it("handles the product view prism and live orbit changes", () => {
    const p = fakeProps();
    p.addPlantProps!.designer.threeDSectionOpen = true;
    p.viewPrismBridgeRef = { current: {} };
    const wrapper = createWrapper(p);
    const cameras = wrapper.root.findAllByType(PerspectiveCamera);
    const mainCamera = cameras.find(camera => camera.props.name == "camera");
    expect(mainCamera?.props.fov).toEqual(40);
    expect(wrapper.root.findAllByType(ViewPrism)).toHaveLength(0);
    expect(p.viewPrismBridgeRef.current?.selectDirection)
      .toEqual(expect.any(Function));
    actRenderer(() => {
      p.viewPrismBridgeRef?.current?.selectDirection?.([1, 1, 0]);
      p.viewPrismBridgeRef?.current?.selectDirection?.([0, 0, 1]);
    });
    actRenderer(() => wrapper.root.findByType(OrbitControls).props.onChange());
    expect(wrapper.root.findAllByType(PerspectiveCamera)).toHaveLength(1);
  });

  it("prioritizes open UI before exiting camera follow", () => {
    location.pathname = Path.mock(Path.designer());
    restoreActualReactState();
    const p = fakeProps();
    p.addPlantProps!.designer.threeDCameraFollow = true;
    p.panelCameraStore = createPanelCameraStore(true);
    p.viewPrismBridgeRef = { current: {} };
    const wrapper = createWrapper(p);
    const dispatch = p.addPlantProps!.dispatch as jest.Mock;
    dispatch.mockClear();

    actRenderer(() =>
      p.viewPrismBridgeRef?.current?.selectDirection?.([0, 0, 1]));

    expect(dispatch).toHaveBeenCalledWith({
      type: Actions.SET_3D_CAMERA_FOLLOW,
      payload: false,
    });
    dispatch.mockClear();

    const selectionLayer =
      wrapper.root.findByType(ThreeDObjectSelectionLayer);
    actRenderer(() => selectionLayer.props.onUpdateLocationSelection({
      kind: "location",
      x: 1,
      y: 2,
      z: 3,
    }));
    expect(wrapper.root.findByType(ThreeDObjectSelectionLayer)
      .props.locationSelection).toBeDefined();
    location.pathname = Path.mock(Path.plants("select"));
    actRenderer(() => wrapper.update(<GardenModel {...p} />));
    expect(wrapper.root.findByType(ThreeDObjectSelectionLayer)
      .props.locationSelection).toBeUndefined();

    actRenderer(() => {
      window.dispatchEvent(new KeyboardEvent("keydown", {
        key: "Escape",
        cancelable: true,
      }));
    });
    expect(dispatch).toHaveBeenCalledWith(expect.any(Function));
    expect(dispatch).not.toHaveBeenCalledWith({
      type: Actions.SET_3D_CAMERA_FOLLOW,
      payload: false,
    });
    dispatch.mockClear();
    p.panelCameraStore.setOpen(false);

    actRenderer(() => {
      window.dispatchEvent(new KeyboardEvent("keydown", {
        key: "Escape",
        cancelable: true,
      }));
    });
    expect(dispatch).toHaveBeenCalledWith({
      type: Actions.SET_3D_CAMERA_FOLLOW,
      payload: false,
    });
  });

  it("exits UTM follow from the view prism", () => {
    const p = fakeProps();
    p.addPlantProps!.designer.threeDUTMFollow = true;
    p.viewPrismBridgeRef = { current: {} };
    const wrapper = createWrapper(p);
    const dispatch = p.addPlantProps!.dispatch as jest.Mock;
    dispatch.mockClear();
    const orbitControls = wrapper.root.findByType(OrbitControls);
    expect(orbitControls.props.enableRotate).toEqual(false);
    expect(orbitControls.props.enablePan).toEqual(false);
    expect(orbitControls.props.enableZoom).toEqual(true);

    actRenderer(() =>
      p.viewPrismBridgeRef?.current?.selectDirection?.([0, 0, 1]));

    expect(dispatch).toHaveBeenCalledWith({
      type: Actions.SET_3D_UTM_FOLLOW,
      payload: false,
    });
  });

  it("uses computed theme colors for the product view prism", () => {
    const element = document.createElement("div");
    element.style.setProperty("--main-bg", "rgb(1, 2, 3)");
    element.style.setProperty(
      "--view-prism-hover-color",
      "rgb(4, 5, 6)",
    );
    element.style.setProperty("--text-color", "rgb(7, 8, 9)");
    element.style.setProperty("--border-color", "rgb(10, 11, 12)");
    document.body.appendChild(element);
    expect(getViewPrismColors(element)).toEqual({
      color: "rgb(1, 2, 3)",
      hoverColor: "rgb(4, 5, 6)",
      textColor: "rgb(7, 8, 9)",
      strokeColor: "rgb(10, 11, 12)",
    });
    expect(getViewPrismColors(undefined)).toEqual({
      color: "#f0f0f0",
      hoverColor: "#22a273",
      textColor: "#333",
      strokeColor: "#777",
    });
    element.remove();
  });

  it("mirrors the live scene-camera rotation in the view prism", () => {
    const sourceCamera = new ThreePerspectiveCamera();
    sourceCamera.fov = 40;
    sourceCamera.rotation.set(0.1, 0.2, 0.3);
    const selectDirection = jest.fn();
    const bridgeRef = {
      current: { camera: sourceCamera, selectDirection },
    };
    const useThreeCallCount = (threeFiber.useThree as jest.Mock).mock.calls.length;
    const wrapper = createRenderer(
      <FarmDesignerViewPrism
        bridgeRef={bridgeRef} />,
    );
    mountedWrappers.push(wrapper);
    const gizmoGroup = wrapper.root.findAll(node => !!node.props.object)
      .map(node => node.props.object as unknown)
      .find(object => object instanceof ThreeGroup) as ThreeGroup;
    expect(gizmoGroup.quaternion.toArray()).toEqual(
      sourceCamera.quaternion.clone().invert().toArray(),
    );
    gizmoGroup.updateMatrixWorld();
    new Vector3(...VIEW_PRISM_TOP_CENTER)
      .applyMatrix4(gizmoGroup.matrixWorld)
      .toArray()
      .map(value => expect(value).toBeCloseTo(0));
    const gizmoCamera = (threeFiber.useThree as jest.Mock)
      .mock.results[useThreeCallCount].value.camera as ThreePerspectiveCamera;
    expect(gizmoCamera.position.toArray()[0]).toEqual(0);
    expect(gizmoCamera.position.toArray()[1]).toEqual(0);
    expect(gizmoCamera.fov).toEqual(40);
    const gizmo = wrapper.root.findByType(ViewPrism);
    actRenderer(() => gizmo.props.onDirection([1, 0, 0]));
    expect(selectDirection).toHaveBeenCalledWith([1, 0, 0]);
  });

  it("preserves gizmo scale throughout perspective transitions", () => {
    const normalFov = 40;
    const narrowFov = 1;
    const normal = getViewPrismCameraProjection(600, normalFov);
    const narrow = getViewPrismCameraProjection(600, narrowFov);
    const visibleHeight = (distance: number, fov: number) =>
      2 * distance * Math.tan(fov * Math.PI / 360);
    expect(visibleHeight(normal.distance, normalFov)).toBeCloseTo(600);
    expect(visibleHeight(narrow.distance, narrowFov)).toBeCloseTo(600);
    expect(narrow.distance).toBeGreaterThan(normal.distance);
    expect(normal.near).toBeGreaterThan(0);
    expect(normal.far).toBeGreaterThan(normal.distance);
    expect(narrow.near).toBeGreaterThan(normal.far);
  });

  it("frames the full prism rotation around its top-center target", () => {
    const projection = getViewPrismCameraProjection(
      VIEW_PRISM_VIEWPORT_SIZE,
      40,
    );
    const visibleHeight = 2 * projection.distance
      * Math.tan(40 * Math.PI / 360);
    expect(visibleHeight)
      .toBeGreaterThan(VIEW_PRISM_TOP_CENTER_BOUNDING_RADIUS * 2);
  });

  it("centers the perspective viewport camera on the view prism", () => {
    const width = 100;
    const height = 100;
    const fov = 40;
    const projection = getViewPrismCameraProjection(height, fov);
    const camera = new ThreePerspectiveCamera(fov, width / height);
    camera.position.set(0, 0, projection.distance);
    camera.updateMatrixWorld();
    const projected = new Vector3(0, 0, 0).project(camera);
    expect(projected.x).toBeCloseTo(0);
    expect(projected.y).toBeCloseTo(0);
  });

  it("respects disabled camera rotation in normal view", () => {
    mockIsMobile = true;
    const p = fakeProps();
    p.config.rotate = false;
    const wrapper = createWrapper(p);
    const orbitControls = wrapper.root.findByType(OrbitControls);
    expect(orbitControls.props.enableRotate).toEqual(false);
  });

  it("keeps focused camera coordinates with smooth transitions disabled", () => {
    const p = fakeProps();
    p.activeFocus = "What you can grow";
    p.smoothFocusTransitions = true;
    p.config.animate = false;
    const wrapper = createWrapper(p);
    const camera = wrapper.root.findAll(node => node.props.name == "camera")[0];
    const defaultCamera = cameraInit({
      viewpointHeading: p.config.viewpointHeading,
      bedSize: { x: p.config.bedLengthOuter, y: p.config.bedWidthOuter },
      zoomFactor: p.config.zoomFactor,
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

  it("loads app camera position and target from the URL", () => {
    const expectedCamera = {
      position: [100, 200, 300] as [number, number, number],
      target: [10, 20, 30] as [number, number, number],
    };
    const getCameraFromUrlParamsSpy = jest
      .spyOn(cameraModule, "getCameraFromUrlParams")
      .mockReturnValue(expectedCamera);
    const p = fakeProps();
    p.config.urlCameraPos = true;
    const wrapper = createWrapper(p);
    const camera = wrapper.root.findAll(node => node.props.name == "camera")[0];

    expect(camera?.props.position).toEqual(expectedCamera.position);
    expect(wrapper.root.findByType(OrbitControls).props.target)
      .toEqual(expectedCamera.target);
    getCameraFromUrlParamsSpy.mockRestore();
  });

  it("fits the XL default camera to the viewport", () => {
    const p = fakeProps();
    p.smoothFocusTransitions = true;
    p.config.animate = false;
    p.config.sizePreset = "Genesis XL";
    p.config.bedLengthOuter = 6000;
    p.config.bedWidthOuter = 2860;
    const wrapper = createWrapper(p);
    const camera = wrapper.root.findAll(node => node.props.name == "camera")[0];
    const expectedFit = getCameraFit({
      viewport: { width: 800, height: 600 },
      bedSize: {
        x: p.config.bedLengthOuter,
        y: p.config.bedWidthOuter,
      },
    });
    const position = camera.props.position as [number, number, number];
    expect(Math.hypot(...position))
      .toBeCloseTo(expectedFit.cameraRadius);
  });

  it("keeps the projection under manual camera control", () => {
    const p = fakeProps();
    p.panelCamera = true;
    const wrapper = createWrapper(p);
    const camera = () => wrapper.root.findByType(PerspectiveCamera);
    expect(camera().props.manual)
      .toBeTruthy();
    expect(camera().props.aspect).toEqual(1270 / 600);
  });

  it("retargets the promo camera fit when the bed size changes", () => {
    const p = fakeProps();
    p.promo = true;
    const wrapper = createWrapper(p);
    const setterCount = useStateSetters.length;
    p.config = {
      ...p.config,
      sizePreset: "Genesis XL",
      bedLengthOuter: 6000,
      bedWidthOuter: 2860,
    };
    actRenderer(() => wrapper.update(<GardenModel {...p} />));
    const updates = useStateSetters.slice(setterCount).flatMap(setter =>
      (setter.mock.calls as unknown[][]).map(call => call[0]));
    const request = updates.find((value): value is GardenCameraRequest =>
      typeof value == "object" && !!value
      && "camera" in value && "fov" in value);
    const expectedFit = getCameraFit({
      viewport: { width: 800, height: 600 },
      bedSize: { x: 6000, y: 2860 },
    });
    if (!request) { throw new Error("Missing camera-fit request"); }
    expect(cameraRadius(request.camera))
      .toBeCloseTo(expectedFit.cameraRadius);
  });

  it("renders camera selection view", async () => {
    const p = fakeProps();
    p.config.cameraSelectionView = true;
    p.config.viewpointHeading = 45;
    const { container } = render(<GardenModel {...p} />);
    await waitFor(() =>
      expect(container.innerHTML).toContain("camera-selection"));
  });

  it("loads a saved top-down camera with perspective", () => {
    const p = fakeProps();
    p.config.cameraSelectionView = true;
    p.config.perspective = true;
    p.config.viewpointHeading = 90;
    p.addPlantProps!.topDownAtStart = true;
    const wrapper = createWrapper(p);
    const camera = wrapper.root.findAll(node => node.props.name == "camera")[0];
    expect(camera.props.fov).toEqual(40);
    expect(camera.props.position[0]).toBeGreaterThan(0);
    expect(camera.props.position[1]).toEqual(0);
    expect(cameraRadius({
      position: camera.props.position,
      target: [0, 0, 0],
    })).toBeCloseTo(getCameraFit({
      viewport: { width: 800, height: 600 },
      bedSize: {
        x: p.config.bedLengthOuter,
        y: p.config.bedWidthOuter,
      },
    }).cameraRadius);
  });

  it("creates top-down and angled starting-camera spring targets", () => {
    const requests: GardenCameraRequest[] = [];
    const setCameraRequest = jest.fn((request: GardenCameraRequest) =>
      requests.push(request));
    const select = createStartingCameraSelector(
      setCameraRequest,
      { x: 3000, y: 1500 },
      10,
      500,
    );
    select(90, true);
    select(45, false);
    const [topDown, angled] = requests;
    expect(topDown.fov).toEqual(40);
    expect(cameraRadius(topDown.camera)).toBeCloseTo(500);
    expect(topDown.camera.position[2]).toBeCloseTo(500);
    expect(topDown.onRest).toEqual(notifyStartingCameraSaved);
    expect(angled.fov).toEqual(40);
    expect(cameraRadius(angled.camera)).toBeCloseTo(500);
    expect(angled.camera.position[0])
      .toBeCloseTo(-angled.camera.position[1]);
    expect(angled.camera.position[0])
      .toBeCloseTo(angled.camera.position[2]);
    expect(angled.onRest).toEqual(notifyStartingCameraSaved);
  });

  it("preserves or retargets active camera projection requests", () => {
    const active: GardenCameraRequest = {
      camera: { position: [1, 0, 0], target: [0, 0, 0] },
      fov: 40,
      onRest: jest.fn(),
    };
    const readCamera = jest.fn(() => ({
      position: [1000, 0, 0] as [number, number, number],
      target: [0, 0, 0] as [number, number, number],
      zoom: 1,
      fov: 40,
    }));
    expect(retargetCameraRequestFov(active, 40, readCamera)).toBe(active);
    expect(readCamera).not.toHaveBeenCalled();
    const retargeted = retargetCameraRequestFov(active, 1, readCamera);
    expect(retargeted.fov).toEqual(1);
    expect(retargeted.camera.position[0]).toBeGreaterThan(1000);
    expect(retargeted.camera.target).toEqual([0, 0, 0]);
    expect(retargeted.onRest).toBeUndefined();
  });

  it("creates camera-fit spring requests from the live direction", () => {
    const current = {
      position: [100, 200, 300] as [number, number, number],
      target: [10, 20, 30] as [number, number, number],
      zoom: 1,
      fov: 40,
    };
    const request = createCameraFitRequest(current, 500);
    expect(request.camera.target).toEqual([0, 0, 0]);
    expect(cameraRadius(request.camera)).toBeCloseTo(500);
    expect(request.fov).toEqual(40);
    expect(createCameraFitRequest({ ...current, fov: 1 }, 500)
      .camera.position[2]).toBeGreaterThan(request.camera.position[2]);
  });

  it("scales the camera-fit radius with the zoom factor", () => {
    expect(cameraFitRadiusForZoom(600, 10)).toEqual(600);
    expect(cameraFitRadiusForZoom(600, 3)).toEqual(2000);
  });

  it("resets prism selections to the bootstrap target and zoom", () => {
    const bootstrap = {
      position: [300, 400, 0] as [number, number, number],
      target: [0, 0, 0] as [number, number, number],
    };
    const current = {
      position: [1000, 2000, 3000] as [number, number, number],
      target: [100, 200, 300] as [number, number, number],
      zoom: 1,
      fov: 40,
    };
    const request = createViewDirectionRequest(
      [1, 0, 0],
      current,
      cameraRadius(bootstrap),
    );
    expect(request.camera.target).toEqual([0, 0, 0]);
    expect(request.camera.position).toEqual([500, 0, 0]);
    expect(request.fov).toEqual(40);

    const narrow = createViewDirectionRequest(
      [0, 1, 0],
      { ...current, fov: 1 },
      cameraRadius(bootstrap),
    );
    expect(narrow.camera.target).toEqual([0, 0, 0]);
    expect(narrow.camera.position[1]).toBeGreaterThan(500);

    const top = createViewDirectionRequest(
      [0, 0, 1],
      current,
      cameraRadius(bootstrap),
      Math.PI / 4,
      { width: 1200, height: 600 },
    );
    expect(top.camera.target).toEqual([0, 0, 0]);
    expect(top.camera.position[0]).toEqual(0);
    expect(top.camera.position[1]).toBeLessThan(0);
  });

  it("notifies when the starting-camera spring completes", () => {
    notifyStartingCameraSaved();
    expect(success).toHaveBeenCalledWith(
      "",
      { title: "Saved starting camera view" },
    );
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

  it("unmounts FarmBot after hide animation exits", async () => {
    const p = fakeProps();
    const wrapper = createWrapper(p);
    let botLoadIn = wrapper.root.findAllByType(FallInGroup)
      .find(() => false);
    await waitFor(() => {
      botLoadIn = wrapper.root.findAllByType(FallInGroup)
        .find(node => node.props.name == "bot-load-in");
      expect(botLoadIn).toBeTruthy();
    });
    actRenderer(() => {
      botLoadIn?.props.onExitRest();
    });
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
    p.config.sunInclination = 45;
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

  it("renders the camera-fit debug circle", () => {
    const p = fakeProps();
    p.config.cameraFitDebug = true;
    const wrapper = createWrapper(p);
    const fit = getCameraFit({
      viewport: { width: 800, height: 600 },
      bedSize: {
        x: p.config.bedLengthOuter,
        y: p.config.bedWidthOuter,
      },
    });
    const inner = wrapper.root.findByProps({
      name: "camera-fit-circumscribed-circle",
    });
    expect(inner.props.points).toHaveLength(129);
    expect(inner.props.points[0][0]).toBeCloseTo(fit.circumscribedRadius);
    expect(wrapper.root.findAllByProps({
      name: "camera-fit-offset-circle",
    })).toHaveLength(0);
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

  it("saves immediate and settled promo camera URL values", async () => {
    const { controls, expectedCamera } = createCameraUrlWrapper();
    actRenderer(() => {
      controls().props.onStart();
      controls().props.onEnd();
    });
    expect(setCameraUrlParamsSpy).toHaveBeenNthCalledWith(1, expectedCamera);

    await actRenderer(waitForCameraUrlSave);
    expect(setCameraUrlParamsSpy).toHaveBeenNthCalledWith(2, expectedCamera);
  });

  it("saves immediate and settled app camera URL values", async () => {
    const { controls, expectedCamera } = createCameraUrlWrapper(false);
    actRenderer(() => {
      controls().props.onStart();
      controls().props.onEnd();
    });
    expect(setCameraUrlParamsSpy).toHaveBeenNthCalledWith(1, expectedCamera);

    await actRenderer(waitForCameraUrlSave);
    expect(setCameraUrlParamsSpy).toHaveBeenNthCalledWith(2, expectedCamera);
  });

  it("cancels a pending camera URL save when focus changes", async () => {
    const { controls, p, wrapper } = createCameraUrlWrapper();
    actRenderer(() => {
      controls().props.onStart();
      controls().props.onEnd();
    });
    expect(setCameraUrlParamsSpy).toHaveBeenCalledTimes(1);

    actRenderer(() => {
      wrapper.update(<GardenModel {...p} activeFocus={"What you can grow"} />);
    });

    await actRenderer(waitForCameraUrlSave);
    expect(setCameraUrlParamsSpy).toHaveBeenCalledTimes(1);
  });

  it("cancels a pending camera URL save when unmounted", async () => {
    const { controls, wrapper } = createCameraUrlWrapper();
    actRenderer(() => {
      controls().props.onStart();
      controls().props.onEnd();
    });
    expect(setCameraUrlParamsSpy).toHaveBeenCalledTimes(1);

    mountedWrappers.pop();
    unmountRenderer(wrapper);
    await actRenderer(waitForCameraUrlSave);
    expect(setCameraUrlParamsSpy).toHaveBeenCalledTimes(1);
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

  it("updates Shift state only for effective modifier changes", () => {
    restoreActualReactState();
    let renders = 0;
    const hook = renderHook(() => {
      renders++;
      return useShiftModifier();
    });
    const initialRenders = renders;

    act(() => window.dispatchEvent(new KeyboardEvent("keydown", {
      key: "a",
      shiftKey: false,
    })));
    expect(renders).toEqual(initialRenders);

    act(() => window.dispatchEvent(new KeyboardEvent("keydown", {
      key: "Shift",
      shiftKey: true,
    })));
    expect(hook.result.current.pressed).toEqual(true);
    const pressedRenders = renders;
    act(() => window.dispatchEvent(new KeyboardEvent("keydown", {
      key: "Shift",
      shiftKey: true,
    })));
    expect(renders).toEqual(pressedRenders);

    act(() => hook.result.current.suppress());
    expect(hook.result.current.pressed).toEqual(false);
    const suppressedRenders = renders;
    act(() => hook.result.current.suppress());
    expect(renders).toEqual(suppressedRenders);

    act(() => window.dispatchEvent(new KeyboardEvent("keyup", {
      key: "Shift",
      shiftKey: false,
    })));
    const releasedRenders = renders;
    act(() => {
      hook.result.current.suppress();
      window.dispatchEvent(new Event("blur"));
    });
    expect(renders).toEqual(releasedRenders);

    act(() => window.dispatchEvent(new KeyboardEvent("keydown", {
      key: "Shift",
      shiftKey: true,
    })));
    expect(hook.result.current.pressed).toEqual(true);
  });

  it("bulk-selects garden objects with a shift-click rectangle", () => {
    location.pathname = Path.mock(Path.designer());
    restoreActualReactState();
    const plant = fakePlant();
    plant.body.id = 1;
    plant.body.x = 150;
    plant.body.y = 150;
    const outsidePlant = fakePlant();
    outsidePlant.body.id = 2;
    outsidePlant.body.x = 700;
    outsidePlant.body.y = 700;
    const weed = fakeWeed();
    weed.body.id = 3;
    weed.body.x = 250;
    weed.body.y = 250;
    const gantrySlot = fakeToolSlot();
    gantrySlot.body.id = 4;
    gantrySlot.body.x = 0;
    gantrySlot.body.y = 250;
    gantrySlot.body.gantry_mounted = true;
    const p = fakeProps();
    p.config.pan = true;
    p.plants = [plant, outsidePlant];
    p.weeds = [weed];
    p.toolSlots = [{ toolSlot: gantrySlot, tool: undefined }];
    p.allPoints = [weed, gantrySlot];
    p.currentBotLocation = { x: 250, y: 0, z: 0 };
    p.addPlantProps = fakeAddPlantProps();
    const dispatch = jest.fn();
    p.addPlantProps.dispatch = dispatch;
    p.addPlantProps.getConfigValue = jest.fn(() => true);
    const createGroupSpy = jest.spyOn(pointGroupActions, "createGroup")
      .mockReturnValue("create group" as never);
    const errorSpy = jest.spyOn(toast, "error")
      .mockImplementation(jest.fn());
    const wrapper = createWrapper(p);
    const hoverTarget = wrapper.root.findByProps({
      name: "grid-hover-target",
    });
    const start = get3DPositionFunc(p.config)({ x: 100, y: 100 });
    const end = get3DPositionFunc(p.config)({ x: 400, y: 400 });

    actRenderer(() => hoverTarget.props.onPointerDown({
      point: start,
      shiftKey: false,
    }));
    expect(wrapper.root.findByType(GardenAreaSelectionOverlay)
      .props.selection).toBeUndefined();

    actRenderer(() => {
      window.dispatchEvent(new KeyboardEvent("keydown", {
        key: "Shift",
        shiftKey: true,
      }));
      hoverTarget.props.onPointerMove({ point: start });
    });
    expect(wrapper.root.findByType(GardenAreaSelectionOverlay)
      .props.shiftPressed).toEqual(true);
    expect(wrapper.root.findByType(GardenAreaSelectionOverlay)
      .props.ghostPosition).toEqual({ x: 100, y: 100 });

    actRenderer(() => hoverTarget.props.onClick({
      point: start,
      shiftKey: true,
      intersections: [],
      stopPropagation: jest.fn(),
    }));
    actRenderer(() => {
      window.dispatchEvent(new KeyboardEvent("keyup", {
        key: "Shift",
        shiftKey: false,
      }));
    });
    expect(wrapper.root.findByType(GardenAreaSelectionOverlay)
      .props.selection.phase).toEqual("drawing");

    actRenderer(() => hoverTarget.props.onPointerMove({ point: end }));
    let overlay = wrapper.root.findByType(GardenAreaSelectionOverlay);
    expect(overlay.props.selectedCount).toEqual(1);
    expect(wrapper.root.findByType(ThreeDObjectSelectionLayer).props)
      .toEqual(expect.objectContaining({
        selectedObjects: [{ kind: "plant", id: 1 }],
        selectedObjectsAlwaysVisible: true,
      }));
    const staticLayers = wrapper.root.findAll(node =>
      typeof node.props.onPlantHoverChange == "function")[0];
    expect(staticLayers.props).toEqual(expect.objectContaining({
      plantsSelectable: false,
      pointsSelectable: false,
      weedsSelectable: false,
      onSelectObject: undefined,
      onHoverObject: undefined,
      onHoverLabel: undefined,
    }));
    const farmbotLayer = wrapper.root.findAll(node =>
      Object.prototype.hasOwnProperty.call(
        node.props, "onToolSlotHoverObject",
      ) && node.props.toolSlots === p.toolSlots)[0];
    expect(farmbotLayer.props).toEqual(expect.objectContaining({
      onSelectObject: undefined,
      onHoverObject: undefined,
      onToolSlotHoverObject: undefined,
      onHoverLabel: undefined,
    }));
    const cameraRig = wrapper.root.findAll(node =>
      node.props.cameraPhase == "normal"
      && node.props.zoomEnabled !== undefined)[0];
    expect(cameraRig.props.pan).toEqual(true);
    expect(cameraRig.props.rotate).toEqual(true);

    actRenderer(() => hoverTarget.props.onPointerDown({
      point: end,
      shiftKey: false,
    }));
    actRenderer(() => hoverTarget.props.onPointerUp({
      point: end,
      shiftKey: false,
      delta: 10,
    }));
    actRenderer(() => hoverTarget.props.onClick({
      point: end,
      shiftKey: false,
      delta: 10,
      intersections: [],
    }));
    expect(wrapper.root.findByType(GardenAreaSelectionOverlay)
      .props.selection.phase).toEqual("drawing");

    actRenderer(() => {
      hoverTarget.props.onClick({
        point: end,
        shiftKey: false,
        intersections: [],
        stopPropagation: jest.fn(),
      });
    });
    overlay = wrapper.root.findByType(GardenAreaSelectionOverlay);
    expect(overlay.props.selection).toEqual({
      phase: "complete",
      pointType: "Plant",
      box: { x0: 100, y0: 100, x1: 400, y1: 400 },
    });
    expect(overlay.props.selectedCount).toEqual(1);
    expect(wrapper.root.findByType(ThreeDObjectSelectionLayer)
      .props.selectedObjects).toEqual([{ kind: "plant", id: 1 }]);
    expect(dispatch).toHaveBeenCalledWith({
      type: Actions.SELECT_POINT,
      payload: [plant.uuid],
    });

    actRenderer(() => overlay.props.onBoxChange({
      x0: 400, y0: 400, x1: 100, y1: 100,
    }));
    overlay = wrapper.root.findByType(GardenAreaSelectionOverlay);
    expect(overlay.props.selection.box).toEqual({
      x0: 100, y0: 100, x1: 400, y1: 400,
    });
    actRenderer(() => overlay.props.onPointTypeChange("Weed"));
    overlay = wrapper.root.findByType(GardenAreaSelectionOverlay);
    expect(overlay.props.selectedCount).toEqual(1);
    expect(wrapper.root.findByType(ThreeDObjectSelectionLayer)
      .props.selectedObjects).toEqual([{ kind: "weed", id: 3 }]);
    actRenderer(() => overlay.props.onPointTypeChange("ToolSlot"));
    overlay = wrapper.root.findByType(GardenAreaSelectionOverlay);
    expect(overlay.props.selectedCount).toEqual(1);
    expect(wrapper.root.findByType(ThreeDObjectSelectionLayer)
      .props.selectedObjects).toEqual([{ kind: "slot", id: 4 }]);
    actRenderer(() => overlay.props.onPointTypeChange("Weed"));
    p.addPlantProps = {
      ...p.addPlantProps,
      designer: {
        ...p.addPlantProps.designer,
        openedSavedGarden: 1,
      },
    };
    actRenderer(() => wrapper.update(<GardenModel {...p} />));
    overlay = wrapper.root.findByType(GardenAreaSelectionOverlay);
    actRenderer(() => overlay.props.onCreateGroup());
    expect(createGroupSpy).not.toHaveBeenCalled();
    expect(errorSpy).toHaveBeenCalled();

    p.addPlantProps = {
      ...p.addPlantProps,
      designer: {
        ...p.addPlantProps.designer,
        openedSavedGarden: undefined,
      },
    };
    actRenderer(() => wrapper.update(<GardenModel {...p} />));
    actRenderer(() => {
      const event = new KeyboardEvent("keydown", {
        key: "Escape",
        cancelable: true,
      });
      window.dispatchEvent(event);
      expect(event.defaultPrevented).toBeTruthy();
    });
    overlay = wrapper.root.findByType(GardenAreaSelectionOverlay);
    expect(overlay.props.selection).toBeUndefined();
    expect(overlay.props.shiftPressed).toEqual(false);
    expect(wrapper.root.findByType(ThreeDObjectSelectionLayer)
      .props.selectedObjects).toBeUndefined();

    actRenderer(() => {
      window.dispatchEvent(new KeyboardEvent("keydown", {
        key: "Shift",
        shiftKey: true,
      }));
      hoverTarget.props.onPointerMove({ point: start });
    });
    expect(wrapper.root.findByType(GardenAreaSelectionOverlay)
      .props.shiftPressed).toEqual(true);
    const shiftedCameraRig = wrapper.root.findAll(node =>
      node.props.cameraPhase == "normal"
      && node.props.zoomEnabled !== undefined)[0];
    expect(shiftedCameraRig.props.pan).toEqual(false);
    expect(shiftedCameraRig.props.rotate).toEqual(false);
    const stopPropagation = jest.fn();
    actRenderer(() => hoverTarget.props.onPointerDown({
      point: start,
      shiftKey: true,
      stopPropagation,
    }));
    overlay = wrapper.root.findByType(GardenAreaSelectionOverlay);
    expect(overlay.props.selection.phase).toEqual("drawing");
    expect(shiftedCameraRig.props.pan).toEqual(true);
    expect(shiftedCameraRig.props.rotate).toEqual(true);
    actRenderer(() => hoverTarget.props.onPointerMove({ point: end }));
    actRenderer(() => hoverTarget.props.onPointerUp({
      point: end,
      shiftKey: true,
      delta: 10,
      stopPropagation,
    }));
    overlay = wrapper.root.findByType(GardenAreaSelectionOverlay);
    expect(overlay.props.selection).toEqual({
      phase: "complete",
      pointType: "Plant",
      box: { x0: 100, y0: 100, x1: 400, y1: 400 },
    });
    actRenderer(() => hoverTarget.props.onClick({
      point: end,
      shiftKey: true,
      delta: 10,
    }));
    expect(wrapper.root.findByType(GardenAreaSelectionOverlay)
      .props.selection.phase).toEqual("complete");
    expect(stopPropagation).toHaveBeenCalledTimes(2);
    actRenderer(() => overlay.props.onClose());
    actRenderer(() => {
      window.dispatchEvent(new Event("blur"));
      window.dispatchEvent(new KeyboardEvent("keyup", {
        key: "Shift",
        shiftKey: false,
      }));
    });
    createGroupSpy.mockRestore();
    errorSpy.mockRestore();
  });

  it("creates a group from the visible area selection popup", () => {
    const { dispatch, p, plant } = areaSelectionActionProps();
    const createGroupSpy = jest.spyOn(pointGroupActions, "createGroup")
      .mockReturnValue("create group" as never);
    const { wrapper, overlay } = renderCompletedAreaSelection(p);
    expect(overlay().props.selectedCount).toEqual(1);

    actRenderer(() => wrapper.root.findByProps({
      title: "Create group",
    }).props.onClick());

    expect(createGroupSpy).toHaveBeenCalledWith({
      pointUuids: [plant.uuid],
      navigate: expect.any(Function),
    });
    expect(dispatch).toHaveBeenCalledWith("create group");
    expect(dispatch).toHaveBeenCalledWith(expect.any(Function));
    createGroupSpy.mockRestore();
  });

  it("doesn't create an empty area selection group", () => {
    const p = fakeProps();
    p.addPlantProps = fakeAddPlantProps();
    p.addPlantProps.dispatch = jest.fn();
    const createGroupSpy = jest.spyOn(pointGroupActions, "createGroup");
    const { overlay } = renderCompletedAreaSelection(p);
    expect(overlay().props.selectedCount).toEqual(0);

    actRenderer(() => overlay().props.onCreateGroup());

    expect(createGroupSpy).not.toHaveBeenCalled();
    createGroupSpy.mockRestore();
  });

  it("deletes objects from the visible area selection popup", () => {
    const { dispatch, p, plant } = areaSelectionActionProps();
    const destroySpy = jest.spyOn(crud, "destroy")
      .mockReturnValue("destroy point" as never);
    const confirmSpy = jest.spyOn(window, "confirm")
      .mockReturnValue(true);
    const { wrapper, overlay } = renderCompletedAreaSelection(p);
    expect(overlay().props.selectedCount).toEqual(1);

    actRenderer(() => wrapper.root.findByProps({
      title: "Delete",
    }).props.onClick());

    expect(destroySpy).toHaveBeenCalledWith(plant.uuid, true);
    expect(dispatch).toHaveBeenCalledWith("destroy point");
    expect(confirmSpy).toHaveBeenCalled();
    destroySpy.mockRestore();
    confirmSpy.mockRestore();
  });

  it("opens the full panel from the visible area selection popup", () => {
    const { p } = areaSelectionActionProps();
    const { wrapper, overlay } = renderCompletedAreaSelection(p);
    expect(overlay().props.selectedCount).toEqual(1);

    actRenderer(() => wrapper.root.findByProps({
      title: "open panel",
    }).props.onClick());

    expect(mockNavigate).toHaveBeenCalledWith(Path.plants("select"));
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
    actRenderer(() => hoverTarget.props.onClick({
      ...event,
      intersections: [{ object: { name: "bug-0" } }],
    }));
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
    p.peripheralValues = [{ label: "Vacuum", value: true }];
    p.addPlantProps = fakeAddPlantProps();
    const sceneObject = fakeSceneObject({ id: 42 });
    p.sceneObjects = [sceneObject];
    const dispatch = jest.fn();
    p.addPlantProps.dispatch = dispatch;
    const copySceneObjectSpy = jest
      .spyOn(sceneObjectActions, "copySceneObject")
      .mockReturnValue("copy scene object" as never);
    const wrapper = createWrapper(p);
    const staticLayers = wrapper.root.findAll(node =>
      typeof node.props.onSelectObject == "function"
      && typeof node.props.onPlantHoverChange == "function")[0];
    const selectionLayer = wrapper.root.findByType(ThreeDObjectSelectionLayer);
    expect(selectionLayer.props.peripheralValues).toEqual(p.peripheralValues);
    const location = { kind: "location" as const, x: 1, y: 2, z: 3 };
    actRenderer(() => {
      staticLayers.props.onSelectObject({ kind: "plant", id: 1 });
      selectionLayer.props.onUpdateLocationSelection(location);
      selectionLayer.props.onOpenPanel({ kind: "plant", id: 1 });
      selectionLayer.props.onOpenPanel({ kind: "connectivity", id: 0 });
      selectionLayer.props.onOpenLocationPanel(location);
      selectionLayer.props.onCopySceneObject(sceneObject);
      selectionLayer.props.onClosePopup();
      staticLayers.props.onHoverObject(true);
      staticLayers.props.onHoverObject(false);
    });
    expect(dispatch).toHaveBeenCalled();
    expect(dispatch).toHaveBeenCalledWith({
      type: Actions.SET_METRIC_PANEL_OPTION,
      payload: "realtime",
    });
    expect(dispatch).toHaveBeenCalledWith({
      type: Actions.OPEN_POPUP,
      payload: "connectivity",
    });
    expect(copySceneObjectSpy).toHaveBeenCalledWith(
      sceneObject, expect.any(Function));
    expect(dispatch).toHaveBeenCalledWith("copy scene object");
    expect(mockNavigate).toHaveBeenCalled();
    copySceneObjectSpy.mockRestore();
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
    group.body.criteria.number_gt = { x: 100, y: 200 };
    group.body.criteria.number_lt = { x: 500, y: 600 };
    location.pathname = Path.mock(Path.groups(2));
    getModeSpy.mockReturnValue(Mode.editGroup);
    const groupAddPlantProps = fakeAddPlantProps();
    groupAddPlantProps.designer.editGroupAreaInMap = true;
    groupAddPlantProps.dispatch = jest.fn();
    actRenderer(() => wrapper.update(<GardenModel
      {...p}
      groups={[group]}
      addPlantProps={groupAddPlantProps} />));
    expect(wrapper.root.findByType(ThreeDObjectSelectionLayer)
      .props.selectedObjects).toEqual([{ kind: "point", id: 1 }]);
    const groupArea = wrapper.root.findByType(GroupAreaSelectionOverlay);
    expect(groupArea.props.box).toEqual({
      x0: 100, y0: 200, x1: 500, y1: 600,
    });
    actRenderer(() => groupArea.props.onBoxChange({
      x0: 150, y0: 250, x1: 550, y1: 650,
    }));
    expect(groupAddPlantProps.dispatch).toHaveBeenCalledWith(
      expect.any(Function));
    const clearedGroup = {
      ...group,
      body: {
        ...group.body,
        criteria: {
          ...group.body.criteria,
          number_gt: {},
          number_lt: {},
        },
      },
    };
    actRenderer(() => wrapper.update(<GardenModel
      {...p}
      groups={[clearedGroup]}
      addPlantProps={groupAddPlantProps} />));
    expect(wrapper.root.findByType(GroupAreaSelectionOverlay).props.box)
      .toEqual({
        x0: 0,
        y0: 0,
        x1: p.config.botSizeX,
        y1: p.config.botSizeY,
      });
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
    const selectionLayer =
      wrapper.root.findByType(ThreeDObjectSelectionLayer);
    expect(selectionLayer.props.panelSelection)
      .toEqual({ kind: "plant", id: 1 });
    expect(selectionLayer.props.selection).toBeUndefined();
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
    const event = new KeyboardEvent("keydown", {
      key: "Escape",
      cancelable: true,
    });
    actRenderer(() => {
      keydownHandler?.(event);
    });
    expect(event.defaultPrevented).toBeTruthy();
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
    const useThreeSpy = jest.spyOn(threeFiber, "useThree")
      .mockImplementation(selector =>
        selector ? selector(state as never) : state);
    const wrapper = createWrapper(fakeProps());
    expect(canvas.style.cursor).toEqual("grab");
    unmountRenderer(wrapper);
    mountedWrappers.pop();
    expect(canvas.style.cursor).toEqual("");
    useThreeSpy.mockRestore();
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
      .mockImplementation(selector =>
        selector ? selector(state as never) : state);
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
    (useTexture as unknown as jest.Mock).mockClear();
    render(<GardenModel {...p} />);
    await waitFor(() =>
      expect(p.onLoadComplete).toHaveBeenCalled());
    const loadedTextures = (useTexture as unknown as jest.Mock).mock.calls
      .map(([url]) => url);
    GROUND_TEXTURE_URLS.forEach(texture =>
      expect(loadedTextures).toContain(texture));
  });

  it("adds a scene object from ground clicks", () => {
    useStateSpy.mockRestore();
    location.pathname = Path.sceneObjects("add");
    const p = fakeProps();
    p.addPlantProps = fakeAddPlantProps();
    p.addPlantProps.designer.drawnSceneObject = DEFAULT_SCENE_OBJECT;
    const dispatch = jest.fn<Promise<void>, [{
      type: string,
      payload: { body: { name: string } },
    }]>(() => Promise.resolve());
    p.addPlantProps.dispatch = dispatch;
    const wrapper = createWrapper(p);
    const ground = () => wrapper.root.findAll(node =>
      `${node.props.name}`.startsWith("ground "))[0];
    const stopPropagation = jest.fn();
    const groundWorldZ = -p.config.bedZOffset - p.config.bedHeight;
    const click = (x: number, y: number, clientY = y) =>
      ground().props.onClick({
        point: { x, y, z: groundWorldZ },
        nativeEvent: { clientY },
        stopPropagation,
      });
    const move = (x: number, y: number, clientY = y) =>
      ground().props.onPointerMove({
        point: { x, y, z: groundWorldZ },
        nativeEvent: { clientY },
      });
    const getGardenPosition = getGardenPositionFunc(p.config);
    const center = getGardenPosition({ x: 0, y: 0 });
    const corner = getGardenPosition({ x: 100, y: 200 });
    const height = 300;

    actRenderer(() => move(0, 0, 500));
    actRenderer(() => click(0, 0, 500));
    actRenderer(() => move(100, 200, 500));
    actRenderer(() => click(100, 200, 500));
    actRenderer(() => move(100, 350, 500 - height / 2));
    actRenderer(() => click(100, 350, 500 - height / 2));

    expect(dispatch).toHaveBeenCalledWith(expect.objectContaining({
      type: "INIT_RESOURCE",
      payload: expect.objectContaining({
        body: expect.objectContaining({
          name: "Scene Object 1",
          x_center: center.x,
          y_center: center.y,
          z_base: 0,
          x_size: Math.abs(corner.x - center.x) * 2,
          y_size: Math.abs(corner.y - center.y) * 2,
          z_size: height,
        }),
      }),
    }));

    actRenderer(() => move(10, 10, 400));
    actRenderer(() => click(10, 10, 400));
    actRenderer(() => move(20, 20, 400));
    actRenderer(() => click(20, 20, 400));
    actRenderer(() => move(20, 40, 350));
    actRenderer(() => click(20, 40, 350));

    const initActions = dispatch.mock.calls
      .map(([action]) => action)
      .filter(action => action.type == "INIT_RESOURCE");
    expect(initActions).toHaveLength(2);
    expect(initActions[1]?.payload.body.name).toEqual("Scene Object 2");
  });

  it.each<[string, string]>([
    ["bricks", "ground bricks"],
    ["concrete", "ground concrete"],
    ["grass", "ground grass"],
  ])("renders the selected ground texture: %s %s",
    (groundTexture, expectedClass) => {
      const p = fakeProps();
      p.config.groundTexture = groundTexture;
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
    const wrapper = createWrapper(p);
    const backgroundColor = wrapper.root
      .findByType(Sun).props.backgroundColor as Color;

    expect(backgroundColor.getHex()).toEqual(0);
  });
});

describe("usePanelCameraViewOffset()", () => {
  interface PanelSpringUpdate {
    to: { offsetX: number };
    config: {
      duration: number;
      easing(progress: number): number;
    };
    onChange(result: { value: { offsetX?: number } }): void;
    onRest(): void;
  }

  const mockPanelSpring = () => {
    let update: PanelSpringUpdate | undefined;
    const start = jest.fn((nextUpdate: PanelSpringUpdate) => {
      update = nextUpdate;
      return Promise.resolve();
    });
    const api = { start };
    const springSpy = jest.spyOn(reactSpring, "useSpring")
      .mockImplementation(
        (props: Parameters<typeof reactSpring.useSpring>[0]) => {
          const resolved = typeof props == "function" ? props() : props;
          return [resolved, api] as unknown as
            ReturnType<typeof reactSpring.useSpring>;
        });
    const getUpdate = () => {
      if (!update) {
        throw new Error("Panel spring did not start.");
      }
      return update;
    };
    return { getUpdate, springSpy, start };
  };

  it("matches the CSS panel transition timing", () => {
    window.localStorage.setItem("FB_PERF_BENCHMARK", "true");
    // eslint-disable-next-line no-undefined
    window.__fbPerf = undefined;
    const panelCameraMarks = () => (
      Reflect.get(window, "__fbPerf") as
      { marks: Record<string, number[]> } | undefined
    )?.marks.panel_camera_first_frame;
    const { getUpdate, springSpy, start } = mockPanelSpring();
    const invalidate = jest.fn();
    const camera = new ThreePerspectiveCamera();
    const setViewOffset = jest.spyOn(camera, "setViewOffset");
    const openView = getPanelCameraViewOffset(
      { width: 1200, height: 600 },
      true,
    );
    const closedView = getPanelCameraViewOffset(
      { width: 1200, height: 600 },
      false,
    );
    interface HookProps {
      camera: ThreePerspectiveCamera | null;
      view: typeof openView;
    }
    const initialProps: HookProps = {
      // eslint-disable-next-line no-null/no-null
      camera: null,
      view: openView,
    };
    const { rerender, unmount } = renderHook(
      (props: HookProps) => usePanelCameraViewOffset(
        props.camera,
        props.view,
        invalidate,
      ),
      { initialProps },
    );
    expect(setViewOffset).not.toHaveBeenCalled();

    rerender({ camera, view: openView });
    expect(setViewOffset)
      .toHaveBeenLastCalledWith(1670, 600, 0, 0, 1200, 600);

    rerender({ camera, view: closedView });
    expect(start).toHaveBeenCalled();
    expect(setViewOffset)
      .toHaveBeenLastCalledWith(1670, 600, 0, 0, 1200, 600);
    expect(getUpdate().to).toEqual({ offsetX: 235 });
    expect(getUpdate().config.duration)
      .toEqual(PANEL_CAMERA_TRANSITION_MS);
    expect(getUpdate().config.easing(0.5)).toBeCloseTo(0.8024034);
    act(() => getUpdate().onChange({
      value: { offsetX: 188.5647961 },
    }));
    expect(setViewOffset.mock.calls[setViewOffset.mock.calls.length - 1][2])
      .toBeCloseTo(188.5647961);
    expect(panelCameraMarks()).toHaveLength(1);
    act(() => getUpdate().onRest());
    expect(setViewOffset)
      .toHaveBeenLastCalledWith(1670, 600, 235, 0, 1200, 600);
    expect(panelCameraMarks()).toHaveLength(1);

    rerender({ camera, view: openView });
    expect(getUpdate().to).toEqual({ offsetX: 0 });
    act(() => getUpdate().onChange({
      value: { offsetX: 46.4352039 },
    }));
    expect(setViewOffset.mock.calls[setViewOffset.mock.calls.length - 1][2])
      .toBeCloseTo(46.4352039);
    expect(panelCameraMarks()).toHaveLength(2);
    act(() => getUpdate().onRest());
    expect(setViewOffset)
      .toHaveBeenLastCalledWith(1670, 600, 0, 0, 1200, 600);
    expect(invalidate).toHaveBeenCalled();

    unmount();
    springSpy.mockRestore();
    window.localStorage.removeItem("FB_PERF_BENCHMARK");
    // eslint-disable-next-line no-undefined
    window.__fbPerf = undefined;
  });

  it("updates resized projections without starting an idle transition", () => {
    const { getUpdate, springSpy } = mockPanelSpring();
    const invalidate = jest.fn();
    const camera = new ThreePerspectiveCamera();
    const clearViewOffset = jest.spyOn(camera, "clearViewOffset");
    const setViewOffset = jest.spyOn(camera, "setViewOffset");
    const view = getPanelCameraViewOffset(
      { width: 1200, height: 600 },
      false,
    );
    const { rerender, unmount } = renderHook(
      ({ nextView }) =>
        usePanelCameraViewOffset(camera, nextView, invalidate),
      { initialProps: { nextView: view } },
    );
    expect(setViewOffset)
      .toHaveBeenLastCalledWith(1670, 600, 235, 0, 1200, 600);

    const resizedView = getPanelCameraViewOffset(
      { width: 1400, height: 700 },
      false,
    );
    rerender({ nextView: resizedView });
    expect(setViewOffset)
      .toHaveBeenLastCalledWith(1870, 700, 235, 0, 1400, 700);

    const noPanelView = getPanelCameraViewOffset(
      { width: 1400, height: 700 },
      undefined,
    );
    rerender({ nextView: noPanelView });
    expect(clearViewOffset).toHaveBeenCalled();
    expect(camera.view?.enabled).toBeFalsy();
    act(() => getUpdate().onRest());
    rerender({
      nextView: getPanelCameraViewOffset(
        { width: 1400, height: 700 },
        true,
      ),
    });
    expect(setViewOffset)
      .toHaveBeenLastCalledWith(1870, 700, 0, 0, 1400, 700);

    unmount();
    springSpy.mockRestore();
  });
});

describe("blockCameraFollowEscape()", () => {
  const baseProps = () => ({
    areaSelectionActive: false,
    popupOpen: false,
    panelCameraStore: createPanelCameraStore(false),
    dispatch: jest.fn(),
  });

  it("blocks camera exit for active scene workflows", () => {
    const props = baseProps();
    expect(blockCameraFollowEscape({
      ...props,
      areaSelectionActive: true,
    })).toBeTruthy();
    expect(blockCameraFollowEscape({
      ...props,
      popupOpen: true,
    })).toBeTruthy();
    expect(props.dispatch).not.toHaveBeenCalled();
  });

  it("closes an open panel before allowing camera exit", () => {
    const props = baseProps();
    expect(blockCameraFollowEscape(props)).toBeFalsy();
    expect(blockCameraFollowEscape({
      ...props,
      dispatch: undefined,
    })).toBeFalsy();
    expect(blockCameraFollowEscape({
      ...props,
      panelCameraStore: undefined,
    })).toBeFalsy();
    props.panelCameraStore.setOpen(true);
    expect(blockCameraFollowEscape(props)).toBeTruthy();
    expect(props.dispatch).toHaveBeenCalledWith(expect.any(Function));
  });
});

describe("useGardenCameraController()", () => {
  const fakeControllerProps = (): GardenCameraControllerProps => ({
    baseCamera: {
      position: [1000, -1000, 1000],
      target: [0, 0, 0],
    },
    startingCamera: {
      position: [2000, -2000, 2000],
      target: [0, 0, 0],
    },
    cameraFollow: false,
    utmFollow: false,
    viewMode: "normal",
    stargazingFov: 20,
    stargazingCamera: {
      position: [100, 200, 300],
      target: [-100, 200, 500],
    },
    desiredFov: 40,
    cameraFitRadius: 2000,
    promo: false,
    activeFocus: "",
    // eslint-disable-next-line no-null/no-null
    controlsCamera: null,
    // eslint-disable-next-line no-null/no-null
    controls: null,
    cameraBedSize: { x: 1000, y: 500 },
    zoomFactor: 1,
    viewportSize: { width: 800, height: 600 },
    spaceflightViewportSize: { width: 800, height: 600 },
  });

  const dispatchKeyboardEvent = (
    key: string,
    init: KeyboardEventInit = {},
    target: Window | Element = window,
  ) => {
    const event = new KeyboardEvent("keydown", {
      key,
      bubbles: true,
      cancelable: true,
      ...init,
    });
    act(() => target.dispatchEvent(event));
    return event;
  };

  it("settles stargazing entry, FOV changes, and exit", async () => {
    const props = fakeControllerProps();
    const { result, rerender } = renderHook(
      (controllerProps: GardenCameraControllerProps) =>
        useGardenCameraController(controllerProps),
      { initialProps: props },
    );
    expect(result.current.cameraPhase).toEqual("normal");

    const enteringProps = { ...props, viewMode: "stargazing" as const };
    rerender(enteringProps);
    await waitFor(() => {
      expect(result.current.cameraPhase).toEqual("transitioning");
      expect(result.current.cameraRequest?.camera)
        .toBe(props.stargazingCamera);
    });
    act(() => result.current.cameraRequest?.onRest?.());
    await waitFor(() =>
      expect(result.current.cameraPhase).toEqual("stargazing"));

    rerender({ ...enteringProps, stargazingFov: 45 });
    await waitFor(() => {
      expect(result.current.cameraRequest).toEqual({
        camera: props.stargazingCamera,
        fov: 45,
        interpolation: "linear",
        onRest: undefined,
      });
    });

    rerender({ ...enteringProps, viewMode: "normal" });
    await waitFor(() => {
      expect(result.current.cameraPhase).toEqual("transitioning");
      expect(result.current.cameraRequest?.fov).toEqual(props.desiredFov);
      expect(result.current.cameraRequest?.camera.target)
        .toEqual(props.baseCamera.target);
      result.current.cameraRequest?.camera.position.forEach((value, index) =>
        expect(value).toBeCloseTo(props.baseCamera.position[index]));
      expect(result.current.cameraRequest?.onRest).toBeDefined();
    });
    act(() => result.current.cameraRequest?.onRest?.());
    await waitFor(() =>
      expect(result.current.cameraPhase).toEqual("normal"));
  });

  it("retargets FOV while the stargazing camera is transitioning", async () => {
    const props = fakeControllerProps();
    const { result, rerender } = renderHook(
      (controllerProps: GardenCameraControllerProps) =>
        useGardenCameraController(controllerProps),
      { initialProps: props },
    );
    const enteringProps = { ...props, viewMode: "stargazing" as const };
    rerender(enteringProps);
    await waitFor(() =>
      expect(result.current.cameraPhase).toEqual("transitioning"));

    rerender({ ...enteringProps, stargazingFov: 35 });
    await waitFor(() => {
      expect(result.current.cameraRequest?.fov).toEqual(35);
      expect(result.current.cameraRequest?.camera)
        .toBe(props.stargazingCamera);
      expect(result.current.cameraRequest?.interpolation).toEqual("orbit");
      expect(result.current.cameraRequest?.onRest).toBeDefined();
    });
    act(() => result.current.cameraRequest?.onRest?.());
    await waitFor(() =>
      expect(result.current.cameraPhase).toEqual("stargazing"));
  });

  it("retargets the camera when the normal projection changes", async () => {
    const props = fakeControllerProps();
    const { result, rerender } = renderHook(
      (controllerProps: GardenCameraControllerProps) =>
        useGardenCameraController(controllerProps),
      { initialProps: props },
    );

    rerender({ ...props, desiredFov: 1 });

    await waitFor(() => {
      expect(result.current.cameraRequest?.fov).toEqual(1);
      expect(cameraRadius(result.current.cameraRequest!.camera))
        .toBeGreaterThan(cameraRadius(props.baseCamera));
    });
  });

  it("restores the exact normal camera session after stargazing", async () => {
    const controlsCamera = new ThreePerspectiveCamera();
    controlsCamera.position.set(321, -654, 987);
    controlsCamera.fov = 35;
    const controls = {
      target: new Vector3(12, 34, 56),
      update: jest.fn(),
    } as NonNullable<GardenCameraControllerProps["controls"]>;
    const props: GardenCameraControllerProps = {
      ...fakeControllerProps(),
      controlsCamera,
      controls,
    };
    const { result, rerender } = renderHook(
      (controllerProps: GardenCameraControllerProps) =>
        useGardenCameraController(controllerProps),
      { initialProps: props },
    );

    rerender({ ...props, viewMode: "stargazing" });
    await waitFor(() =>
      expect(result.current.cameraRequest?.camera)
        .toBe(props.stargazingCamera));

    controlsCamera.position.set(100, 200, 300);
    controlsCamera.fov = props.stargazingFov;
    controls.target.set(-100, 200, 500);
    rerender({ ...props, viewMode: "normal" });

    await waitFor(() => {
      expect(result.current.cameraRequest?.camera).toEqual({
        position: [321, -654, 987],
        target: [12, 34, 56],
      });
      expect(result.current.cameraRequest?.fov).toEqual(35);
    });
  });

  it("resets stargazing after spaceflight", async () => {
    const controlsCamera = new ThreePerspectiveCamera();
    controlsCamera.position.set(321, -654, 987);
    controlsCamera.fov = 35;
    const controls = {
      target: new Vector3(12, 34, 56),
      update: jest.fn(),
    } as NonNullable<GardenCameraControllerProps["controls"]>;
    const props: GardenCameraControllerProps = {
      ...fakeControllerProps(),
      viewMode: "stargazing",
      controlsCamera,
      controls,
    };
    const { result, rerender } = renderHook(
      (controllerProps: GardenCameraControllerProps) =>
        useGardenCameraController(controllerProps),
      { initialProps: props },
    );

    rerender({ ...props, viewMode: "spaceflight" });
    await waitFor(() => {
      expect(result.current.cameraPhase).toEqual("transitioning");
      expect(result.current.cameraRequest?.camera)
        .toBe(SPACEFLIGHT_CAMERA);
      expect(result.current.cameraRequest?.fov).toEqual(SPACEFLIGHT_FOV);
      expect(result.current.cameraRequest?.interpolation)
        .toEqual("linear");
    });
    act(() => result.current.cameraRequest?.onRest?.());
    await waitFor(() =>
      expect(result.current.cameraPhase).toEqual("spaceflight"));

    controlsCamera.position.set(...SPACEFLIGHT_CAMERA.position);
    controls.target.set(...SPACEFLIGHT_CAMERA.target);
    rerender({ ...props, viewMode: "stargazing" });
    await waitFor(() => {
      expect(result.current.cameraPhase).toEqual("transitioning");
      expect(result.current.cameraRequest?.camera)
        .toBe(props.stargazingCamera);
      expect(result.current.cameraRequest?.fov)
        .toEqual(props.stargazingFov);
      expect(result.current.cameraRequest?.interpolation)
        .toEqual("linear");
    });
    act(() => result.current.cameraRequest?.onRest?.());
    await waitFor(() =>
      expect(result.current.cameraPhase).toEqual("stargazing"));
  });

  it("retargets the settled spaceflight camera after a resize", async () => {
    const controlsCamera = new ThreePerspectiveCamera();
    controlsCamera.position.set(...SPACEFLIGHT_CAMERA.position);
    controlsCamera.fov = SPACEFLIGHT_FOV;
    const controls = {
      target: new Vector3(...SPACEFLIGHT_CAMERA.target),
      update: jest.fn(),
    } as NonNullable<GardenCameraControllerProps["controls"]>;
    const props: GardenCameraControllerProps = {
      ...fakeControllerProps(),
      controlsCamera,
      controls,
    };
    const { result, rerender } = renderHook(
      (controllerProps: GardenCameraControllerProps) =>
        useGardenCameraController(controllerProps),
      { initialProps: props },
    );
    const spaceflightProps = {
      ...props,
      viewMode: "spaceflight" as const,
    };

    rerender(spaceflightProps);
    await waitFor(() =>
      expect(result.current.cameraRequest?.camera)
        .toBe(SPACEFLIGHT_CAMERA));
    act(() => result.current.cameraRequest?.onRest?.());
    await waitFor(() =>
      expect(result.current.cameraPhase).toEqual("spaceflight"));

    const settledRequest = result.current.cameraRequest;
    rerender({
      ...spaceflightProps,
      viewportSize: { ...spaceflightProps.viewportSize },
      spaceflightViewportSize: {
        ...spaceflightProps.spaceflightViewportSize,
      },
    });
    expect(result.current.cameraPhase).toEqual("spaceflight");
    expect(result.current.cameraRequest).toBe(settledRequest);

    const canvasViewportSize = { width: 825, height: 667 };
    const spaceflightViewportSize = { width: 375, height: 667 };
    rerender({
      ...spaceflightProps,
      viewportSize: canvasViewportSize,
      spaceflightViewportSize,
    });

    await waitFor(() => {
      expect(result.current.cameraPhase).toEqual("transitioning");
      expect(result.current.cameraRequest?.camera)
        .toEqual(getSpaceflightCamera(spaceflightViewportSize));
      expect(result.current.cameraRequest?.interpolation)
        .toEqual("linear");
    });
    act(() => result.current.cameraRequest?.onRest?.());
    await waitFor(() =>
      expect(result.current.cameraPhase).toEqual("spaceflight"));
  });

  it("starts every stargazing session at its entry camera", async () => {
    const props = fakeControllerProps();
    const { result, rerender } = renderHook(
      (controllerProps: GardenCameraControllerProps) =>
        useGardenCameraController(controllerProps),
      { initialProps: props },
    );

    rerender({ ...props, viewMode: "stargazing" });
    await waitFor(() =>
      expect(result.current.cameraRequest?.camera)
        .toBe(props.stargazingCamera));
    rerender({ ...props, viewMode: "spaceflight" });
    await waitFor(() =>
      expect(result.current.cameraRequest?.camera)
        .toBe(SPACEFLIGHT_CAMERA));

    rerender({ ...props, viewMode: "normal" });
    await waitFor(() => {
      expect(result.current.cameraRequest?.camera)
        .not.toBe(SPACEFLIGHT_CAMERA);
      expect(result.current.cameraRequest?.fov).toEqual(props.desiredFov);
    });
    act(() => result.current.cameraRequest?.onRest?.());
    await waitFor(() =>
      expect(result.current.cameraPhase).toEqual("normal"));

    rerender({ ...props, viewMode: "stargazing" });
    await waitFor(() =>
      expect(result.current.cameraRequest?.camera)
        .toBe(props.stargazingCamera));
  });

  it("keeps the stargazing entry camera when the viewport changes", async () => {
    const props = { ...fakeControllerProps(), promo: true };
    const { result, rerender } = renderHook(
      (controllerProps: GardenCameraControllerProps) =>
        useGardenCameraController(controllerProps),
      { initialProps: props },
    );
    const stargazingProps = {
      ...props,
      viewMode: "stargazing" as const,
    };
    rerender(stargazingProps);
    await waitFor(() =>
      expect(result.current.cameraRequest?.camera)
        .toBe(props.stargazingCamera));
    act(() => result.current.cameraRequest?.onRest?.());
    await waitFor(() =>
      expect(result.current.cameraPhase).toEqual("stargazing"));
    const stargazingRequest = result.current.cameraRequest;

    rerender({ ...stargazingProps, cameraFitRadius: 3000 });

    expect(result.current.cameraRequest).toBe(stargazingRequest);
    expect(result.current.cameraRequest?.camera)
      .toBe(props.stargazingCamera);
  });

  it("navigates prism presets and chains rapid arrow presses", () => {
    const viewPrismBridgeRef = React.createRef<ViewPrismBridge>();
    const props: GardenCameraControllerProps = {
      ...fakeControllerProps(),
      baseCamera: {
        position: [0, -1000, 1000],
        target: [0, 0, 0],
      },
      viewPrismBridgeRef,
    };
    const { result } = renderHook(() =>
      useGardenCameraController(props));

    const firstEvent = dispatchKeyboardEvent("ArrowRight");
    expect(firstEvent.defaultPrevented).toBeTruthy();
    expect(result.current.cameraRequest?.camera.position[0])
      .toBeGreaterThan(0);
    expect(result.current.cameraRequest?.camera.position[1])
      .toBeLessThan(0);

    dispatchKeyboardEvent("ArrowRight");
    expect(result.current.cameraRequest?.camera.position[0])
      .toBeGreaterThan(0);
    expect(result.current.cameraRequest?.camera.position[1])
      .toBeCloseTo(0);

    dispatchKeyboardEvent("ArrowUp");
    expect(result.current.cameraRequest?.camera.position[0])
      .toBeGreaterThan(0);
    expect(result.current.cameraRequest?.camera.position[1])
      .toBeCloseTo(0);
    expect(result.current.cameraRequest?.camera.position[2])
      .toBeCloseTo(props.cameraFitRadius);
    expect(result.current.cameraRequest?.fov).toEqual(props.desiredFov);
  });

  it("rotates TOP view by 90 degrees and consumes layer boundaries", () => {
    const viewPrismBridgeRef = React.createRef<ViewPrismBridge>();
    const props: GardenCameraControllerProps = {
      ...fakeControllerProps(),
      baseCamera: {
        position: [0, -1, 5000],
        target: [0, 0, 0],
      },
      viewPrismBridgeRef,
    };
    const { result } = renderHook(() =>
      useGardenCameraController(props));

    const initialRequest = result.current.cameraRequest;
    const boundaryEvent = dispatchKeyboardEvent("ArrowUp");
    expect(boundaryEvent.defaultPrevented).toBeTruthy();
    expect(result.current.cameraRequest).toBe(initialRequest);

    dispatchKeyboardEvent("ArrowRight");
    expect(result.current.cameraRequest?.camera.position[0])
      .toBeGreaterThan(0);
    expect(result.current.cameraRequest?.camera.position[1])
      .toBeCloseTo(0);
  });

  it("resets chained navigation after a non-keyboard interaction", () => {
    const controlsCamera = new ThreePerspectiveCamera();
    controlsCamera.position.set(0, -1000, 1000);
    const controls = {
      target: new Vector3(),
      update: jest.fn(),
    } as NonNullable<GardenCameraControllerProps["controls"]>;
    const props: GardenCameraControllerProps = {
      ...fakeControllerProps(),
      controlsCamera,
      controls,
      viewPrismBridgeRef: React.createRef<ViewPrismBridge>(),
    };
    const { result } = renderHook(() =>
      useGardenCameraController(props));

    dispatchKeyboardEvent("ArrowRight");
    dispatchKeyboardEvent("ArrowRight");
    expect(result.current.cameraRequest?.camera.position[1])
      .toBeCloseTo(0);

    act(() => result.current.resetViewPrismKeyboardNavigation());
    dispatchKeyboardEvent("ArrowRight");
    expect(result.current.cameraRequest?.camera.position[0])
      .toBeGreaterThan(0);
    expect(result.current.cameraRequest?.camera.position[1])
      .toBeLessThan(0);

    act(() => props.viewPrismBridgeRef?.current?.selectDirection?.(
      [0, -1, 1],
    ));
    dispatchKeyboardEvent("ArrowRight");
    expect(result.current.cameraRequest?.camera.position[0])
      .toBeGreaterThan(0);
    expect(result.current.cameraRequest?.camera.position[1])
      .toBeLessThan(0);

    act(() => result.current.selectStartingCamera(180, true));
    expect(result.current.cameraRequest?.camera.position[2])
      .toBeGreaterThan(0);
    dispatchKeyboardEvent("ArrowRight");
    expect(result.current.cameraRequest?.camera.position[0])
      .toBeGreaterThan(0);
    expect(result.current.cameraRequest?.camera.position[1])
      .toBeLessThan(0);
  });

  it("synchronizes the request after a free camera orbit", () => {
    const controlsCamera = new ThreePerspectiveCamera();
    controlsCamera.position.set(500, -1000, 1000);
    const controls = {
      target: new Vector3(),
      update: jest.fn(),
    } as NonNullable<GardenCameraControllerProps["controls"]>;
    const props: GardenCameraControllerProps = {
      ...fakeControllerProps(),
      baseCamera: {
        position: [0, -1000, 1000],
        target: [0, 0, 0],
      },
      controlsCamera,
      controls,
      viewPrismBridgeRef: React.createRef<ViewPrismBridge>(),
    };
    const { result } = renderHook(() =>
      useGardenCameraController(props));

    act(() => result.current.synchronizeCameraRequest());
    expect(result.current.cameraRequest?.camera.position)
      .toEqual([500, -1000, 1000]);

    dispatchKeyboardEvent("ArrowLeft");
    expect(result.current.cameraRequest?.camera.position[0]).toBeCloseTo(0);
    expect(result.current.cameraRequest?.camera.position[1]).toBeLessThan(0);
  });

  it("ignores arrow keys reserved for focused UI", () => {
    const props: GardenCameraControllerProps = {
      ...fakeControllerProps(),
      viewPrismBridgeRef: React.createRef<ViewPrismBridge>(),
    };
    const { result } = renderHook(() =>
      useGardenCameraController(props));
    const initialRequest = result.current.cameraRequest;

    [
      ["KeyA", {}],
      ["ArrowRight", { altKey: true }],
      ["ArrowRight", { ctrlKey: true }],
      ["ArrowRight", { metaKey: true }],
      ["ArrowRight", { shiftKey: true }],
      ["ArrowRight", { repeat: true }],
    ].map(([key, init]) => {
      const event = dispatchKeyboardEvent(
        key as string,
        init as KeyboardEventInit,
      );
      expect(event.defaultPrevented).toBeFalsy();
    });

    const input = document.createElement("input");
    document.body.appendChild(input);
    expect(dispatchKeyboardEvent(
      "ArrowRight",
      {},
      input,
    ).defaultPrevented).toBeFalsy();
    input.remove();

    const editable = document.createElement("div");
    editable.setAttribute("contenteditable", "true");
    document.body.appendChild(editable);
    expect(dispatchKeyboardEvent(
      "ArrowRight",
      {},
      editable,
    ).defaultPrevented).toBeFalsy();
    editable.remove();

    const dialog = document.createElement("dialog");
    dialog.className = "command-palette-dialog";
    dialog.setAttribute("open", "");
    document.body.appendChild(dialog);
    expect(dispatchKeyboardEvent(
      "ArrowRight",
    ).defaultPrevented).toBeFalsy();
    dialog.remove();

    expect(result.current.cameraRequest).toBe(initialRequest);
  });

  it("only enables prism keys in the normal product scene", () => {
    const viewPrismBridgeRef = React.createRef<ViewPrismBridge>();
    const props: GardenCameraControllerProps = {
      ...fakeControllerProps(),
      viewPrismBridgeRef,
    };
    const { result, rerender, unmount } = renderHook(
      (controllerProps: GardenCameraControllerProps) =>
        useGardenCameraController(controllerProps),
      { initialProps: props },
    );

    rerender({ ...props, promo: true });
    expect(dispatchKeyboardEvent(
      "ArrowRight",
    ).defaultPrevented).toBeFalsy();

    rerender({ ...props, viewMode: "stargazing" });
    expect(dispatchKeyboardEvent(
      "ArrowRight",
    ).defaultPrevented).toBeFalsy();

    rerender({ ...props, viewMode: "normal" });
    expect(result.current.cameraPhase).toEqual("transitioning");
    expect(dispatchKeyboardEvent(
      "ArrowRight",
    ).defaultPrevented).toBeFalsy();

    act(() => result.current.cameraRequest?.onRest?.());
    rerender({ ...props, viewPrismBridgeRef: undefined });
    expect(dispatchKeyboardEvent(
      "ArrowRight",
    ).defaultPrevented).toBeFalsy();

    unmount();
    expect(dispatchKeyboardEvent(
      "ArrowRight",
    ).defaultPrevented).toBeFalsy();
  });

  it("exits follow from the prism and resets on exit", async () => {
    const viewPrismBridgeRef = React.createRef<ViewPrismBridge>();
    const stopCameraFollow = jest.fn();
    const handleCameraFollowEscape = jest.fn(() => true);
    const props: GardenCameraControllerProps = {
      ...fakeControllerProps(),
      cameraFollow: true,
      handleCameraFollowEscape,
      stopCameraFollow,
      viewPrismBridgeRef,
    };
    const { result, rerender } = renderHook(
      (controllerProps: GardenCameraControllerProps) =>
        useGardenCameraController(controllerProps),
      { initialProps: props },
    );
    const cancel = jest.fn();
    result.current.cameraSpringCancelRef.current = cancel;
    const activeRequest = result.current.cameraRequest;

    expect(viewPrismBridgeRef.current?.selectDirection).toBeDefined();
    act(() => viewPrismBridgeRef.current?.selectDirection?.([0, 0, 1]));
    expect(stopCameraFollow).toHaveBeenCalled();
    expect(dispatchKeyboardEvent("Escape").defaultPrevented).toBeFalsy();
    expect(handleCameraFollowEscape).toHaveBeenCalled();
    expect(stopCameraFollow).toHaveBeenCalledTimes(1);
    handleCameraFollowEscape.mockReturnValue(false);
    expect(dispatchKeyboardEvent("Escape", { repeat: true }).defaultPrevented)
      .toBeFalsy();
    expect(stopCameraFollow).toHaveBeenCalledTimes(1);
    const preventedEscape = new KeyboardEvent("keydown", {
      key: "Escape",
      bubbles: true,
      cancelable: true,
    });
    preventedEscape.preventDefault();
    act(() => window.dispatchEvent(preventedEscape));
    expect(stopCameraFollow).toHaveBeenCalledTimes(1);
    const dialog = document.createElement("dialog");
    dialog.className = "command-palette-dialog";
    dialog.setAttribute("open", "");
    document.body.appendChild(dialog);
    expect(dispatchKeyboardEvent("Escape").defaultPrevented).toBeFalsy();
    expect(stopCameraFollow).toHaveBeenCalledTimes(1);
    dialog.remove();
    expect(dispatchKeyboardEvent("Escape").defaultPrevented).toBeFalsy();
    expect(stopCameraFollow).toHaveBeenCalledTimes(2);
    expect(dispatchKeyboardEvent("ArrowRight").defaultPrevented)
      .toBeFalsy();
    rerender({ ...props, desiredFov: 1 });
    expect(result.current.cameraFov).toEqual(1);
    expect(result.current.cameraRequest).toBe(activeRequest);

    rerender({ ...props, cameraFollow: false, desiredFov: 1 });
    await waitFor(() => {
      expect(cancel).toHaveBeenCalled();
      expect(result.current.cameraRequest?.camera.target)
        .toEqual(props.startingCamera.target);
      expect(result.current.cameraRequest?.camera.position[2])
        .toBeGreaterThan(props.startingCamera.position[2]);
      expect(result.current.cameraRequest?.fov).toEqual(1);
      expect(viewPrismBridgeRef.current?.selectDirection).toBeDefined();
    });
  });

  it("resets to the user's configured starting camera", () => {
    const viewPrismBridgeRef = React.createRef<ViewPrismBridge>();
    const props: GardenCameraControllerProps = {
      ...fakeControllerProps(),
      viewPrismBridgeRef,
    };
    const { result } = renderHook(() =>
      useGardenCameraController(props));
    const cancel = jest.fn();
    result.current.cameraSpringCancelRef.current = cancel;

    act(() => viewPrismBridgeRef.current?.selectDirection?.([1, 0, 0]));
    expect(result.current.cameraRequest?.camera.position)
      .not.toEqual(props.startingCamera.position);
    act(() => viewPrismBridgeRef.current?.resetView?.());

    expect(cancel).toHaveBeenCalled();
    expect(result.current.cameraRequest?.camera.target)
      .toEqual(props.startingCamera.target);
    result.current.cameraRequest?.camera.position.map((value, index) =>
      expect(value).toBeCloseTo(props.startingCamera.position[index]));
    expect(result.current.cameraRequest?.fov).toEqual(props.desiredFov);
  });

  it("stops camera follow before resetting its view", () => {
    const viewPrismBridgeRef = React.createRef<ViewPrismBridge>();
    const stopCameraFollow = jest.fn();
    const props: GardenCameraControllerProps = {
      ...fakeControllerProps(),
      cameraFollow: true,
      stopCameraFollow,
      viewPrismBridgeRef,
    };
    renderHook(() => useGardenCameraController(props));

    act(() => viewPrismBridgeRef.current?.resetView?.());

    expect(stopCameraFollow).toHaveBeenCalledTimes(1);
  });

  it("returns to the starting view when stargazing stops follow", async () => {
    const props: GardenCameraControllerProps = {
      ...fakeControllerProps(),
      cameraFollow: true,
    };
    const { result, rerender } = renderHook(
      (controllerProps: GardenCameraControllerProps) =>
        useGardenCameraController(controllerProps),
      { initialProps: props },
    );

    rerender({
      ...props,
      cameraFollow: false,
      viewMode: "stargazing",
    });
    await waitFor(() => expect(result.current.cameraRequest?.camera)
      .toBe(props.stargazingCamera));
    act(() => result.current.cameraRequest?.onRest?.());

    rerender({
      ...props,
      cameraFollow: false,
      viewMode: "normal",
    });
    await waitFor(() => {
      expect(result.current.cameraRequest?.camera.target)
        .toEqual(props.startingCamera.target);
      result.current.cameraRequest?.camera.position.forEach((value, index) =>
        expect(value).toBeCloseTo(props.startingCamera.position[index]));
      expect(result.current.cameraRequest?.fov).toEqual(props.desiredFov);
    });
  });
});
