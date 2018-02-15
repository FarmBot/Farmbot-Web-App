jest.mock("../../../open_farm/icons", () => ({
  cachedCrop: jest.fn(() => { return Promise.resolve({ spread: 100 }); })
}));

const mockError = jest.fn();
jest.mock("farmbot-toastr", () => ({
  error: mockError
}));

jest.mock("../../../api/crud", () => ({
  initSave: jest.fn(),
  edit: () => "edit resource",
  save: () => "save resource",
}));

let mockPath = "";
jest.mock("../../../history", () => ({
  getPathArray: jest.fn(() => { return mockPath.split("/"); })
}));

import * as React from "react";
import { GardenMap } from "../garden_map";
import { shallow } from "enzyme";
import { GardenMapProps } from "../../interfaces";
import { fakePlant } from "../../../__test_support__/fake_state/resources";
import { Actions } from "../../../constants";
import { initSave } from "../../../api/crud";

function fakeProps(): GardenMapProps {
  return {
    showPoints: true,
    showPlants: true,
    showSpread: false,
    showFarmbot: false,
    showImages: false,
    selectedPlant: fakePlant(),
    crops: [],
    dispatch: jest.fn(),
    designer: {
      selectedPlants: undefined,
      hoveredPlant: {
        plantUUID: "",
        icon: ""
      },
      hoveredPlantListItem: undefined,
      cropSearchQuery: "",
      cropSearchResults: [{
        crop: {
          name: "strawberry",
          slug: "strawberry",
          binomial_name: "",
          common_names: [],
          description: "",
          sun_requirements: "",
          sowing_method: "",
          processing_pictures: 0
        }, image: ""
      }],
      chosenLocation: { x: undefined, y: undefined, z: undefined },
    },
    plants: [fakePlant(), fakePlant()],
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
    hoveredPlant: fakePlant(),
    zoomLvl: 1,
    botOriginQuadrant: 2,
    gridSize: { x: 1000, y: 1000 },
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
  };
}

describe("<GardenPlant/>", () => {
  beforeEach(function () {
    jest.clearAllMocks();
    Object.defineProperty(document, "querySelector", {
      value: () => { return { scrollLeft: 1, scrollTop: 2 }; },
      configurable: true
    });
    Object.defineProperty(window, "getComputedStyle", {
      value: () => { return { zoom: 1 }; }, configurable: true
    });
  });

  it("drops plant", () => {
    const p = fakeProps();
    const dispatch = jest.fn();
    p.dispatch = dispatch;
    const wrapper = shallow(<GardenMap {...p} />);
    mockPath = "/app/designer/plants/crop_search/strawberry/add";
    wrapper.find("#drop-area-svg").simulate("click", {
      preventDefault: jest.fn()
    });
    expect(initSave).toHaveBeenCalledWith(expect.objectContaining({
      body: expect.objectContaining({ name: "strawberry" })
    }));
  });

  it("doesn't drop plant: error", () => {
    const wrapper = shallow(<GardenMap {...fakeProps() } />);
    mockPath = "/app/designer/plants/crop_search/aplant/add";
    Object.defineProperty(document, "querySelector", {
      value: () => { }, configurable: true
    });
    const add = () =>
      wrapper.find("#drop-area-svg").simulate("click", {
        preventDefault: jest.fn()
      });
    expect(add).toThrow(/while trying to add a plant./);
  });

  it("doesn't drop plant: outside planting area", () => {
    const wrapper = shallow(<GardenMap {...fakeProps() } />);
    mockPath = "/app/designer/plants/crop_search/aplant/add";
    wrapper.find("#drop-area-svg").simulate("click", {
      preventDefault: jest.fn(), pageX: -100, pageY: -100
    });
    expect(mockError).toHaveBeenCalledWith(
      expect.stringContaining("Outside of planting area"));
  });

  it("starts drag and sets activeSpread", async () => {
    const wrapper = shallow(<GardenMap {...fakeProps() } />);
    expect(wrapper.state()).toEqual({});
    mockPath = "/app/designer/plants/1/edit/";
    await wrapper.find("#drop-area-svg").simulate("mouseDown");
    expect(wrapper.state()).toEqual({
      activeDragSpread: 1000,
      isDragging: true
    });
  });

  it("ends drag", () => {
    const p = fakeProps();
    const wrapper = shallow(<GardenMap {...p } />);
    expect(wrapper.state()).toEqual({});
    wrapper.find("#drop-area-svg").simulate("mouseUp");
    expect(p.dispatch).not.toHaveBeenCalled();
    expect(wrapper.state()).toEqual({
      "activeDragSpread": undefined,
      "activeDragXY": { "x": undefined, "y": undefined, "z": undefined },
      "isDragging": false,
      "pageX": 0,
      "pageY": 0
    });
    wrapper.setState({ isDragging: true });
    wrapper.find("#drop-area-svg").simulate("mouseUp");
    expect(p.dispatch).toHaveBeenCalled();
    expect(wrapper.state().isDragging).toBeFalsy();
  });

  it("drags: editing", () => {
    mockPath = "/app/designer/plants/1/edit";
    const p = fakeProps();
    const wrapper = shallow(<GardenMap {...p } />);
    expect(wrapper.state()).toEqual({});
    wrapper.find("#drop-area-svg").simulate("mouseMove");
    expect(p.dispatch).not.toHaveBeenCalled();
    expect(wrapper.state()).toEqual({});
    wrapper.setState({ isDragging: true });
    wrapper.find("#drop-area-svg").simulate("mouseMove", {
      pageX: 1, pageY: 2
    });
    expect(wrapper.state()).toEqual({
      activeDragXY: { x: 100, y: 200, z: 0 },
      isDragging: true,
      pageX: 1,
      pageY: 2
    });
    expect(p.dispatch).toHaveBeenCalledWith("edit resource");
  });

  it("drags: selecting", () => {
    mockPath = "/app/designer/plants/select";
    const p = fakeProps();
    const wrapper = shallow(<GardenMap {...p } />);
    expect(wrapper.state()).toEqual({});
    wrapper.find("#drop-area-svg").simulate("mouseMove");
    expect(p.dispatch).not.toHaveBeenCalled();
    expect(wrapper.state()).toEqual({});
    wrapper.setState({
      selectionBox: {
        x0: 0, y0: 0, x1: undefined, y1: undefined
      }
    });
    wrapper.find("#drop-area-svg").simulate("mouseMove", {
      pageX: 2000, pageY: 2000
    });
    expect(wrapper.state()).toEqual({
      selectionBox: {
        x0: 0, y0: 0, x1: 1580, y1: 1790
      }
    });
    expect(p.dispatch).toHaveBeenCalledWith(expect.objectContaining({
      type: Actions.SELECT_PLANT,
      payload: [expect.any(String), expect.any(String)]
    }));
  });
});
