const lodash = require("lodash");
lodash.debounce = jest.fn(x => x);

jest.mock("../actions", () => ({
  unselectPlant: jest.fn(() => jest.fn()),
  closePlantInfo: jest.fn(() => jest.fn()),
}));

import { Mode } from "../interfaces";
let mockMode = Mode.none;
let mockAtPlant = true;
let mockInteractionAllow = true;
jest.mock("../util", () => ({
  getMode: () => mockMode,
  getMapSize: () => ({ h: 100, w: 100 }),
  getGardenCoordinates: jest.fn(() => ({ x: 100, y: 200 })),
  transformXY: jest.fn(() => ({ qx: 0, qy: 0 })),
  transformForQuadrant: jest.fn(),
  round: jest.fn(),
  cursorAtPlant: () => mockAtPlant,
  allowInteraction: () => mockInteractionAllow,
  allowGroupAreaInteraction: jest.fn(),
  scaleIcon: jest.fn(),
}));

jest.mock("../layers/plants/plant_actions", () => ({
  dragPlant: jest.fn(),
  dropPlant: jest.fn(),
  beginPlantDrag: jest.fn(),
  maybeSavePlantLocation: jest.fn(),
  jogPoints: jest.fn(),
  savePoints: jest.fn(),
}));

jest.mock("../drawn_point/drawn_point_actions", () => ({
  startNewPoint: jest.fn(),
  resizePoint: jest.fn(),
}));

jest.mock("../background/selection_box_actions", () => ({
  startNewSelectionBox: jest.fn(),
  resizeBox: jest.fn(),
  maybeUpdateGroup: jest.fn(),
}));

jest.mock("../../move_to", () => ({
  chooseLocation: jest.fn(),
}));

jest.mock("../profile", () => ({
  chooseProfile: jest.fn(),
  ProfileLine: () => <g />,
}));

let mockGroup: TaggedPointGroup | undefined = undefined;
jest.mock("../../../point_groups/group_detail", () => ({
  findGroupFromUrl: () => mockGroup,
}));

import React from "react";
import { GardenMap } from "../garden_map";
import { shallow, mount } from "enzyme";
import { GardenMapProps } from "../../interfaces";
import { setEggStatus, EggKeys } from "../easter_eggs/status";
import { unselectPlant, closePlantInfo } from "../actions";
import {
  dropPlant, beginPlantDrag, maybeSavePlantLocation, dragPlant, jogPoints,
  savePoints,
} from "../layers/plants/plant_actions";
import {
  startNewSelectionBox, resizeBox, maybeUpdateGroup,
} from "../background/selection_box_actions";
import { getGardenCoordinates } from "../util";
import { chooseLocation } from "../../move_to";
import { startNewPoint, resizePoint } from "../drawn_point/drawn_point_actions";
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
import { chooseProfile } from "../profile";
import {
  fakeMapTransformProps,
} from "../../../__test_support__/map_transform_props";
import { keyboardEvent } from "../../../__test_support__/fake_html_events";
import { times } from "lodash";
import { Path } from "../../../internal_urls";
import { mountWithContext } from "../../../__test_support__/mount_with_context";

const DEFAULT_EVENT = { preventDefault: jest.fn(), pageX: NaN, pageY: NaN };

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
  it("drops plant", () => {
    mockMode = Mode.clickToAdd;
    const wrapper = shallow(<GardenMap {...fakeProps()} />);
    wrapper.find(".drop-area-svg").simulate("click", DEFAULT_EVENT);
    expect(dropPlant).toHaveBeenCalled();
  });

  it("moves plant left", () => {
    mockMode = Mode.editPlant;
    mount(<GardenMap {...fakeProps()} />);
    const e = keyboardEvent("ArrowDown");
    document.onkeydown?.(e as never);
    expect(jogPoints).toHaveBeenCalled();
    expect(e.preventDefault).toHaveBeenCalled();
  });

  it("doesn't move plant left", () => {
    mockMode = Mode.editPlant;
    mount(<GardenMap {...fakeProps()} />);
    const e = keyboardEvent("Enter");
    document.onkeydown?.(e as never);
    expect(jogPoints).not.toHaveBeenCalled();
    expect(e.preventDefault).not.toHaveBeenCalled();
  });

  it("saves plant", () => {
    mockMode = Mode.editPlant;
    const p = fakeProps();
    const point = fakePoint();
    p.designer.selectedPoints = [point.uuid];
    p.allPoints = [point];
    mount(<GardenMap {...p} />);
    const e = keyboardEvent("ArrowDown");
    document.onkeyup?.(e as never);
    expect(savePoints).toHaveBeenCalled();
    expect(e.preventDefault).toHaveBeenCalled();
  });

  it("doesn't save plant", () => {
    mockMode = Mode.editPlant;
    mount(<GardenMap {...fakeProps()} />);
    const e = keyboardEvent("Enter");
    document.onkeyup?.(e as never);
    expect(savePoints).not.toHaveBeenCalled();
    expect(e.preventDefault).not.toHaveBeenCalled();
  });

  it("doesn't animate", () => {
    mockMode = Mode.editPlant;
    mockGroup = fakePointGroup();
    mockGroup.body.criteria.string_eq = { pointer_type: ["Plant"] };
    const p = fakeProps();
    p.getConfigValue = () => false;
    const wrapper = mount<GardenMap>(<GardenMap {...p} />);
    expect(wrapper.instance().animate).toBeTruthy();
    p.allPoints = times(101, fakePlant);
    wrapper.setProps(p);
    expect(wrapper.instance().animate).toBeFalsy();
  });

  it("starts drag: move plant", () => {
    mockMode = Mode.editPlant;
    const wrapper = shallow(<GardenMap {...fakeProps()} />);
    mockAtPlant = true;
    wrapper.find(".drop-area-svg").simulate("mouseDown", DEFAULT_EVENT);
    expect(beginPlantDrag).toHaveBeenCalled();
    expect(startNewSelectionBox).not.toHaveBeenCalled();
  });

  it("starts drag: draw box", () => {
    mockMode = Mode.editPlant;
    const wrapper = shallow(<GardenMap {...fakeProps()} />);
    mockAtPlant = false;
    wrapper.find(".drop-area-svg").simulate("mouseDown", DEFAULT_EVENT);
    expect(beginPlantDrag).not.toHaveBeenCalled();
    expect(startNewSelectionBox).toHaveBeenCalled();
  });

  it("ends drag", () => {
    mockMode = Mode.editPlant;
    const wrapper = shallow<GardenMap>(<GardenMap {...fakeProps()} />);
    wrapper.setState({ isDragging: true });
    wrapper.find(".drop-area-svg").simulate("mouseUp", DEFAULT_EVENT);
    expect(maybeSavePlantLocation).toHaveBeenCalled();
    expect(maybeUpdateGroup).toHaveBeenCalled();
    expect(wrapper.instance().state.isDragging).toBeFalsy();
  });

  it("drags: editing", () => {
    mockMode = Mode.editPlant;
    const wrapper = shallow(<GardenMap {...fakeProps()} />);
    wrapper.find(".drop-area-svg").simulate("mouseMove", DEFAULT_EVENT);
    expect(dragPlant).toHaveBeenCalled();
  });

  it("starts drag on background: selecting", () => {
    mockMode = Mode.addPlant;
    const p = fakeProps();
    p.designer.selectedPoints = ["fakePointUuid"];
    const wrapper = mountWithContext(<GardenMap {...p} />);
    const e = { pageX: 1000, pageY: 2000 };
    wrapper.find(".drop-area-background").simulate("mouseDown", e);
    expect(startNewSelectionBox).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith(Path.plants());
    expect(getGardenCoordinates).toHaveBeenCalledWith(
      expect.objectContaining(e));
  });

  it("starts drag on background: selecting again", () => {
    mockMode = Mode.boxSelect;
    const wrapper = mountWithContext(<GardenMap {...fakeProps()} />);
    const e = { pageX: 1000, pageY: 2000 };
    wrapper.find(".drop-area-background").simulate("mouseDown", e);
    expect(startNewSelectionBox).toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
    expect(getGardenCoordinates).toHaveBeenCalledWith(
      expect.objectContaining(e));
  });

  it("starts drag on background: does nothing when adding plants", () => {
    mockMode = Mode.clickToAdd;
    const wrapper = mountWithContext(<GardenMap {...fakeProps()} />);
    const e = { pageX: 1000, pageY: 2000 };
    wrapper.find(".drop-area-background").simulate("mouseDown", e);
    expect(startNewSelectionBox).not.toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
    expect(getGardenCoordinates).not.toHaveBeenCalled();
  });

  it("starts drag on background: does nothing when in move mode", () => {
    mockMode = Mode.locationInfo;
    const wrapper = mountWithContext(<GardenMap {...fakeProps()} />);
    const e = { pageX: 1000, pageY: 2000 };
    wrapper.find(".drop-area-background").simulate("mouseDown", e);
    expect(startNewSelectionBox).not.toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
    expect(getGardenCoordinates).not.toHaveBeenCalled();
  });

  it("starts drag on background: does nothing when in profile mode", () => {
    mockMode = Mode.profile;
    const wrapper = mountWithContext(<GardenMap {...fakeProps()} />);
    const e = { pageX: 1000, pageY: 2000 };
    wrapper.find(".drop-area-background").simulate("mouseDown", e);
    expect(startNewSelectionBox).not.toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
    expect(getGardenCoordinates).not.toHaveBeenCalled();
  });

  it("starts drag on background: creating points", () => {
    mockMode = Mode.createPoint;
    const wrapper = mountWithContext(<GardenMap {...fakeProps()} />);
    const e = { pageX: 1000, pageY: 2000 };
    wrapper.find(".drop-area-background").simulate("mouseDown", e);
    expect(startNewPoint).toHaveBeenCalled();
    expect(startNewSelectionBox).not.toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
    expect(getGardenCoordinates).toHaveBeenCalledWith(
      expect.objectContaining(e));
  });

  it("starts drag on background: creating weeds", () => {
    mockMode = Mode.createWeed;
    const wrapper = mountWithContext(<GardenMap {...fakeProps()} />);
    const e = { pageX: 1000, pageY: 2000 };
    wrapper.find(".drop-area-background").simulate("mouseDown", e);
    expect(startNewPoint).toHaveBeenCalled();
    expect(startNewSelectionBox).not.toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
    expect(getGardenCoordinates).toHaveBeenCalledWith(
      expect.objectContaining(e));
  });

  it("starts drag on background: selecting zone", () => {
    mockMode = Mode.editGroup;
    const p = fakeProps();
    p.designer.editGroupAreaInMap = true;
    const wrapper = mountWithContext(<GardenMap {...p} />);
    const e = { pageX: 1000, pageY: 2000 };
    wrapper.find(".drop-area-background").simulate("mouseDown", e);
    expect(startNewSelectionBox).toHaveBeenCalledWith(
      expect.objectContaining({ plantActions: false }));
    expect(mockNavigate).not.toHaveBeenCalled();
    expect(getGardenCoordinates).toHaveBeenCalledWith(
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
    const wrapper = mount<GardenMap>(<GardenMap {...p} />);
    const e = { pageX: 1000, pageY: 2000 } as React.DragEvent<SVGElement>;
    wrapper.instance().startDragOnBackground(e);
    wrapper.find(".drop-area-background").simulate("mouseDown", e);
    expect(startNewSelectionBox).toHaveBeenCalled();
    expect(getGardenCoordinates).toHaveBeenCalledWith(
      expect.objectContaining(e));
    wrapper.update();
    expect(wrapper.state().toLocation).toEqual({ x: 100, y: 200, z: 0 });
  });

  it("starts drag: click-to-add mode", () => {
    mockMode = Mode.clickToAdd;
    const wrapper = shallow(<GardenMap {...fakeProps()} />);
    const e = { pageX: 1000, pageY: 2000 };
    wrapper.find(".drop-area-svg").simulate("mouseDown", e);
    expect(beginPlantDrag).not.toHaveBeenCalled();
    expect(getGardenCoordinates).not.toHaveBeenCalled();
  });

  it("drags: selecting", () => {
    mockMode = Mode.boxSelect;
    const wrapper = shallow(<GardenMap {...fakeProps()} />);
    const e = { pageX: 2000, pageY: 2000 };
    wrapper.find(".drop-area-svg").simulate("mouseMove", e);
    expect(resizeBox).toHaveBeenCalled();
    expect(getGardenCoordinates).toHaveBeenCalledWith(
      expect.objectContaining(e));
  });

  it("drags: selecting zone", () => {
    mockMode = Mode.editGroup;
    const p = fakeProps();
    p.designer.editGroupAreaInMap = true;
    const wrapper = shallow(<GardenMap {...p} />);
    const e = { pageX: 2000, pageY: 2000 };
    wrapper.find(".drop-area-svg").simulate("mouseMove", e);
    expect(resizeBox).toHaveBeenCalledWith(
      expect.objectContaining({ plantActions: false }));
    expect(getGardenCoordinates).toHaveBeenCalledWith(
      expect.objectContaining(e));
  });

  it("selects location", () => {
    mockMode = Mode.locationInfo;
    const wrapper = shallow(<GardenMap {...fakeProps()} />);
    wrapper.find(".drop-area-svg").simulate("click", {
      pageX: 1000, pageY: 2000, preventDefault: jest.fn()
    });
    expect(chooseLocation).toHaveBeenCalled();
    expect(getGardenCoordinates).toHaveBeenCalledWith(
      expect.objectContaining({ pageX: 1000, pageY: 2000 }));
  });

  it("selects profile location", () => {
    mockMode = Mode.profile;
    const wrapper = shallow(<GardenMap {...fakeProps()} />);
    wrapper.find(".drop-area-svg").simulate("click", {
      pageX: 1000, pageY: 2000, preventDefault: jest.fn()
    });
    expect(chooseProfile).toHaveBeenCalled();
    expect(getGardenCoordinates).toHaveBeenCalledWith(
      expect.objectContaining({ pageX: 1000, pageY: 2000 }));
  });

  it("starts drawing point", () => {
    mockMode = Mode.createPoint;
    const wrapper = shallow(<GardenMap {...fakeProps()} />);
    wrapper.find(".drop-area-svg").simulate("mouseDown", {
      pageX: 1, pageY: 2
    });
    expect(startNewPoint).toHaveBeenCalledWith(expect.objectContaining({
      gardenCoords: { x: 100, y: 200 },
    }));
    expect(getGardenCoordinates).toHaveBeenCalledWith(
      expect.objectContaining({ pageX: 1, pageY: 2 }));
  });

  it("sets drawn point radius", () => {
    mockMode = Mode.createPoint;
    const wrapper = shallow(<GardenMap {...fakeProps()} />);
    wrapper.find(".drop-area-svg").simulate("mouseMove", {
      pageX: 10, pageY: 20
    });
    expect(resizePoint).toHaveBeenCalledWith(expect.objectContaining({
      gardenCoords: { x: 100, y: 200 },
    }));
  });

  it("sets drawn weed radius", () => {
    mockMode = Mode.createWeed;
    const wrapper = shallow(<GardenMap {...fakeProps()} />);
    wrapper.find(".drop-area-svg").simulate("mouseMove", {
      pageX: 10, pageY: 20
    });
    expect(resizePoint).toHaveBeenCalledWith(expect.objectContaining({
      gardenCoords: { x: 100, y: 200 },
    }));
  });

  it("sets cursor position", () => {
    mockMode = Mode.clickToAdd;
    const wrapper = shallow<GardenMap>(<GardenMap {...fakeProps()} />);
    wrapper.find(".drop-area-svg").simulate("mouseMove", {
      pageX: 10, pageY: 20
    });
    expect(wrapper.state().cursorPosition).toEqual({ x: 100, y: 200 });
  });

  it("lays eggs", () => {
    setEggStatus(EggKeys.BRING_ON_THE_BUGS, "");
    setEggStatus(EggKeys.BUGS_ARE_STILL_ALIVE, "");
    const wrapper = shallow<GardenMap>(<GardenMap {...fakeProps()} />);
    expect(wrapper.instance().Bugs()).toEqual(<g />);
    setEggStatus(EggKeys.BRING_ON_THE_BUGS, "true");
    setEggStatus(EggKeys.BUGS_ARE_STILL_ALIVE, "");
    expect(wrapper.instance().Bugs()).not.toEqual(<g />);
  });

  const expectHandledDragOver = () => {
    const wrapper = shallow(<GardenMap {...fakeProps()} />);
    const e = {
      dataTransfer: { dropEffect: undefined },
      preventDefault: jest.fn()
    };
    wrapper.find(".drop-area").simulate("dragOver", e);
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
    const wrapper = shallow(<GardenMap {...fakeProps()} />);
    const e = DEFAULT_EVENT;
    wrapper.find(".drop-area").simulate("dragStart", e);
    expect(e.preventDefault).toHaveBeenCalled();
  });

  it(".drop-area: handles drag enter", () => {
    mockMode = Mode.addPlant;
    const wrapper = shallow(<GardenMap {...fakeProps()} />);
    const e = DEFAULT_EVENT;
    wrapper.find(".drop-area").simulate("dragEnter", e);
    expect(e.preventDefault).toHaveBeenCalled();
  });

  it("closes panel", () => {
    mockMode = Mode.boxSelect;
    const p = fakeProps();
    p.designer.selectedPoints = undefined;
    const wrapper = mount<GardenMap>(<GardenMap {...p} />);
    wrapper.instance().closePanel()();
    expect(closePlantInfo).toHaveBeenCalled();
  });

  it("closes panel when not in select mode", () => {
    mockMode = Mode.none;
    const wrapper = mount<GardenMap>(<GardenMap {...fakeProps()} />);
    wrapper.instance().closePanel()();
    expect(closePlantInfo).toHaveBeenCalled();
  });

  it("doesn't close panel: box select", () => {
    mockMode = Mode.boxSelect;
    const p = fakeProps();
    p.designer.selectedPoints = [fakePlant().uuid];
    const wrapper = mount<GardenMap>(<GardenMap {...p} />);
    wrapper.instance().closePanel()();
    expect(closePlantInfo).not.toHaveBeenCalled();
  });

  it("doesn't close panel: move mode", () => {
    mockMode = Mode.locationInfo;
    const p = fakeProps();
    p.designer.selectedPoints = [fakePlant().uuid];
    const wrapper = mount<GardenMap>(<GardenMap {...p} />);
    wrapper.instance().closePanel()();
    expect(closePlantInfo).not.toHaveBeenCalled();
  });

  it("doesn't close panel: profile mode", () => {
    mockMode = Mode.profile;
    const p = fakeProps();
    p.designer.selectedPoints = [fakePlant().uuid];
    const wrapper = mount<GardenMap>(<GardenMap {...p} />);
    wrapper.instance().closePanel()();
    expect(closePlantInfo).not.toHaveBeenCalled();
  });

  it("closes panel: location active", () => {
    mockMode = Mode.none;
    const p = fakeProps();
    const wrapper = mount<GardenMap>(<GardenMap {...p} />);
    wrapper.setState({
      toLocation: { x: 100, y: 100, z: 0 }, previousSelectionBoxArea: 0,
    });
    wrapper.instance().navigate = jest.fn();
    wrapper.instance().closePanel()();
    expect(wrapper.instance().navigate).toHaveBeenCalledWith(
      expect.stringContaining(Path.location()));
    expect(closePlantInfo).toHaveBeenCalled();
    expect(wrapper.state().toLocation).toEqual(undefined);
  });

  it("closes panel: location and selection box active", () => {
    mockMode = Mode.none;
    const p = fakeProps();
    const wrapper = mount<GardenMap>(<GardenMap {...p} />);
    wrapper.setState({
      toLocation: { x: 100, y: 100, z: 0 }, previousSelectionBoxArea: 1000,
    });
    wrapper.instance().navigate = jest.fn();
    wrapper.instance().closePanel()();
    expect(wrapper.instance().navigate).not.toHaveBeenCalledWith(
      expect.stringContaining(Path.location()));
    expect(closePlantInfo).toHaveBeenCalled();
    expect(wrapper.state().toLocation).toEqual(undefined);
  });

  it("calls unselectPlant on unmount", () => {
    const wrapper = shallow(<GardenMap {...fakeProps()} />);
    wrapper.unmount();
    expect(unselectPlant).toHaveBeenCalled();
  });

  it("doesn't return plant in wrong mode", () => {
    const wrapper = shallow<GardenMap>(<GardenMap {...fakeProps()} />);
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
    const wrapper = shallow<GardenMap>(<GardenMap {...p} />);
    expect(wrapper.instance().currentSelection).toEqual([point]);
  });

  it("doesn't return point in wrong mode", () => {
    mockInteractionAllow = false;
    const wrapper = shallow<GardenMap>(<GardenMap {...fakeProps()} />);
    expect(wrapper.instance().currentSelection).toEqual([]);
    mockInteractionAllow = true;
  });

  it("sets state", () => {
    const wrapper = shallow<GardenMap>(<GardenMap {...fakeProps()} />);
    expect(wrapper.instance().state.isDragging).toBeFalsy();
    wrapper.instance().setMapState({ isDragging: true });
    expect(wrapper.instance().state.isDragging).toBe(true);
  });

  it("allows interactions: default", () => {
    mockMode = Mode.none;
    mockInteractionAllow = true;
    const p = fakeProps();
    p.designer.selectionPointType = undefined;
    const wrapper = mount<GardenMap>(<GardenMap {...p} />);
    const allowed = wrapper.instance().interactions("Plant");
    expect(allowed).toBeTruthy();
  });

  it("allows interactions: box select", () => {
    mockMode = Mode.boxSelect;
    mockInteractionAllow = true;
    const p = fakeProps();
    p.designer.selectionPointType = undefined;
    const wrapper = mount<GardenMap>(<GardenMap {...p} />);
    const allowed = wrapper.instance().interactions("Plant");
    expect(allowed).toBeTruthy();
  });

  it("allows interactions: group edit", () => {
    mockMode = Mode.editGroup;
    mockInteractionAllow = true;
    const p = fakeProps();
    p.designer.selectionPointType = undefined;
    const wrapper = mount<GardenMap>(<GardenMap {...p} />);
    const allowed = wrapper.instance().interactions("Plant");
    expect(allowed).toBeTruthy();
  });

  it("disallows interactions: default", () => {
    mockMode = Mode.none;
    mockInteractionAllow = false;
    const p = fakeProps();
    p.designer.selectionPointType = undefined;
    const wrapper = mount<GardenMap>(<GardenMap {...p} />);
    const allowed = wrapper.instance().interactions("Plant");
    expect(allowed).toBeFalsy();
  });

  it("disallows interactions: box select", () => {
    mockMode = Mode.boxSelect;
    mockInteractionAllow = true;
    const p = fakeProps();
    p.designer.selectionPointType = ["Plant"];
    const wrapper = mount<GardenMap>(<GardenMap {...p} />);
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
    const wrapper = mount<GardenMap>(<GardenMap {...p} />);
    expect(wrapper.instance().pointsSelectedByGroup).toEqual([point]);
  });
});
