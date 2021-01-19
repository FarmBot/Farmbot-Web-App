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
  getGardenCoordinates: jest.fn(),
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

jest.mock("../../move_to", () => ({ chooseLocation: jest.fn() }));

jest.mock("../profile", () => ({
  chooseProfile: jest.fn(),
  ProfileLine: () => <g />,
}));

jest.mock("../../../history", () => ({
  history: {
    push: jest.fn(),
    getPathArray: () => [],
  },
  push: jest.fn(),
  getPathArray: () => [],
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
  dropPlant, beginPlantDrag, maybeSavePlantLocation, dragPlant,
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
  fakePlant, fakePointGroup, fakePoint,
} from "../../../__test_support__/fake_state/resources";
import { fakeTimeSettings } from "../../../__test_support__/fake_time_settings";
import { history } from "../../../history";
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
  peripherals: [],
  eStopStatus: false,
  latestImages: [],
  cameraCalibrationData: fakeCameraCalibrationData(),
  getConfigValue: jest.fn(),
  sensorReadings: [],
  sensors: [],
  timeSettings: fakeTimeSettings(),
  groups: [],
  mountedToolInfo: fakeMountedToolInfo(),
  visualizedSequenceBody: [],
  logs: [],
  deviceTarget: "",
});

describe("<GardenMap/>", () => {
  it("drops plant", () => {
    const wrapper = shallow(<GardenMap {...fakeProps()} />);
    mockMode = Mode.clickToAdd;
    wrapper.find(".drop-area-svg").simulate("click", DEFAULT_EVENT);
    expect(dropPlant).toHaveBeenCalled();
  });

  it("starts drag: move plant", () => {
    const wrapper = shallow(<GardenMap {...fakeProps()} />);
    mockMode = Mode.editPlant;
    mockAtPlant = true;
    wrapper.find(".drop-area-svg").simulate("mouseDown", DEFAULT_EVENT);
    expect(beginPlantDrag).toHaveBeenCalled();
    expect(startNewSelectionBox).not.toHaveBeenCalled();
  });

  it("starts drag: draw box", () => {
    const wrapper = shallow(<GardenMap {...fakeProps()} />);
    mockMode = Mode.editPlant;
    mockAtPlant = false;
    wrapper.find(".drop-area-svg").simulate("mouseDown", DEFAULT_EVENT);
    expect(beginPlantDrag).not.toHaveBeenCalled();
    expect(startNewSelectionBox).toHaveBeenCalled();
  });

  it("ends drag", () => {
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
    const wrapper = mount(<GardenMap {...fakeProps()} />);
    mockMode = Mode.addPlant;
    const e = { pageX: 1000, pageY: 2000 };
    wrapper.find(".drop-area-background").simulate("mouseDown", e);
    expect(startNewSelectionBox).toHaveBeenCalled();
    expect(history.push).toHaveBeenCalledWith("/app/designer/plants");
    expect(getGardenCoordinates).toHaveBeenCalledWith(
      expect.objectContaining(e));
  });

  it("starts drag on background: selecting again", () => {
    const wrapper = mount(<GardenMap {...fakeProps()} />);
    mockMode = Mode.boxSelect;
    const e = { pageX: 1000, pageY: 2000 };
    wrapper.find(".drop-area-background").simulate("mouseDown", e);
    expect(startNewSelectionBox).toHaveBeenCalled();
    expect(history.push).not.toHaveBeenCalled();
    expect(getGardenCoordinates).toHaveBeenCalledWith(
      expect.objectContaining(e));
  });

  it("starts drag on background: does nothing when adding plants", () => {
    const wrapper = mount(<GardenMap {...fakeProps()} />);
    mockMode = Mode.clickToAdd;
    const e = { pageX: 1000, pageY: 2000 };
    wrapper.find(".drop-area-background").simulate("mouseDown", e);
    expect(startNewSelectionBox).not.toHaveBeenCalled();
    expect(history.push).not.toHaveBeenCalled();
    expect(getGardenCoordinates).not.toHaveBeenCalled();
  });

  it("starts drag on background: does nothing when in move mode", () => {
    const wrapper = mount(<GardenMap {...fakeProps()} />);
    mockMode = Mode.moveTo;
    const e = { pageX: 1000, pageY: 2000 };
    wrapper.find(".drop-area-background").simulate("mouseDown", e);
    expect(startNewSelectionBox).not.toHaveBeenCalled();
    expect(history.push).not.toHaveBeenCalled();
    expect(getGardenCoordinates).not.toHaveBeenCalled();
  });

  it("starts drag on background: does nothing when in profile mode", () => {
    const wrapper = mount(<GardenMap {...fakeProps()} />);
    mockMode = Mode.profile;
    const e = { pageX: 1000, pageY: 2000 };
    wrapper.find(".drop-area-background").simulate("mouseDown", e);
    expect(startNewSelectionBox).not.toHaveBeenCalled();
    expect(history.push).not.toHaveBeenCalled();
    expect(getGardenCoordinates).not.toHaveBeenCalled();
  });

  it("starts drag on background: creating points", () => {
    const wrapper = mount(<GardenMap {...fakeProps()} />);
    mockMode = Mode.createPoint;
    const e = { pageX: 1000, pageY: 2000 };
    wrapper.find(".drop-area-background").simulate("mouseDown", e);
    expect(startNewPoint).toHaveBeenCalled();
    expect(startNewSelectionBox).not.toHaveBeenCalled();
    expect(history.push).not.toHaveBeenCalled();
    expect(getGardenCoordinates).toHaveBeenCalledWith(
      expect.objectContaining(e));
  });

  it("starts drag on background: selecting zone", () => {
    const p = fakeProps();
    p.designer.editGroupAreaInMap = true;
    const wrapper = mount(<GardenMap {...p} />);
    mockMode = Mode.editGroup;
    const e = { pageX: 1000, pageY: 2000 };
    wrapper.find(".drop-area-background").simulate("mouseDown", e);
    expect(startNewSelectionBox).toHaveBeenCalledWith(
      expect.objectContaining({ plantActions: false }));
    expect(history.push).not.toHaveBeenCalled();
    expect(getGardenCoordinates).toHaveBeenCalledWith(
      expect.objectContaining(e));
  });

  it("starts drag: click-to-add mode", () => {
    const wrapper = shallow(<GardenMap {...fakeProps()} />);
    mockMode = Mode.clickToAdd;
    const e = { pageX: 1000, pageY: 2000 };
    wrapper.find(".drop-area-svg").simulate("mouseDown", e);
    expect(beginPlantDrag).not.toHaveBeenCalled();
    expect(getGardenCoordinates).not.toHaveBeenCalled();
  });

  it("drags: selecting", () => {
    const wrapper = shallow(<GardenMap {...fakeProps()} />);
    mockMode = Mode.boxSelect;
    const e = { pageX: 2000, pageY: 2000 };
    wrapper.find(".drop-area-svg").simulate("mouseMove", e);
    expect(resizeBox).toHaveBeenCalled();
    expect(getGardenCoordinates).toHaveBeenCalledWith(
      expect.objectContaining(e));
  });

  it("drags: selecting zone", () => {
    const p = fakeProps();
    p.designer.editGroupAreaInMap = true;
    const wrapper = shallow(<GardenMap {...p} />);
    mockMode = Mode.editGroup;
    const e = { pageX: 2000, pageY: 2000 };
    wrapper.find(".drop-area-svg").simulate("mouseMove", e);
    expect(resizeBox).toHaveBeenCalledWith(
      expect.objectContaining({ plantActions: false }));
    expect(getGardenCoordinates).toHaveBeenCalledWith(
      expect.objectContaining(e));
  });

  it("selects location", () => {
    const wrapper = shallow(<GardenMap {...fakeProps()} />);
    mockMode = Mode.moveTo;
    wrapper.find(".drop-area-svg").simulate("click", {
      pageX: 1000, pageY: 2000, preventDefault: jest.fn()
    });
    expect(chooseLocation).toHaveBeenCalled();
    expect(getGardenCoordinates).toHaveBeenCalledWith(
      expect.objectContaining({ pageX: 1000, pageY: 2000 }));
  });

  it("selects profile location", () => {
    const wrapper = shallow(<GardenMap {...fakeProps()} />);
    mockMode = Mode.profile;
    wrapper.find(".drop-area-svg").simulate("click", {
      pageX: 1000, pageY: 2000, preventDefault: jest.fn()
    });
    expect(chooseProfile).toHaveBeenCalled();
    expect(getGardenCoordinates).toHaveBeenCalledWith(
      expect.objectContaining({ pageX: 1000, pageY: 2000 }));
  });

  it("starts drawing point", () => {
    const wrapper = shallow(<GardenMap {...fakeProps()} />);
    mockMode = Mode.createPoint;
    wrapper.find(".drop-area-svg").simulate("mouseDown", {
      pageX: 1, pageY: 2
    });
    expect(startNewPoint).toHaveBeenCalledWith(expect.objectContaining({
      type: "point"
    }));
    expect(getGardenCoordinates).toHaveBeenCalledWith(
      expect.objectContaining({ pageX: 1, pageY: 2 }));
  });

  it("starts drawing weed", () => {
    const wrapper = shallow(<GardenMap {...fakeProps()} />);
    mockMode = Mode.createWeed;
    wrapper.find(".drop-area-svg").simulate("mouseDown", {
      pageX: 1, pageY: 2
    });
    expect(startNewPoint).toHaveBeenCalledWith(expect.objectContaining({
      type: "weed"
    }));
    expect(getGardenCoordinates).toHaveBeenCalledWith(
      expect.objectContaining({ pageX: 1, pageY: 2 }));
  });

  it("sets drawn point radius", () => {
    const wrapper = shallow(<GardenMap {...fakeProps()} />);
    mockMode = Mode.createPoint;
    wrapper.find(".drop-area-svg").simulate("mouseMove", {
      pageX: 10, pageY: 20
    });
    expect(resizePoint).toHaveBeenCalledWith(expect.objectContaining({
      type: "point"
    }));
  });

  it("sets drawn weed radius", () => {
    const wrapper = shallow(<GardenMap {...fakeProps()} />);
    mockMode = Mode.createWeed;
    wrapper.find(".drop-area-svg").simulate("mouseMove", {
      pageX: 10, pageY: 20
    });
    expect(resizePoint).toHaveBeenCalledWith(expect.objectContaining({
      type: "weed"
    }));
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
    mockMode = Mode.moveTo;
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

  it("calls unselectPlant on unmount", () => {
    const wrapper = shallow(<GardenMap {...fakeProps()} />);
    wrapper.unmount();
    expect(unselectPlant).toHaveBeenCalled();
  });

  it("doesn't return plant in wrong mode", () => {
    const wrapper = shallow<GardenMap>(<GardenMap {...fakeProps()} />);
    mockMode = Mode.moveTo;
    expect(wrapper.instance().getPlant()).toEqual(undefined);
    mockMode = Mode.boxSelect;
    expect(wrapper.instance().getPlant()).toEqual(undefined);
    mockMode = Mode.createPoint;
    expect(wrapper.instance().getPlant()).toEqual(undefined);
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

  it("unswapped height and width", () => {
    const p = fakeProps();
    p.mapTransformProps.xySwap = false;
    const wrapper = shallow(<GardenMap {...p} />);
    const svg = wrapper.find(".drop-area-svg");
    expect(svg.props().width).toEqual(3000);
    expect(svg.props().height).toEqual(1500);
  });

  it("swapped height and width", () => {
    const p = fakeProps();
    p.mapTransformProps.xySwap = true;
    const wrapper = shallow(<GardenMap {...p} />);
    const svg = wrapper.find(".drop-area-svg");
    expect(svg.props().width).toEqual(1500);
    expect(svg.props().height).toEqual(3000);
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
