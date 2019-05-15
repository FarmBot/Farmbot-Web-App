jest.mock("../../actions", () => ({
  unselectPlant: jest.fn(() => jest.fn()),
  closePlantInfo: jest.fn(() => jest.fn()),
}));

import { Mode } from "../interfaces";
let mockMode = Mode.none;
jest.mock("../util", () => ({
  getMode: () => mockMode,
  getMapSize: () => ({ h: 100, w: 100 }),
  getGardenCoordinates: jest.fn(),
  transformXY: jest.fn(() => ({ qx: 0, qy: 0 })),
  transformForQuadrant: jest.fn(),
  maybeNoPointer: jest.fn(),
  round: jest.fn(),
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
}));

jest.mock("../../move_to", () => ({ chooseLocation: jest.fn() }));

import * as React from "react";
import { GardenMap } from "../garden_map";
import { shallow, mount } from "enzyme";
import { GardenMapProps } from "../../interfaces";
import { setEggStatus, EggKeys } from "../easter_eggs/status";
import { unselectPlant, closePlantInfo } from "../../actions";
import {
  dropPlant, beginPlantDrag, maybeSavePlantLocation, dragPlant
} from "../layers/plants/plant_actions";
import {
  startNewSelectionBox, resizeBox
} from "../background/selection_box_actions";
import { getGardenCoordinates } from "../util";
import { chooseLocation } from "../../move_to";
import { startNewPoint, resizePoint } from "../drawn_point/drawn_point_actions";
import {
  fakeDesignerState
} from "../../../__test_support__/fake_designer_state";
import { fakePlant } from "../../../__test_support__/fake_state/resources";
import { fakeTimeSettings } from "../../../__test_support__/fake_time_settings";

const DEFAULT_EVENT = { preventDefault: jest.fn(), pageX: NaN, pageY: NaN };

const fakeProps = (): GardenMapProps => ({
  showPoints: true,
  showPlants: true,
  showSpread: false,
  showFarmbot: false,
  showImages: false,
  showSensorReadings: false,
  selectedPlant: undefined,
  crops: [],
  dispatch: jest.fn(),
  designer: fakeDesignerState(),
  plants: [],
  points: [],
  toolSlots: [],
  botLocationData: {
    position: { x: 0, y: 0, z: 0 },
    scaled_encoders: { x: undefined, y: undefined, z: undefined },
    raw_encoders: { x: undefined, y: undefined, z: undefined },
  },
  botSize: {
    x: { value: 3000, isDefault: true },
    y: { value: 1500, isDefault: true }
  },
  stopAtHome: { x: true, y: true },
  hoveredPlant: undefined,
  zoomLvl: 1,
  botOriginQuadrant: 2,
  gridSize: { x: 1000, y: 2000 },
  gridOffset: { x: 100, y: 100 },
  peripherals: [],
  eStopStatus: false,
  latestImages: [],
  cameraCalibrationData: {
    scale: undefined, rotation: undefined,
    offset: { x: undefined, y: undefined },
    origin: undefined,
    calibrationZ: undefined
  },
  getConfigValue: jest.fn(),
  sensorReadings: [],
  sensors: [],
  timeSettings: fakeTimeSettings(),
});

describe("<GardenMap/>", () => {
  it("drops plant", () => {
    const wrapper = shallow(<GardenMap {...fakeProps()} />);
    mockMode = Mode.clickToAdd;
    wrapper.find(".drop-area-svg").simulate("click", DEFAULT_EVENT);
    expect(dropPlant).toHaveBeenCalled();
  });

  it("starts drag", () => {
    const wrapper = shallow(<GardenMap {...fakeProps()} />);
    mockMode = Mode.editPlant;
    wrapper.find(".drop-area-svg").simulate("mouseDown", DEFAULT_EVENT);
    expect(beginPlantDrag).toHaveBeenCalled();
  });

  it("ends drag", () => {
    const wrapper = shallow<GardenMap>(<GardenMap {...fakeProps()} />);
    wrapper.setState({ isDragging: true });
    wrapper.find(".drop-area-svg").simulate("mouseUp", DEFAULT_EVENT);
    expect(maybeSavePlantLocation).toHaveBeenCalled();
    expect(wrapper.instance().state.isDragging).toBeFalsy();
  });

  it("drags: editing", () => {
    mockMode = Mode.editPlant;
    const wrapper = shallow(<GardenMap {...fakeProps()} />);
    wrapper.find(".drop-area-svg").simulate("mouseMove", DEFAULT_EVENT);
    expect(dragPlant).toHaveBeenCalled();
  });

  it("starts drag: selecting", () => {
    const wrapper = shallow(<GardenMap {...fakeProps()} />);
    mockMode = Mode.boxSelect;
    const e = { pageX: 1000, pageY: 2000 };
    wrapper.find(".drop-area-svg").simulate("mouseDown", e);
    expect(startNewSelectionBox).toHaveBeenCalled();
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

  it("starts drawing point", () => {
    const wrapper = shallow(<GardenMap {...fakeProps()} />);
    mockMode = Mode.createPoint;
    wrapper.find(".drop-area-svg").simulate("mouseDown", {
      pageX: 1, pageY: 2
    });
    expect(startNewPoint).toHaveBeenCalled();
    expect(getGardenCoordinates).toHaveBeenCalledWith(
      expect.objectContaining({ pageX: 1, pageY: 2 }));
  });

  it("sets drawn point radius", () => {
    const wrapper = shallow(<GardenMap {...fakeProps()} />);
    mockMode = Mode.createPoint;
    wrapper.find(".drop-area-svg").simulate("mouseMove", {
      pageX: 10, pageY: 20
    });
    expect(resizePoint).toHaveBeenCalled();
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
    p.designer.selectedPlants = undefined;
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

  it("doesn't close panel", () => {
    mockMode = Mode.boxSelect;
    const p = fakeProps();
    p.designer.selectedPlants = [fakePlant().uuid];
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

  it("unswapped height and width", () => {
    const p = fakeProps();
    p.getConfigValue = () => false;
    const wrapper = shallow(<GardenMap {...p} />);
    const svg = wrapper.find(".drop-area-svg");
    expect(svg.props().width).toEqual(1000);
    expect(svg.props().height).toEqual(2000);
  });

  it("swapped height and width", () => {
    const p = fakeProps();
    p.getConfigValue = () => true;
    const wrapper = shallow(<GardenMap {...p} />);
    const svg = wrapper.find(".drop-area-svg");
    expect(svg.props().width).toEqual(2000);
    expect(svg.props().height).toEqual(1000);
  });

});
