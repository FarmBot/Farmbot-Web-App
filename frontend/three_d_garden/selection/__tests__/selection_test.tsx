import React from "react";
import { fireEvent, render, waitFor } from "@testing-library/react";
import { clone } from "lodash";
import {
  fakeFbosConfig, fakePlant, fakePoint, fakeSequence, fakeTool,
  fakeToolSlot, fakeWeed, fakeSceneObject,
} from "../../../__test_support__/fake_state/resources";
import { fakeDevice } from "../../../__test_support__/resource_index_builder";
import { fakeMovementState } from "../../../__test_support__/fake_bot_data";
import { fakeTimeSettings } from "../../../__test_support__/fake_time_settings";
import { fakeDesignerState } from
  "../../../__test_support__/fake_designer_state";
import { INITIAL, INITIAL_POSITION } from "../../config";
import {
  ThreeDLocationSelection, ThreeDObjectSelection,
} from "../../selection_types";
import {
  createSelectionLookup, hoverSelectionFromDesigner, pathForThreeDSelection,
  pointTypeForSelectionKind, routeLocationSelectionFromPath,
  routeSelectionFromPath, selectionForUuid, selectionKindAllowed,
  uuidForSelection,
} from "../routes";
import {
  ObjectPopupControls, ObjectPopupDeleteButton, ObjectPopupHeaderColor,
  PopupObjectLocationRow, PopupSelectedLocationRow,
} from "../popup_controls";
import { LocationPopup, ObjectPopup } from "../popups";
import { SelectedObjectOverlay } from "../overlay";
import {
  ThreeDObjectSelectionLayer,
  clearPendingSelectionLayerAnimation,
} from "../layer";
import {
  ResolvedLocationObject, ResolvedThreeDObject,
  ResolveSelectedObjectProps, objectHasSelectionOverlay,
  resolveLocationObject, resolveSelectedObject,
} from "../resolve";
import { ThreeDObjectSelectionLayerProps } from "../props";
import * as toolSlotEditComponents from "../../../tools/tool_slot_edit_components";
import * as ui from "../../../ui";
import * as deviceActions from "../../../devices/actions";
import { SlotWithTool } from "../../../resources/interfaces";
import { Path } from "../../../internal_urls";
import {
  createRenderer,
  unmountRenderer,
} from "../../../__test_support__/test_renderer";

const layerProps = (): ThreeDObjectSelectionLayerProps => ({
  config: clone(INITIAL),
  configPosition: clone(INITIAL_POSITION),
  selection: undefined,
  popupSelection: undefined,
  locationSelection: undefined,
  selectedLocation: undefined,
  onClosePopup: jest.fn(),
  onOpenPanel: jest.fn(),
  onOpenLocationPanel: jest.fn(),
  onUpdateLocationSelection: jest.fn(),
  plants: [],
  points: [],
  weeds: [],
  toolSlots: [],
  tools: [],
  sequences: [],
  sensors: [],
  fbosConfig: undefined,
  timeSettings: fakeTimeSettings(),
  botOnline: true,
  arduinoBusy: false,
  currentBotLocation: { x: 10, y: 20, z: 30 },
  movementState: fakeMovementState(),
  defaultAxes: "XY",
  noUTM: false,
  deviceAccount: fakeDevice(),
  bot: undefined,
  env: {},
  dispatch: jest.fn(),
  gridLoaded: true,
  getZ: jest.fn(() => 5),
});

const resolveProps = (): ResolveSelectedObjectProps => {
  const plant = fakePlant();
  plant.body.id = 1;
  plant.body.name = undefined as never;
  plant.body.radius = 25;
  const point = fakePoint();
  point.body.id = 2;
  point.body.radius = 10;
  const weed = fakeWeed();
  weed.body.id = 3;
  weed.body.radius = 0;
  const tool = fakeTool();
  tool.body.id = 4;
  tool.body.name = "Seeder";
  const staticSlot = fakeToolSlot();
  staticSlot.body.id = 5;
  staticSlot.body.tool_id = tool.body.id;
  staticSlot.body.x = 100;
  staticSlot.body.y = 200;
  staticSlot.body.z = 30;
  const gantrySlot = fakeToolSlot();
  gantrySlot.body.id = 6;
  gantrySlot.body.tool_id = tool.body.id;
  gantrySlot.body.gantry_mounted = true;
  gantrySlot.body.x = 0;
  gantrySlot.body.y = 300;
  gantrySlot.body.z = 40;
  return {
    config: clone(INITIAL),
    configPosition: clone(INITIAL_POSITION),
    plants: [plant],
    points: [point],
    weeds: [weed],
    toolSlots: [
      { toolSlot: staticSlot, tool: undefined },
      { toolSlot: gantrySlot, tool },
    ],
    currentBotLocation: { x: 123, y: undefined, z: undefined },
    deviceAccount: fakeDevice({ name: "FarmBot Prime" }),
    getZ: jest.fn(() => 5),
  };
};

const objectBase = (
  selection: ThreeDObjectSelection,
) => ({
  selection,
  name: selection.kind,
  worldPosition: [1, 2, 3] as [number, number, number],
  popupPosition: [4, 5, 6] as [number, number, number],
  ringRadius: 35,
  locationCoordinate: { x: 10, y: 20, z: 30 },
});

const plantObject = (): ResolvedThreeDObject => {
  const plant = fakePlant();
  plant.body.id = 1;
  plant.body.planted_at = "2024-01-01T00:00:00.000Z";
  return {
    kind: "plant",
    plant,
    ...objectBase({ kind: "plant", id: 1 }),
  };
};

const pointObject = (): ResolvedThreeDObject => {
  const point = fakePoint();
  point.body.id = 2;
  return {
    kind: "point",
    point,
    ...objectBase({ kind: "point", id: 2 }),
  };
};

const weedObject = (): ResolvedThreeDObject => {
  const weed = fakeWeed();
  weed.body.id = 3;
  return {
    kind: "weed",
    weed,
    ...objectBase({ kind: "weed", id: 3 }),
  };
};

const slotObject = (
  gantryMounted = false,
): Extract<ResolvedThreeDObject, { kind: "slot" }> => {
  const tool = fakeTool();
  tool.body.id = 4;
  const toolSlot = fakeToolSlot();
  toolSlot.body.id = 5;
  toolSlot.body.tool_id = tool.body.id;
  toolSlot.body.gantry_mounted = gantryMounted;
  const slot: SlotWithTool = { toolSlot, tool };
  return {
    kind: "slot",
    slot,
    ...objectBase({ kind: "slot", id: 5 }),
  };
};

const locationObject = (): ResolvedLocationObject => ({
  kind: "location",
  selection: { kind: "location", x: 1, y: 2, z: 3 },
  name: "(1, 2, 3)",
  worldPosition: [1, 2, 3],
  popupPosition: [4, 5, 6],
  ringRadius: 35,
  locationCoordinate: { x: 1, y: 2, z: 3 },
});

const cameraObject = (): ResolvedThreeDObject => ({
  kind: "camera",
  ...objectBase({ kind: "camera", id: 0 }),
});

const blurable = (wrapper: ReturnType<typeof createRenderer>, name: string) =>
  wrapper.root.findAll(node =>
    node.props.name == name && typeof node.props.onCommit == "function")[0];

const commit = (
  wrapper: ReturnType<typeof createRenderer>,
  name: string,
  value: string,
) =>
  blurable(wrapper, name).props.onCommit({
    currentTarget: { value },
  });

describe("selection routes", () => {
  it("looks up point types for selection kinds", () => {
    expect(pointTypeForSelectionKind("plant")).toEqual("Plant");
    expect(pointTypeForSelectionKind("sceneObject")).toBeUndefined();
    expect(selectionKindAllowed("plant", undefined)).toBeTruthy();
    expect(selectionKindAllowed("point", ["Plant"])).toBeFalsy();
    expect(selectionKindAllowed("point", ["GenericPointer"])).toBeTruthy();
    expect(selectionKindAllowed("sceneObject", undefined)).toBeFalsy();
  });

  it("resolves selections from routes", () => {
    expect(routeSelectionFromPath("/app/designer/plants/1")).toEqual({
      kind: "plant",
      id: 1,
    });
    expect(routeSelectionFromPath("/app/designer/points/2")).toEqual({
      kind: "point",
      id: 2,
    });
    expect(routeSelectionFromPath("/app/designer/weeds/3")).toEqual({
      kind: "weed",
      id: 3,
    });
    expect(routeSelectionFromPath("/app/designer/tool-slots/4")).toEqual({
      kind: "slot",
      id: 4,
    });
    expect(routeSelectionFromPath("/app/designer/scene-objects/5")).toEqual({
      kind: "sceneObject",
      id: 5,
    });
    expect(routeSelectionFromPath("/app/controls")).toBeUndefined();
    expect(routeSelectionFromPath("/app/designer/plants/nope")).toBeUndefined();
    expect(routeSelectionFromPath("/app/designer/tools/1")).toBeUndefined();
  });

  it("resolves selected locations from routes", () => {
    expect(routeLocationSelectionFromPath(
      "/app/designer/location",
      "?x=1.5&y=2.5&z=3.5",
    )).toEqual({ kind: "location", x: 1.5, y: 2.5, z: 3.5 });
    expect(routeLocationSelectionFromPath(
      "/app/designer/location",
      "?x=1.5&y=2.5",
    )).toEqual({ kind: "location", x: 1.5, y: 2.5, z: 0 });
    expect(routeLocationSelectionFromPath(
      "/app/designer/plants/1",
      "?x=1&y=2",
    )).toBeUndefined();
    expect(routeLocationSelectionFromPath(
      "/app/designer/location",
      "?x=bad&y=2",
    )).toBeUndefined();
  });

  it("resolves hovered objects from designer state", () => {
    const plant = fakePlant();
    plant.body.id = 1;
    const point = fakePoint();
    point.body.id = 2;
    const weed = fakeWeed();
    weed.body.id = 3;
    const slot = fakeToolSlot();
    slot.body.id = 4;
    const sceneObject = fakeSceneObject();
    sceneObject.body.id = 1;
    const designer = fakeDesignerState();
    designer.hoveredPlant.plantUUID = plant.uuid;
    expect(hoverSelectionFromDesigner(
      designer, [plant], [point], [weed], [{ toolSlot: slot, tool: undefined }],
    )).toEqual({ kind: "plant", id: 1 });
    designer.hoveredPlant.plantUUID = undefined;
    designer.hoveredPlantListItem = plant.uuid;
    expect(hoverSelectionFromDesigner(designer, [plant], [], [], []))
      .toEqual({ kind: "plant", id: 1 });
    designer.hoveredPlantListItem = undefined;
    designer.hoveredPoint = point.uuid;
    expect(hoverSelectionFromDesigner(designer, [], [point], [weed], []))
      .toEqual({ kind: "point", id: 2 });
    designer.hoveredPoint = weed.uuid;
    expect(hoverSelectionFromDesigner(designer, [], [point], [weed], []))
      .toEqual({ kind: "weed", id: 3 });
    designer.hoveredPoint = undefined;
    designer.hoveredToolSlot = slot.uuid;
    expect(hoverSelectionFromDesigner(
      designer, [], [], [], [{ toolSlot: slot, tool: undefined }],
    )).toEqual({ kind: "slot", id: 4 });
    designer.hoveredToolSlot = undefined;
    designer.hoveredSceneObject = sceneObject.uuid;
    expect(hoverSelectionFromDesigner(
      designer, [], [], [], [], [sceneObject],
    )).toEqual({ kind: "sceneObject", id: 1 });
    designer.hoveredSceneObject = undefined;
    slot.body.id = undefined;
    expect(hoverSelectionFromDesigner(
      designer, [], [], [], [{ toolSlot: slot, tool: undefined }],
    )).toBeUndefined();
  });

  it("creates selection lookup maps", () => {
    const plant = fakePlant();
    plant.body.id = 1;
    const point = fakePoint();
    point.body.id = 2;
    const weed = fakeWeed();
    weed.body.id = 3;
    const slot = fakeToolSlot();
    slot.body.id = 4;
    const sceneObject = fakeSceneObject({ id: 5 });

    const lookup = createSelectionLookup({
      plants: [plant],
      points: [point],
      weeds: [weed],
      toolSlots: [{ toolSlot: slot, tool: undefined }],
      sceneObjects: [sceneObject],
    });

    expect(uuidForSelection(lookup, { kind: "plant", id: 1 }))
      .toEqual(plant.uuid);
    expect(selectionForUuid(lookup, sceneObject.uuid))
      .toEqual({ kind: "sceneObject", id: 5 });
  });

  it("builds paths", () => {
    expect(pathForThreeDSelection({ kind: "plant", id: 1 }))
      .toEqual(Path.plants(1));
    expect(pathForThreeDSelection({ kind: "point", id: 2 }))
      .toEqual(Path.points(2));
    expect(pathForThreeDSelection({ kind: "weed", id: 3 }))
      .toEqual(Path.weeds(3));
    expect(pathForThreeDSelection({ kind: "slot", id: 4 }))
      .toEqual(Path.toolSlots(4));
    expect(pathForThreeDSelection({ kind: "utm", id: 0 }))
      .toEqual(Path.tools());
    expect(pathForThreeDSelection({ kind: "electronics", id: 0 }))
      .toEqual(Path.settings("farmbot"));
    expect(pathForThreeDSelection({ kind: "camera", id: 0 }))
      .toEqual(Path.photos());
    expect(pathForThreeDSelection({ kind: "sceneObject", id: 5 }))
      .toEqual(Path.sceneObjects(5));
  });
});

describe("selection resolve", () => {
  it("skips missing selected objects", () => {
    const props = resolveProps();
    expect(resolveSelectedObject(props, undefined)).toBeUndefined();
    expect(resolveSelectedObject(props, { kind: "plant", id: 999 }))
      .toBeUndefined();
    expect(resolveSelectedObject(props, { kind: "point", id: 999 }))
      .toBeUndefined();
    expect(resolveSelectedObject(props, { kind: "weed", id: 999 }))
      .toBeUndefined();
    expect(resolveSelectedObject(props, { kind: "slot", id: 999 }))
      .toBeUndefined();
  });

  it("resolves plant, point, and weed selections", () => {
    const props = resolveProps();
    const plant = resolveSelectedObject(props, { kind: "plant", id: 1 });
    expect(plant?.kind).toEqual("plant");
    expect(plant?.name).toEqual("Plant 1");
    expect(plant?.ringRadius).toEqual(35);
    expect(plant?.locationCoordinate).toEqual({ x: 100, y: 200, z: 0 });

    const point = resolveSelectedObject(props, { kind: "point", id: 2 });
    expect(point?.kind).toEqual("point");
    expect(point?.ringRadius).toEqual(35);

    const weed = resolveSelectedObject(props, { kind: "weed", id: 3 });
    expect(weed?.kind).toEqual("weed");
    expect(weed?.ringRadius).toEqual(50);
  });

  it("resolves slot, UTM, electronics, and camera selections", () => {
    const props = resolveProps();
    const staticSlot = resolveSelectedObject(props, { kind: "slot", id: 5 });
    expect(staticSlot?.kind).toEqual("slot");
    expect(staticSlot?.name).toEqual("Empty slot");
    expect(staticSlot?.locationCoordinate.x).toEqual(100);

    const gantrySlot = resolveSelectedObject(props, { kind: "slot", id: 6 });
    expect(gantrySlot?.kind).toEqual("slot");
    expect(gantrySlot?.name).toEqual("Seeder");
    expect(gantrySlot?.locationCoordinate.x).toEqual(123);

    const utm = resolveSelectedObject(props, { kind: "utm", id: 0 });
    expect(utm?.kind).toEqual("utm");
    expect(utm?.locationCoordinate).toEqual({
      x: props.configPosition.x,
      y: props.configPosition.y,
      z: props.configPosition.z,
    });

    const electronics =
      resolveSelectedObject(props, { kind: "electronics", id: 0 });
    expect(electronics?.kind).toEqual("electronics");
    expect(electronics?.name).toEqual("FarmBot Prime");

    const camera = resolveSelectedObject(props, { kind: "camera", id: 0 });
    expect(camera?.kind).toEqual("camera");
    expect(camera?.name).toEqual("Camera");
  });

  it("resolves the v1.9 camera from the cross-slide anchor", () => {
    const props = resolveProps();
    const camera = resolveSelectedObject(props, { kind: "camera", id: 0 });
    expect(camera?.worldPosition).toEqual([-1150, 39, 589.5]);
    expect(camera?.locationCoordinate).toEqual({ x: 200, y: 699, z: -200 });
  });

  it("resolves selected locations and overlay eligibility", () => {
    const props = resolveProps();
    const selection: ThreeDLocationSelection = {
      kind: "location",
      x: 1.2,
      y: 2.8,
      z: 3.4,
    };
    const location = resolveLocationObject(props, selection);
    expect(resolveLocationObject(props, undefined)).toBeUndefined();
    expect(location?.name).toEqual("(1, 3, 3)");
    expect(location?.locationCoordinate).toEqual({
      x: selection.x,
      y: selection.y,
      z: selection.z,
    });
    expect(objectHasSelectionOverlay(undefined)).toBeFalsy();
    expect(objectHasSelectionOverlay(location)).toBeTruthy();
    expect(objectHasSelectionOverlay(
      resolveSelectedObject(props, { kind: "utm", id: 0 }),
    )).toBeFalsy();
    expect(objectHasSelectionOverlay(
      resolveSelectedObject(props, { kind: "electronics", id: 0 }),
    )).toBeFalsy();
    expect(objectHasSelectionOverlay(
      resolveSelectedObject(props, { kind: "camera", id: 0 }),
    )).toBeFalsy();
  });
});

describe("selection overlay and popups", () => {
  it("renders selected object overlays", () => {
    const refSpy = jest.spyOn(React, "useRef")
      .mockReturnValue({ current: { rotation: { z: 0 } } });
    const visible = render(<SelectedObjectOverlay
      object={plantObject()}
      config={clone(INITIAL)}
      showCrosshairs={true} />);
    expect(visible.container).toContainHTML("selected-object-overlay");
    expect(visible.container).toContainHTML("selected-object-ring");
    expect(visible.container).toContainHTML("selected-object-x-crosshair");
    expect(visible.container).toContainHTML("selected-object-y-crosshair");
    visible.unmount();
    refSpy.mockRestore();
    const hidden = render(<SelectedObjectOverlay
      object={plantObject()}
      config={clone(INITIAL)}
      showCrosshairs={false} />);
    expect(hidden.container).not.toContainHTML("selected-object-x-crosshair");
  });

  it("handles object popup actions", () => {
    const p = layerProps();
    const object = {
      kind: "utm" as const,
      ...objectBase({ kind: "utm", id: 0 }),
    };
    const { container } = render(<ObjectPopup
      {...p}
      object={object}
      visible={true} />);
    const popup = container.querySelector(".three-d-object-popup");
    popup && fireEvent.pointerDown(popup);
    popup && fireEvent.contextMenu(popup);
    popup && fireEvent.click(popup);
    const buttons = container.querySelectorAll("button");
    fireEvent.click(buttons[0]);
    fireEvent.click(buttons[1]);
    expect(p.onOpenPanel).toHaveBeenCalledWith({ kind: "utm", id: 0 });
    expect(p.onClosePopup).toHaveBeenCalled();
  });

  it("handles location popup actions", () => {
    const p = layerProps();
    const { container } = render(<LocationPopup
      {...p}
      object={locationObject()}
      visible={false} />);
    expect(container.querySelector(".three-d-object-popup")?.className)
      .toContain("hidden");
    const buttons = container.querySelectorAll("button");
    fireEvent.click(buttons[0]);
    fireEvent.click(buttons[1]);
    expect(p.onOpenLocationPanel).toHaveBeenCalledWith({
      kind: "location",
      x: 1,
      y: 2,
      z: 3,
    });
    expect(p.onClosePopup).toHaveBeenCalled();
  });

  it("animates selection layer popup state", async () => {
    const p = layerProps();
    const plant = fakePlant();
    plant.body.id = 1;
    p.plants = [plant];
    const { container, rerender } = render(<ThreeDObjectSelectionLayer {...p} />);
    expect(container).not.toContainHTML("selected-object-popup");
    rerender(<ThreeDObjectSelectionLayer
      {...p}
      popupSelection={{ kind: "plant", id: 1 }} />);
    await waitFor(() =>
      expect(container).toContainHTML("three-d-object-popup"));
    const point = fakePoint();
    point.body.id = 2;
    rerender(<ThreeDObjectSelectionLayer
      {...p}
      plants={[plant]}
      points={[point]}
      popupSelection={{ kind: "point", id: 2 }} />);
    await waitFor(() =>
      expect(container).toContainHTML("Point 1"));
    rerender(<ThreeDObjectSelectionLayer {...p} />);
    await waitFor(() =>
      expect(container).not.toContainHTML("three-d-object-popup"));
  });

  it("clears pending selection layer animation work", () => {
    const clearTimeoutSpy = jest.spyOn(window, "clearTimeout");
    const cancelFrameSpy = jest.spyOn(window, "cancelAnimationFrame")
      .mockImplementation(jest.fn());
    clearPendingSelectionLayerAnimation([1], [2]);
    expect(clearTimeoutSpy).toHaveBeenCalledWith(1);
    expect(cancelFrameSpy).toHaveBeenCalledWith(2);
    clearTimeoutSpy.mockRestore();
    cancelFrameSpy.mockRestore();
  });

});

describe("selection popup controls", () => {
  const renderLocationRow = (object: ResolvedThreeDObject) => {
    const p = layerProps();
    p.dispatch = jest.fn();
    const wrapper = createRenderer(<PopupObjectLocationRow
      {...p}
      object={object} />);
    return { p, wrapper };
  };

  it("updates object coordinates", () => {
    [
      plantObject(),
      pointObject(),
      weedObject(),
      slotObject(),
    ].forEach(object => {
      const { p, wrapper } = renderLocationRow(object);
      commit(wrapper, "x", "123");
      expect(p.dispatch).toHaveBeenCalled();
      unmountRenderer(wrapper);
    });
  });

  it("disables object coordinate edits without dispatch and for gantry slots", () => {
    const p = layerProps();
    p.dispatch = undefined;
    let wrapper = createRenderer(<PopupObjectLocationRow
      {...p}
      object={plantObject()} />);
    expect(wrapper.root.findAll(node => node.type == "input" &&
      node.props.disabled).length).toEqual(3);
    unmountRenderer(wrapper);
    p.dispatch = jest.fn();
    wrapper = createRenderer(<PopupObjectLocationRow
      {...p}
      object={slotObject(true)} />);
    expect(wrapper.root.findAll(node => node.type == "input" &&
      node.props.name == "x" && node.props.disabled).length).toEqual(1);
    unmountRenderer(wrapper);
  });

  it("updates selected location coordinates", () => {
    const p = layerProps();
    const wrapper = createRenderer(<PopupSelectedLocationRow
      {...p}
      object={locationObject()} />);
    commit(wrapper, "z", "45.6");
    expect(p.onUpdateLocationSelection).toHaveBeenCalledWith({
      kind: "location",
      x: 1,
      y: 2,
      z: 45,
    });
    unmountRenderer(wrapper);
  });

  it("renders plant, point, weed, slot, and camera controls", () => {
    [
      plantObject(),
      pointObject(),
      weedObject(),
      slotObject(),
      cameraObject(),
    ].forEach(object => {
      const p = layerProps();
      const { container, unmount } = render(<ObjectPopupControls
        {...p}
        object={object} />);
      expect(container).not.toBeEmptyDOMElement();
      unmount();
    });
  });

  it("updates plant values", () => {
    const p = layerProps();
    const controls = render(<ObjectPopupControls
      {...p}
      object={plantObject()} />);
    const radius = controls.container.querySelector("input[name='radius']");
    expect(radius).toBeTruthy();
    radius && fireEvent.focus(radius);
    radius && fireEvent.change(radius, {
      target: { value: "42" },
      currentTarget: { value: "42" },
    });
    radius && fireEvent.blur(radius, {
      target: { value: "42" },
      currentTarget: { value: "42" },
    });
    expect(p.dispatch).toHaveBeenCalled();
    controls.unmount();
  });

  it("updates slot and mounted tool selections", () => {
    const p = layerProps();
    const tool = fakeTool();
    tool.body.id = 4;
    p.tools = [tool];
    p.toolSlots = [slotObject().slot];
    let controls = render(<ObjectPopupControls
      {...p}
      object={slotObject()} />);
    expect(controls.container).not.toBeEmptyDOMElement();
    controls.unmount();

    p.dispatch = jest.fn();
    p.deviceAccount = fakeDevice({ mounted_tool_id: undefined });
    controls = render(<ObjectPopupControls
      {...p}
      object={{
        kind: "utm",
        ...objectBase({ kind: "utm", id: 0 }),
      }} />);
    const trailToggle = controls.container
      .querySelector(".fb-toggle-button");
    trailToggle && fireEvent.click(trailToggle);
    expect(p.dispatch).toHaveBeenCalled();
    controls.unmount();

    const toolSelectionSpy =
      jest.spyOn(toolSlotEditComponents, "ToolSelection")
        .mockImplementation(((props: React.ComponentProps<
          typeof toolSlotEditComponents.ToolSelection
        >) => {
          props.isActive(4);
          return <button
            data-testid={"tool-selection"}
            onClick={() => props.onChange({ tool_id: 4 })} />;
        }));

    p.dispatch = undefined;
    controls = render(<ObjectPopupControls
      {...p}
      object={{
        kind: "utm",
        ...objectBase({ kind: "utm", id: 0 }),
      }} />);
    const toolButton = controls.container.querySelector("[data-testid='tool-selection']");
    toolButton && fireEvent.click(toolButton);
    expect(toolButton).toBeTruthy();
    controls.unmount();
    toolSelectionSpy.mockRestore();
  });

  it("uses camera controls", () => {
    const takePhotoSpy = jest.spyOn(deviceActions, "takePhoto")
      .mockImplementation(jest.fn());
    const p = layerProps();
    p.config.cameraView = false;
    const controls = render(<ObjectPopupControls
      {...p}
      object={cameraObject()} />);
    const takePhotoButton = controls.container
      .querySelector("button[title='Take a photo']");
    const cameraViewToggle = controls.container
      .querySelector(".fb-toggle-button");
    takePhotoButton && fireEvent.click(takePhotoButton);
    cameraViewToggle && fireEvent.click(cameraViewToggle);
    expect(takePhotoSpy).toHaveBeenCalled();
    expect(p.dispatch).toHaveBeenCalled();
    controls.unmount();

    p.env = { camera: "NONE" };
    const disabledControls = render(<ObjectPopupControls
      {...p}
      object={cameraObject()} />);
    const disabledTakePhotoButton = disabledControls.container
      .querySelector("button.pseudo-disabled");
    disabledTakePhotoButton && fireEvent.click(disabledTakePhotoButton);
    expect(takePhotoSpy).toHaveBeenCalledTimes(1);
    disabledControls.unmount();
    takePhotoSpy.mockRestore();
  });

  it("updates mounted tool selection", () => {
    const toolSelectionSpy =
      jest.spyOn(toolSlotEditComponents, "ToolSelection")
        .mockImplementation(((props: React.ComponentProps<
          typeof toolSlotEditComponents.ToolSelection
        >) =>
          <button
            data-testid={"tool-selection"}
            onClick={() => props.onChange({ tool_id: 4 })} />));
    const p = layerProps();
    p.dispatch = jest.fn();
    p.deviceAccount = fakeDevice({ mounted_tool_id: undefined });
    const tool = fakeTool();
    tool.body.id = 4;
    p.tools = [tool];
    const controls = render(<ObjectPopupControls
      {...p}
      object={{
        kind: "utm",
        ...objectBase({ kind: "utm", id: 0 }),
      }} />);
    const toolButton = controls.container.querySelector("[data-testid='tool-selection']");
    toolButton && fireEvent.click(toolButton);
    expect(p.dispatch).toHaveBeenCalled();
    controls.unmount();
    toolSelectionSpy.mockRestore();
  });

  it("updates slot tool selection", () => {
    const toolInputSpy =
      jest.spyOn(toolSlotEditComponents, "ToolInputRow")
        .mockImplementation(((props: React.ComponentProps<
          typeof toolSlotEditComponents.ToolInputRow
        >) => {
          props.isActive(4);
          return <button
            data-testid={"slot-tool-input"}
            onClick={() => props.onChange({ tool_id: 4 })} />;
        }));
    const p = layerProps();
    p.dispatch = jest.fn();
    const controls = render(<ObjectPopupControls
      {...p}
      object={slotObject()} />);
    const button = controls.container.querySelector("[data-testid='slot-tool-input']");
    button && fireEvent.click(button);
    expect(p.dispatch).toHaveBeenCalled();
    controls.unmount();
    toolInputSpy.mockRestore();
  });

  it("renders electronics controls and boot sequence selector states", () => {
    const p = layerProps();
    p.fbosConfig = fakeFbosConfig();
    p.sequences = [fakeSequence({ id: 7, name: "Boot" })];
    let controls = render(<ObjectPopupControls
      {...p}
      object={{
        kind: "electronics",
        ...objectBase({ kind: "electronics", id: 0 }),
      }} />);
    expect(controls.container).toContainHTML("BOOT SEQUENCE");
    controls.unmount();

    p.dispatch = undefined;
    controls = render(<ObjectPopupControls
      {...p}
      object={{
        kind: "electronics",
        ...objectBase({ kind: "electronics", id: 0 }),
      }} />);
    expect(controls.container).toContainHTML("Unavailable");
    controls.unmount();
  });

  it("updates boot sequence selection", () => {
    const fbSelectSpy = jest.spyOn(ui, "FBSelect")
      .mockImplementation(((props: ui.FBSelectProps) =>
        <button
          data-testid={"fb-select"}
          onClick={() => {
            props.onChange({ label: "Boot", value: 7 });
            props.onChange({ label: "None", value: "", isNull: true });
          }} />) as never);
    const p = layerProps();
    p.fbosConfig = fakeFbosConfig();
    p.dispatch = jest.fn();
    p.sequences = [fakeSequence({ id: 7, name: "Boot" })];
    const controls = render(<ObjectPopupControls
      {...p}
      object={{
        kind: "electronics",
        ...objectBase({ kind: "electronics", id: 0 }),
      }} />);
    const select = controls.container.querySelector("[data-testid='fb-select']");
    select && fireEvent.click(select);
    expect(p.dispatch).toHaveBeenCalled();
    controls.unmount();
    fbSelectSpy.mockRestore();
  });

  it("renders header color and delete buttons for supported objects", () => {
    const popoverSpy = jest.spyOn(ui, "Popover")
      .mockImplementation(({ target, content }: ui.PopoverProps) =>
        <div>{target}{content}</div>);
    try {
      [pointObject(), weedObject()].forEach(object => {
        const p = layerProps();
        const wrapper = createRenderer(<ObjectPopupHeaderColor
          {...p}
          object={object} />);
        expect(wrapper.toJSON()).toBeTruthy();
        unmountRenderer(wrapper);
      });
      expect(createRenderer(<ObjectPopupHeaderColor
        {...layerProps()}
        dispatch={undefined}
        object={pointObject()} />).toJSON()).toBeNull();
    } finally {
      popoverSpy.mockRestore();
    }

    [
      plantObject(),
      pointObject(),
      weedObject(),
      slotObject(),
    ].forEach(object => {
      const p = layerProps();
      const wrapper = createRenderer(<ObjectPopupDeleteButton
        {...p}
        object={object} />);
      wrapper.root.findByType("button").props.onClick();
      expect(p.dispatch).toHaveBeenCalled();
      expect(p.onClosePopup).toHaveBeenCalled();
      unmountRenderer(wrapper);
    });
    expect(createRenderer(<ObjectPopupDeleteButton
      {...layerProps()}
      object={{
        kind: "utm",
        ...objectBase({ kind: "utm", id: 0 }),
      }} />).toJSON()).toBeNull();
    expect(createRenderer(<ObjectPopupDeleteButton
      {...layerProps()}
      object={cameraObject()} />).toJSON()).toBeNull();
  });

  it("skips controls for mismatched object kinds without dispatch", () => {
    const p = layerProps();
    p.dispatch = undefined;
    [plantObject(), pointObject(), weedObject(), slotObject()].forEach(object => {
      const wrapper = createRenderer(<ObjectPopupControls
        {...p}
        object={object} />);
      expect(wrapper.toJSON()).toBeNull();
      unmountRenderer(wrapper);
    });
  });
});
