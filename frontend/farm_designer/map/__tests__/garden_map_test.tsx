import { Mode } from "../interfaces";
let mockMode = Mode.none;
let mockAtPlant = true;
let mockInteractionAllow = true;
let mockGroup: TaggedPointGroup | undefined = undefined;

import React from "react";
import type { GardenMap as GardenMapClass } from "../garden_map";
import {
  act, cleanup, createEvent, fireEvent, render,
} from "@testing-library/react";
import { GardenMapProps } from "../../interfaces";
import { setEggStatus, EggKeys } from "../easter_eggs/status";
import * as mapActions from "../actions";
import * as plantActions from "../layers/plants/plant_actions";
import * as selectionBoxActions from "../background/selection_box_actions";
import * as mapUtil from "../util";
import * as moveTo from "../../move_to";
import * as drawnPointActions from "../drawn_point/drawn_point_actions";
import {
  fakeDesignerState,
} from "../../../__test_support__/fake_designer_state";
import {
  fakePlant, fakePointGroup, fakePoint, fakeSensorReading,
} from "../../../__test_support__/fake_state/resources";
import { fakeTimeSettings } from "../../../__test_support__/fake_time_settings";
import { TaggedPointGroup } from "farmbot";
import { fakeMountedToolInfo } from "../../../__test_support__/fake_tool_info";
import {
  fakeCameraCalibrationData,
} from "../../../__test_support__/fake_camera_data";
import {
  fakeBotLocationData, fakeBotSize,
} from "../../../__test_support__/fake_bot_data";
import {
  fakeMapTransformProps,
} from "../../../__test_support__/map_transform_props";
import { keyboardEvent } from "../../../__test_support__/fake_html_events";
import * as lodash from "lodash";
import { Path } from "../../../internal_urls";
import * as profile from "../profile";
import * as groupDetail from "../../../point_groups/group_detail";
import { NavigationContext } from "../../../routes_helpers";

const ActualGardenMap = (jest.requireActual("../garden_map")).GardenMap;
const GardenMap = ActualGardenMap;

type EventName =
  | "click"
  | "mouseDown"
  | "mouseMove"
  | "mouseUp"
  | "dragOver"
  | "dragStart"
  | "dragEnter"
  | "scroll";

interface RenderedGardenMap {
  container: ParentNode;
  html: () => string;
  instance: () => GardenMapClass;
  setProps: (props: GardenMapProps) => void;
  setState: (state: Record<string, unknown>) => void;
  state: () => Partial<Record<string, unknown>>;
  unmount: () => void;
  update: () => void;
}

// eslint-disable-next-line complexity
const fire = (target: Element, event: EventName, payload?: unknown) => {
  const eventPayload = {
    ...((typeof payload === "object" && payload) ? payload : {}),
  } as Record<string, unknown>;
  if (!("clientX" in eventPayload) && "pageX" in eventPayload) {
    eventPayload.clientX = eventPayload.pageX;
  }
  if (!("clientY" in eventPayload) && "pageY" in eventPayload) {
    eventPayload.clientY = eventPayload.pageY;
  }
  const patchEvent = (created: Event) => {
    const originalPreventDefault = created.preventDefault.bind(created);
    if (typeof eventPayload.preventDefault === "function") {
      created.preventDefault = () => {
        (eventPayload.preventDefault as () => void)();
        originalPreventDefault();
      };
    }
    if ("pageX" in eventPayload) {
      Object.defineProperty(created, "pageX", {
        value: eventPayload.pageX,
        configurable: true,
      });
    }
    if ("pageY" in eventPayload) {
      Object.defineProperty(created, "pageY", {
        value: eventPayload.pageY,
        configurable: true,
      });
    }
    return created;
  };
  switch (event) {
    case "click":
      return fireEvent(target, patchEvent(createEvent.click(target, eventPayload)));
    case "mouseDown":
      return fireEvent(target, patchEvent(createEvent.mouseDown(target, eventPayload)));
    case "mouseMove":
      return fireEvent(target, patchEvent(createEvent.mouseMove(target, eventPayload)));
    case "mouseUp":
      return fireEvent(target, patchEvent(createEvent.mouseUp(target, eventPayload)));
    case "dragOver":
      const dragOver = patchEvent(new Event("dragover", {
        bubbles: true, cancelable: true,
      }));
      if ("dataTransfer" in eventPayload) {
        Object.defineProperty(dragOver, "dataTransfer", {
          value: eventPayload.dataTransfer,
          configurable: true,
        });
      }
      return fireEvent(target, dragOver);
    case "dragStart":
      const dragStart = patchEvent(new Event("dragstart", {
        bubbles: true, cancelable: true,
      }));
      if ("dataTransfer" in eventPayload) {
        Object.defineProperty(dragStart, "dataTransfer", {
          value: eventPayload.dataTransfer,
          configurable: true,
        });
      }
      return fireEvent(target, dragStart);
    case "dragEnter":
      return fireEvent(target, patchEvent(new Event("dragenter", {
        bubbles: true, cancelable: true,
      })));
    case "scroll":
      return fireEvent(target, patchEvent(createEvent.scroll(target, eventPayload)));
  }
};

/* eslint-disable complexity */
const fireWrapperEvent = (
  wrapper: RenderedGardenMap,
  selector: string,
  event: EventName,
  payload?: unknown,
) => {
  let fallbackTarget: Element | null | undefined = undefined;
  if (selector == ".drop-area-svg") {
    fallbackTarget = wrapper.container.querySelector(
      ".drop-area-svg, .drop-area-background, .drop-area svg, svg, .drop-area")
      || document.body.querySelector(
        ".drop-area-svg, .drop-area-background, .drop-area svg, svg, .drop-area");
  }
  if (selector == ".drop-area-background") {
    fallbackTarget = wrapper.container.querySelector(
      ".drop-area-background, .drop-area svg, svg")
      || document.body.querySelector(".drop-area-background, .drop-area svg, svg");
  }
  const target = wrapper.container.querySelector(selector) || fallbackTarget;
  if (!target) {
    const instance = wrapper.instance() as {
      click?: (event: unknown) => void;
      startDrag?: (event: unknown) => void;
      drag?: (event: unknown) => void;
      endDrag?: () => void;
      startDragOnBackground?: (event: unknown) => void;
      handleDragOver?: (event: unknown) => void;
      handleDragEnter?: (event: unknown) => void;
      dragStart?: (event: unknown) => void;
    };
    if ((selector == ".drop-area-svg" || selector == "svg") && event == "click") {
      instance.click?.(payload as never);
      return;
    }
    if (selector == ".drop-area-svg" || selector == "svg") {
      if (event == "mouseDown") {
        instance.startDrag?.(payload as never);
        return;
      }
      if (event == "mouseMove") {
        instance.drag?.(payload as never);
        return;
      }
      if (event == "mouseUp") {
        instance.endDrag?.();
        return;
      }
    }
    if (selector == ".drop-area-background" && event == "mouseDown") {
      instance.startDragOnBackground?.(payload as never);
      return;
    }
    if (selector == ".drop-area") {
      if (event == "dragOver") {
        instance.handleDragOver?.(payload as never);
        return;
      }
      if (event == "dragEnter") {
        instance.handleDragEnter?.(payload as never);
        return;
      }
      if (event == "dragStart") {
        instance.dragStart?.(payload as never);
        return;
      }
    }
    throw new Error(`Expected ${selector}`);
  }
  fire(target, event, payload);
};
/* eslint-enable complexity */

const makeWrapper = (
  element: React.ReactElement,
  useContext = false,
): RenderedGardenMap => {
  const ref = React.createRef<GardenMapClass>();
  const props = element.props as GardenMapProps;
  const wrap = (nextProps: GardenMapProps) => {
    const wrapped = <ActualGardenMap {...nextProps} ref={ref} />;
    return useContext
      ? <NavigationContext.Provider value={mockNavigate}>{wrapped}</NavigationContext.Provider>
      : wrapped;
  };
  const view = render(wrap(props));
  return {
    html: () => view.container.innerHTML,
    instance: () => {
      if (!ref.current) { throw new Error("Expected GardenMap instance"); }
      return ref.current;
    },
    setProps: (nextProps: GardenMapProps) => {
      view.rerender(wrap(nextProps));
    },
    setState: (state: Record<string, unknown>) => {
      act(() => ref.current?.setState(state));
    },
    container: view.container,
    state: () => ref.current?.state || {},
    unmount: () => view.unmount(),
    update: () => act(() => undefined),
  };
};

const renderMap = <T, >(element: React.ReactElement<T>) => makeWrapper(element);
const renderMapWithContext = <T, >(element: React.ReactElement<T>) =>
  makeWrapper(element, true);

const DEFAULT_EVENT = { preventDefault: jest.fn(), pageX: NaN, pageY: NaN };
let getModeSpy: jest.SpyInstance;
let getMapSizeSpy: jest.SpyInstance;
let getGardenCoordinatesSpy: jest.SpyInstance;
let transformXYSpy: jest.SpyInstance;
let transformForQuadrantSpy: jest.SpyInstance;
let roundSpy: jest.SpyInstance;
let cursorAtPlantSpy: jest.SpyInstance;
let allowInteractionSpy: jest.SpyInstance;
let allowGroupAreaInteractionSpy: jest.SpyInstance;
let scaleIconSpy: jest.SpyInstance;
let startNewSelectionBoxSpy: jest.SpyInstance;
let resizeBoxSpy: jest.SpyInstance;
let maybeUpdateGroupSpy: jest.SpyInstance;
let dropPlantSpy: jest.SpyInstance;
let beginPlantDragSpy: jest.SpyInstance;
let maybeSavePlantLocationSpy: jest.SpyInstance;
let dragPlantSpy: jest.SpyInstance;
let jogPointsSpy: jest.SpyInstance;
let savePointsSpy: jest.SpyInstance;
let chooseProfileSpy: jest.SpyInstance;
let debounceSpy: jest.SpyInstance;
let throttleSpy: jest.SpyInstance;
let unselectPlantSpy: jest.SpyInstance;
let closePlantInfoSpy: jest.SpyInstance;
let chooseLocationSpy: jest.SpyInstance;
let startNewPointSpy: jest.SpyInstance;
let resizePointSpy: jest.SpyInstance;
let findGroupFromUrlSpy: jest.SpyInstance;

const fakeProps = (): GardenMapProps => ({
  showPoints: true,
  showPlants: true,
  showWeeds: true,
  showSpread: false,
  showFarmbot: false,
  showImages: false,
  showZones: false,
  showSensorReadings: false,
  selectedPlant: undefined,
  crops: [],
  dispatch: jest.fn(),
  designer: fakeDesignerState(),
  plants: [],
  genericPoints: [],
  weeds: [],
  allPoints: [],
  toolSlots: [],
  botLocationData: fakeBotLocationData(),
  botSize: fakeBotSize(),
  stopAtHome: { x: true, y: true },
  hoveredPlant: undefined,
  zoomLvl: 1,
  mapTransformProps: fakeMapTransformProps(),
  gridOffset: { x: 100, y: 100 },
  peripheralValues: [],
  eStopStatus: false,
  latestImages: [],
  cameraCalibrationData: fakeCameraCalibrationData(),
  getConfigValue: jest.fn(),
  sensorReadings: [fakeSensorReading()],
  sensors: [],
  timeSettings: fakeTimeSettings(),
  groups: [],
  mountedToolInfo: fakeMountedToolInfo(),
  visualizedSequenceBody: [],
  logs: [],
  deviceTarget: "",
  farmwareEnvs: [],
  curves: [],
});

describe("<GardenMap/>", () => {
  beforeEach(() => {
    mockMode = Mode.none;
    mockAtPlant = true;
    mockInteractionAllow = true;
    mockGroup = undefined;
    getModeSpy = jest.spyOn(mapUtil, "getMode").mockImplementation(() => mockMode);
    getMapSizeSpy = jest.spyOn(mapUtil, "getMapSize")
      .mockImplementation(() => ({ h: 100, w: 100 }));
    getGardenCoordinatesSpy = jest.spyOn(mapUtil, "getGardenCoordinates")
      .mockImplementation(() => ({ x: 100, y: 200 }));
    transformXYSpy = jest.spyOn(mapUtil, "transformXY")
      .mockImplementation(() => ({ qx: 0, qy: 0 }));
    transformForQuadrantSpy = jest.spyOn(mapUtil, "transformForQuadrant")
      .mockImplementation(jest.fn());
    roundSpy = jest.spyOn(mapUtil, "round").mockImplementation(jest.fn());
    cursorAtPlantSpy = jest.spyOn(mapUtil, "cursorAtPlant")
      .mockImplementation(() => mockAtPlant);
    allowInteractionSpy = jest.spyOn(mapUtil, "allowInteraction")
      .mockImplementation(() => mockInteractionAllow);
    allowGroupAreaInteractionSpy = jest.spyOn(mapUtil, "allowGroupAreaInteraction")
      .mockImplementation(jest.fn());
    scaleIconSpy = jest.spyOn(mapUtil, "scaleIcon").mockImplementation(jest.fn());
    startNewSelectionBoxSpy = jest.spyOn(selectionBoxActions, "startNewSelectionBox")
      .mockImplementation(jest.fn());
    resizeBoxSpy = jest.spyOn(selectionBoxActions, "resizeBox")
      .mockImplementation(jest.fn());
    maybeUpdateGroupSpy = jest.spyOn(selectionBoxActions, "maybeUpdateGroup")
      .mockImplementation(jest.fn());
    dropPlantSpy =
      jest.spyOn(plantActions, "dropPlant").mockImplementation(jest.fn());
    beginPlantDragSpy =
      jest.spyOn(plantActions, "beginPlantDrag").mockImplementation(jest.fn());
    maybeSavePlantLocationSpy =
      jest.spyOn(plantActions, "maybeSavePlantLocation")
        .mockImplementation(jest.fn());
    dragPlantSpy =
      jest.spyOn(plantActions, "dragPlant").mockImplementation(jest.fn());
    jogPointsSpy =
      jest.spyOn(plantActions, "jogPoints").mockImplementation(jest.fn());
    savePointsSpy =
      jest.spyOn(plantActions, "savePoints").mockImplementation(jest.fn());
    chooseProfileSpy =
      jest.spyOn(profile, "chooseProfile").mockImplementation(jest.fn());
    debounceSpy = jest.spyOn(lodash, "debounce")
      .mockImplementation(jest.fn((fn: unknown) => fn) as never);
    throttleSpy = jest.spyOn(lodash, "throttle")
      .mockImplementation(jest.fn((fn: unknown) => fn) as never);
    unselectPlantSpy = jest.spyOn(mapActions, "unselectPlant")
      .mockImplementation(() => jest.fn());
    closePlantInfoSpy = jest.spyOn(mapActions, "closePlantInfo")
      .mockImplementation(() => jest.fn());
    chooseLocationSpy = jest.spyOn(moveTo, "chooseLocation")
      .mockImplementation(jest.fn());
    startNewPointSpy = jest.spyOn(drawnPointActions, "startNewPoint")
      .mockImplementation(jest.fn());
    resizePointSpy = jest.spyOn(drawnPointActions, "resizePoint")
      .mockImplementation(jest.fn());
    findGroupFromUrlSpy = jest.spyOn(groupDetail, "findGroupFromUrl")
      .mockImplementation(() => mockGroup);
  });

  afterEach(() => {
    cleanup();
    getModeSpy.mockRestore();
    getMapSizeSpy.mockRestore();
    getGardenCoordinatesSpy.mockRestore();
    transformXYSpy.mockRestore();
    transformForQuadrantSpy.mockRestore();
    roundSpy.mockRestore();
    cursorAtPlantSpy.mockRestore();
    allowInteractionSpy.mockRestore();
    allowGroupAreaInteractionSpy.mockRestore();
    scaleIconSpy.mockRestore();
    startNewSelectionBoxSpy.mockRestore();
    resizeBoxSpy.mockRestore();
    maybeUpdateGroupSpy.mockRestore();
    dropPlantSpy.mockRestore();
    beginPlantDragSpy.mockRestore();
    maybeSavePlantLocationSpy.mockRestore();
    dragPlantSpy.mockRestore();
    jogPointsSpy.mockRestore();
    savePointsSpy.mockRestore();
    chooseProfileSpy.mockRestore();
    debounceSpy.mockRestore();
    throttleSpy.mockRestore();
    unselectPlantSpy.mockRestore();
    closePlantInfoSpy.mockRestore();
    chooseLocationSpy.mockRestore();
    startNewPointSpy.mockRestore();
    resizePointSpy.mockRestore();
    findGroupFromUrlSpy.mockRestore();
  });

  it("drops plant", () => {
    mockMode = Mode.clickToAdd;
    const wrapper = renderMap(<GardenMap {...fakeProps()} />);
    fireWrapperEvent(wrapper, ".drop-area-svg", "click", DEFAULT_EVENT);
    expect(plantActions.dropPlant).toHaveBeenCalled();
  });

  it("moves plant left", () => {
    mockMode = Mode.editPlant;
    renderMap(<GardenMap {...fakeProps()} />);
    const e = keyboardEvent("ArrowDown");
    document.onkeydown?.(e as never);
    expect(plantActions.jogPoints).toHaveBeenCalled();
    expect(e.preventDefault).toHaveBeenCalled();
  });

  it("doesn't move plant left", () => {
    mockMode = Mode.editPlant;
    renderMap(<GardenMap {...fakeProps()} />);
    const e = keyboardEvent("Enter");
    document.onkeydown?.(e as never);
    expect(plantActions.jogPoints).not.toHaveBeenCalled();
    expect(e.preventDefault).not.toHaveBeenCalled();
  });

  it("saves plant", () => {
    mockMode = Mode.editPlant;
    const p = fakeProps();
    const point = fakePoint();
    p.designer.selectedPoints = [point.uuid];
    p.allPoints = [point];
    renderMap(<GardenMap {...p} />);
    const e = keyboardEvent("ArrowDown");
    document.onkeyup?.(e as never);
    expect(plantActions.savePoints).toHaveBeenCalled();
    expect(e.preventDefault).toHaveBeenCalled();
  });

  it("doesn't save plant", () => {
    mockMode = Mode.editPlant;
    renderMap(<GardenMap {...fakeProps()} />);
    const e = keyboardEvent("Enter");
    document.onkeyup?.(e as never);
    expect(plantActions.savePoints).not.toHaveBeenCalled();
    expect(e.preventDefault).not.toHaveBeenCalled();
  });

  it("doesn't animate", () => {
    mockMode = Mode.editPlant;
    mockGroup = fakePointGroup();
    mockGroup.body.criteria.string_eq = { pointer_type: ["Plant"] };
    const p = fakeProps();
    p.getConfigValue = () => false;
    const wrapper = renderMap<GardenMap>(<GardenMap {...p} />);
    expect(wrapper.instance().animate).toBeTruthy();
    p.allPoints = lodash.times(101, fakePlant);
    wrapper.setProps(p);
    expect(wrapper.instance().animate).toBeFalsy();
  });

  it("starts drag: move plant", () => {
    mockMode = Mode.editPlant;
    const wrapper = renderMap(<GardenMap {...fakeProps()} />);
    mockAtPlant = true;
    fireWrapperEvent(wrapper, ".drop-area-svg", "mouseDown", DEFAULT_EVENT);
    expect(plantActions.beginPlantDrag).toHaveBeenCalled();
    expect(startNewSelectionBoxSpy).not.toHaveBeenCalled();
  });

  it("starts drag: draw box", () => {
    mockMode = Mode.editPlant;
    const wrapper = renderMap(<GardenMap {...fakeProps()} />);
    mockAtPlant = false;
    fireWrapperEvent(wrapper, ".drop-area-svg", "mouseDown", DEFAULT_EVENT);
    expect(plantActions.beginPlantDrag).not.toHaveBeenCalled();
    expect(startNewSelectionBoxSpy).toHaveBeenCalled();
  });

  it("ends drag", () => {
    mockMode = Mode.editPlant;
    const wrapper = renderMap<GardenMap>(<GardenMap {...fakeProps()} />);
    wrapper.setState({ isDragging: true });
    fireWrapperEvent(wrapper, ".drop-area-svg", "mouseUp", DEFAULT_EVENT);
    expect(maybeSavePlantLocationSpy).toHaveBeenCalled();
    expect(maybeUpdateGroupSpy).toHaveBeenCalled();
    expect(wrapper.instance().state.isDragging).toBeFalsy();
  });

  it("drags: editing", () => {
    mockMode = Mode.editPlant;
    const wrapper = renderMap(<GardenMap {...fakeProps()} />);
    fireWrapperEvent(wrapper, ".drop-area-svg", "mouseMove", DEFAULT_EVENT);
    expect(plantActions.dragPlant).toHaveBeenCalled();
  });

  it("starts drag on background: selecting", () => {
    mockMode = Mode.addPlant;
    const p = fakeProps();
    p.designer.selectedPoints = ["fakePointUuid"];
    const wrapper = renderMapWithContext(<GardenMap {...p} />);
    const e = { pageX: 1000, pageY: 2000 };
    fireWrapperEvent(wrapper, ".drop-area-background", "mouseDown", e);
    expect(startNewSelectionBoxSpy).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith(Path.plants());
    expect(getGardenCoordinatesSpy).toHaveBeenCalledWith(
      expect.objectContaining(e));
  });

  it("starts drag on background: selecting again", () => {
    mockMode = Mode.boxSelect;
    const wrapper = renderMapWithContext(<GardenMap {...fakeProps()} />);
    const e = { pageX: 1000, pageY: 2000 };
    fireWrapperEvent(wrapper, ".drop-area-background", "mouseDown", e);
    expect(startNewSelectionBoxSpy).toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
    expect(getGardenCoordinatesSpy).toHaveBeenCalledWith(
      expect.objectContaining(e));
  });

  it("starts drag on background: does nothing when adding plants", () => {
    mockMode = Mode.clickToAdd;
    const wrapper = renderMapWithContext(<GardenMap {...fakeProps()} />);
    const e = { pageX: 1000, pageY: 2000 };
    fireWrapperEvent(wrapper, ".drop-area-background", "mouseDown", e);
    expect(startNewSelectionBoxSpy).not.toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
    expect(getGardenCoordinatesSpy).not.toHaveBeenCalled();
  });

  it("starts drag on background: does nothing when in move mode", () => {
    mockMode = Mode.locationInfo;
    const wrapper = renderMapWithContext(<GardenMap {...fakeProps()} />);
    const e = { pageX: 1000, pageY: 2000 };
    fireWrapperEvent(wrapper, ".drop-area-background", "mouseDown", e);
    expect(startNewSelectionBoxSpy).not.toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
    expect(getGardenCoordinatesSpy).not.toHaveBeenCalled();
  });

  it("starts drag on background: does nothing when in profile mode", () => {
    mockMode = Mode.profile;
    const wrapper = renderMapWithContext(<GardenMap {...fakeProps()} />);
    const e = { pageX: 1000, pageY: 2000 };
    fireWrapperEvent(wrapper, ".drop-area-background", "mouseDown", e);
    expect(startNewSelectionBoxSpy).not.toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
    expect(getGardenCoordinatesSpy).not.toHaveBeenCalled();
  });

  it("starts drag on background: creating points", () => {
    mockMode = Mode.createPoint;
    const wrapper = renderMapWithContext(<GardenMap {...fakeProps()} />);
    const e = { pageX: 1000, pageY: 2000 };
    fireWrapperEvent(wrapper, ".drop-area-background", "mouseDown", e);
    expect(drawnPointActions.startNewPoint).toHaveBeenCalled();
    expect(startNewSelectionBoxSpy).not.toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
    expect(getGardenCoordinatesSpy).toHaveBeenCalledWith(
      expect.objectContaining(e));
  });

  it("starts drag on background: creating weeds", () => {
    mockMode = Mode.createWeed;
    const wrapper = renderMapWithContext(<GardenMap {...fakeProps()} />);
    const e = { pageX: 1000, pageY: 2000 };
    fireWrapperEvent(wrapper, ".drop-area-background", "mouseDown", e);
    expect(drawnPointActions.startNewPoint).toHaveBeenCalled();
    expect(startNewSelectionBoxSpy).not.toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
    expect(getGardenCoordinatesSpy).toHaveBeenCalledWith(
      expect.objectContaining(e));
  });

  it("starts drag on background: selecting zone", () => {
    mockMode = Mode.editGroup;
    const p = fakeProps();
    p.designer.editGroupAreaInMap = true;
    const wrapper = renderMapWithContext(<GardenMap {...p} />);
    const e = { pageX: 1000, pageY: 2000 };
    fireWrapperEvent(wrapper, ".drop-area-background", "mouseDown", e);
    expect(startNewSelectionBoxSpy).toHaveBeenCalledWith(
      expect.objectContaining({ plantActions: false }));
    expect(mockNavigate).not.toHaveBeenCalled();
    expect(getGardenCoordinatesSpy).toHaveBeenCalledWith(
      expect.objectContaining(e));
  });

  it("starts drag on background: opening location info", () => {
    location.pathname = Path.mock(Path.plants());
    mockMode = Mode.none;
    const p = fakeProps();
    p.designer.selectedPoints = [];
    p.designer.hoveredPlant = { plantUUID: undefined };
    p.designer.hoveredPoint = undefined;
    p.designer.hoveredToolSlot = undefined;
    const wrapper = renderMap<GardenMap>(<GardenMap {...p} />);
    const e = { pageX: 1000, pageY: 2000 } as React.DragEvent<SVGElement>;
    wrapper.instance().startDragOnBackground(e);
    fireWrapperEvent(wrapper, ".drop-area-background", "mouseDown", e);
    expect(startNewSelectionBoxSpy).toHaveBeenCalled();
    expect(getGardenCoordinatesSpy).toHaveBeenCalledWith(
      expect.objectContaining(e));
    wrapper.update();
    expect(wrapper.state().toLocation).toEqual({ x: 100, y: 200, z: 0 });
  });

  it("starts drag: click-to-add mode", () => {
    mockMode = Mode.clickToAdd;
    const wrapper = renderMap(<GardenMap {...fakeProps()} />);
    const e = { pageX: 1000, pageY: 2000 };
    fireWrapperEvent(wrapper, ".drop-area-svg", "mouseDown", e);
    expect(plantActions.beginPlantDrag).not.toHaveBeenCalled();
    expect(getGardenCoordinatesSpy).not.toHaveBeenCalled();
  });

  it("drags: selecting", () => {
    mockMode = Mode.boxSelect;
    const wrapper = renderMap(<GardenMap {...fakeProps()} />);
    const e = { pageX: 2000, pageY: 2000 };
    fireWrapperEvent(wrapper, ".drop-area-svg", "mouseMove", e);
    expect(resizeBoxSpy).toHaveBeenCalled();
    expect(getGardenCoordinatesSpy).toHaveBeenCalledWith(
      expect.objectContaining(e));
  });

  it("drags: selecting zone", () => {
    mockMode = Mode.editGroup;
    const p = fakeProps();
    p.designer.editGroupAreaInMap = true;
    const wrapper = renderMap(<GardenMap {...p} />);
    const e = { pageX: 2000, pageY: 2000 };
    fireWrapperEvent(wrapper, ".drop-area-svg", "mouseMove", e);
    expect(resizeBoxSpy).toHaveBeenCalledWith(
      expect.objectContaining({ plantActions: false }));
    expect(getGardenCoordinatesSpy).toHaveBeenCalledWith(
      expect.objectContaining(e));
  });

  it("selects location", () => {
    mockMode = Mode.locationInfo;
    const wrapper = renderMap(<GardenMap {...fakeProps()} />);
    fireWrapperEvent(wrapper, ".drop-area-svg", "click", {
      pageX: 1000, pageY: 2000, preventDefault: jest.fn()
    });
    expect(moveTo.chooseLocation).toHaveBeenCalled();
    expect(getGardenCoordinatesSpy).toHaveBeenCalledWith(
      expect.objectContaining({ pageX: 1000, pageY: 2000 }));
  });

  it("selects profile location", () => {
    mockMode = Mode.profile;
    const wrapper = renderMap(<GardenMap {...fakeProps()} />);
    fireWrapperEvent(wrapper, ".drop-area-svg", "click", {
      pageX: 1000, pageY: 2000, preventDefault: jest.fn()
    });
    expect(profile.chooseProfile).toHaveBeenCalled();
    expect(getGardenCoordinatesSpy).toHaveBeenCalledWith(
      expect.objectContaining({ pageX: 1000, pageY: 2000 }));
  });

  it("starts drawing point", () => {
    mockMode = Mode.createPoint;
    const wrapper = renderMap(<GardenMap {...fakeProps()} />);
    fireWrapperEvent(wrapper, ".drop-area-svg", "mouseDown", {
      pageX: 1, pageY: 2
    });
    expect(drawnPointActions.startNewPoint).toHaveBeenCalledWith(
      expect.objectContaining({
        gardenCoords: { x: 100, y: 200 },
      }));
    expect(getGardenCoordinatesSpy).toHaveBeenCalledWith(
      expect.objectContaining({ pageX: 1, pageY: 2 }));
  });

  it("sets drawn point radius", () => {
    mockMode = Mode.createPoint;
    const wrapper = renderMap(<GardenMap {...fakeProps()} />);
    fireWrapperEvent(wrapper, ".drop-area-svg", "mouseMove", {
      pageX: 10, pageY: 20
    });
    expect(drawnPointActions.resizePoint).toHaveBeenCalledWith(
      expect.objectContaining({
        gardenCoords: { x: 100, y: 200 },
      }));
  });

  it("sets drawn weed radius", () => {
    mockMode = Mode.createWeed;
    const wrapper = renderMap(<GardenMap {...fakeProps()} />);
    fireWrapperEvent(wrapper, ".drop-area-svg", "mouseMove", {
      pageX: 10, pageY: 20
    });
    expect(drawnPointActions.resizePoint).toHaveBeenCalledWith(
      expect.objectContaining({
        gardenCoords: { x: 100, y: 200 },
      }));
  });

  it("sets cursor position", () => {
    mockMode = Mode.clickToAdd;
    const wrapper = renderMap<GardenMap>(<GardenMap {...fakeProps()} />);
    fireWrapperEvent(wrapper, ".drop-area-svg", "mouseMove", {
      pageX: 10, pageY: 20
    });
    expect(wrapper.state().cursorPosition).toEqual({ x: 100, y: 200 });
  });

  it("lays eggs", () => {
    setEggStatus(EggKeys.BRING_ON_THE_BUGS, "");
    setEggStatus(EggKeys.BUGS_ARE_STILL_ALIVE, "");
    const wrapper = renderMap<GardenMap>(<GardenMap {...fakeProps()} />);
    expect(wrapper.instance().Bugs()).toEqual(<g />);
    setEggStatus(EggKeys.BRING_ON_THE_BUGS, "true");
    setEggStatus(EggKeys.BUGS_ARE_STILL_ALIVE, "");
    expect(wrapper.instance().Bugs()).not.toEqual(<g />);
  });

  const expectHandledDragOver = () => {
    const wrapper = renderMap(<GardenMap {...fakeProps()} />);
    const e = {
      dataTransfer: { dropEffect: undefined },
      preventDefault: jest.fn()
    };
    fireWrapperEvent(wrapper, ".drop-area", "dragOver", e);
    expect(e.dataTransfer.dropEffect).toEqual("move");
    expect(e.preventDefault).toHaveBeenCalled();
  };

  it(".drop-area: handles drag over (crop page)", () => {
    mockMode = Mode.addPlant;
    expectHandledDragOver();
  });

  it(".drop-area: handles drag over (click-to-add mode)", () => {
    mockMode = Mode.clickToAdd;
    expectHandledDragOver();
  });

  it(".drop-area: handles drag start", () => {
    mockMode = Mode.none;
    const wrapper = renderMap(<GardenMap {...fakeProps()} />);
    const e = DEFAULT_EVENT;
    fireWrapperEvent(wrapper, ".drop-area", "dragStart", e);
    expect(e.preventDefault).toHaveBeenCalled();
  });

  it(".drop-area: handles drag enter", () => {
    mockMode = Mode.addPlant;
    const wrapper = renderMap(<GardenMap {...fakeProps()} />);
    const e = DEFAULT_EVENT;
    fireWrapperEvent(wrapper, ".drop-area", "dragEnter", e);
    expect(e.preventDefault).toHaveBeenCalled();
  });

  it("closes panel", () => {
    mockMode = Mode.boxSelect;
    const p = fakeProps();
    p.designer.selectedPoints = undefined;
    const wrapper = renderMap<GardenMap>(<GardenMap {...p} />);
    wrapper.instance().closePanel()();
    expect(mapActions.closePlantInfo).toHaveBeenCalled();
  });

  it("closes panel when not in select mode", () => {
    mockMode = Mode.none;
    const wrapper = renderMap<GardenMap>(<GardenMap {...fakeProps()} />);
    wrapper.instance().closePanel()();
    expect(mapActions.closePlantInfo).toHaveBeenCalled();
  });

  it("doesn't close panel: box select", () => {
    mockMode = Mode.boxSelect;
    const p = fakeProps();
    p.designer.selectedPoints = [fakePlant().uuid];
    const wrapper = renderMap<GardenMap>(<GardenMap {...p} />);
    wrapper.instance().closePanel()();
    expect(mapActions.closePlantInfo).not.toHaveBeenCalled();
  });

  it("doesn't close panel: move mode", () => {
    mockMode = Mode.locationInfo;
    const p = fakeProps();
    p.designer.selectedPoints = [fakePlant().uuid];
    const wrapper = renderMap<GardenMap>(<GardenMap {...p} />);
    wrapper.instance().closePanel()();
    expect(mapActions.closePlantInfo).not.toHaveBeenCalled();
  });

  it("doesn't close panel: profile mode", () => {
    mockMode = Mode.profile;
    const p = fakeProps();
    p.designer.selectedPoints = [fakePlant().uuid];
    const wrapper = renderMap<GardenMap>(<GardenMap {...p} />);
    wrapper.instance().closePanel()();
    expect(mapActions.closePlantInfo).not.toHaveBeenCalled();
  });

  it("closes panel: location active", () => {
    mockMode = Mode.none;
    const p = fakeProps();
    const wrapper = renderMap<GardenMap>(<GardenMap {...p} />);
    wrapper.setState({
      toLocation: { x: 100, y: 100, z: 0 }, previousSelectionBoxArea: 0,
    });
    wrapper.instance().navigate = jest.fn();
    act(() => wrapper.instance().closePanel()());
    expect(wrapper.instance().navigate).toHaveBeenCalledWith(
      expect.stringContaining(Path.location()));
    expect(mapActions.closePlantInfo).toHaveBeenCalled();
    expect(wrapper.state().toLocation).toEqual(undefined);
  });

  it("closes panel: location and selection box active", () => {
    mockMode = Mode.none;
    const p = fakeProps();
    const wrapper = renderMap<GardenMap>(<GardenMap {...p} />);
    wrapper.setState({
      toLocation: { x: 100, y: 100, z: 0 }, previousSelectionBoxArea: 1000,
    });
    wrapper.instance().navigate = jest.fn();
    act(() => wrapper.instance().closePanel()());
    expect(wrapper.instance().navigate).not.toHaveBeenCalledWith(
      expect.stringContaining(Path.location()));
    expect(mapActions.closePlantInfo).toHaveBeenCalled();
    expect(wrapper.state().toLocation).toEqual(undefined);
  });

  it("calls unselectPlant on unmount", () => {
    const wrapper = renderMap(<GardenMap {...fakeProps()} />);
    wrapper.unmount();
    expect(mapActions.unselectPlant).toHaveBeenCalled();
  });

  it("doesn't return plant in wrong mode", () => {
    const wrapper = renderMap<GardenMap>(<GardenMap {...fakeProps()} />);
    mockMode = Mode.locationInfo;
    expect(wrapper.instance().getPlant()).toEqual(undefined);
    mockMode = Mode.boxSelect;
    expect(wrapper.instance().getPlant()).toEqual(undefined);
    mockMode = Mode.createPoint;
    expect(wrapper.instance().getPlant()).toEqual(undefined);
  });

  it("returns point", () => {
    mockMode = Mode.none;
    const p = fakeProps();
    const point = fakePoint();
    p.allPoints = [point];
    p.designer.selectedPoints = [point.uuid];
    const wrapper = renderMap<GardenMap>(<GardenMap {...p} />);
    expect(wrapper.instance().currentSelection).toEqual([point]);
  });

  it("doesn't return point in wrong mode", () => {
    mockInteractionAllow = false;
    const wrapper = renderMap<GardenMap>(<GardenMap {...fakeProps()} />);
    expect(wrapper.instance().currentSelection).toEqual([]);
    mockInteractionAllow = true;
  });

  it("sets state", () => {
    const wrapper = renderMap<GardenMap>(<GardenMap {...fakeProps()} />);
    expect(wrapper.instance().state.isDragging).toBeFalsy();
    act(() => wrapper.instance().setMapState({ isDragging: true }));
    expect(wrapper.instance().state.isDragging).toBe(true);
  });

  it("allows interactions: default", () => {
    mockMode = Mode.none;
    mockInteractionAllow = true;
    const p = fakeProps();
    p.designer.selectionPointType = undefined;
    const wrapper = renderMap<GardenMap>(<GardenMap {...p} />);
    const allowed = wrapper.instance().interactions("Plant");
    expect(allowed).toBeTruthy();
  });

  it("allows interactions: box select", () => {
    mockMode = Mode.boxSelect;
    mockInteractionAllow = true;
    const p = fakeProps();
    p.designer.selectionPointType = undefined;
    const wrapper = renderMap<GardenMap>(<GardenMap {...p} />);
    const allowed = wrapper.instance().interactions("Plant");
    expect(allowed).toBeTruthy();
  });

  it("allows interactions: group edit", () => {
    mockMode = Mode.editGroup;
    mockInteractionAllow = true;
    const p = fakeProps();
    p.designer.selectionPointType = undefined;
    const wrapper = renderMap<GardenMap>(<GardenMap {...p} />);
    const allowed = wrapper.instance().interactions("Plant");
    expect(allowed).toBeTruthy();
  });

  it("disallows interactions: default", () => {
    mockMode = Mode.none;
    mockInteractionAllow = false;
    const p = fakeProps();
    p.designer.selectionPointType = undefined;
    const wrapper = renderMap<GardenMap>(<GardenMap {...p} />);
    const allowed = wrapper.instance().interactions("Plant");
    expect(allowed).toBeFalsy();
  });

  it("disallows interactions: box select", () => {
    mockMode = Mode.boxSelect;
    mockInteractionAllow = true;
    const p = fakeProps();
    p.designer.selectionPointType = ["Plant"];
    const wrapper = renderMap<GardenMap>(<GardenMap {...p} />);
    const allowed = wrapper.instance().interactions("Weed");
    expect(allowed).toBeFalsy();
  });

  it("gets group points", () => {
    mockGroup = fakePointGroup();
    mockGroup.body.point_ids = [1];
    const p = fakeProps();
    const point = fakePoint();
    point.body.id = 1;
    p.allPoints = [point];
    const wrapper = renderMap<GardenMap>(<GardenMap {...p} />);
    expect(wrapper.instance().pointsSelectedByGroup).toEqual([point]);
  });
});
