jest.mock("../../../open_farm/icons", () => ({
  cachedCrop: jest.fn(() => { return Promise.resolve({ spread: 100 }); })
}));

jest.mock("../../actions", () => ({
  closePlantInfo: jest.fn(),
  movePlant: jest.fn(),
  unselectPlant: jest.fn(() => jest.fn()),
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
import { setEggStatus, EggKeys } from "../easter_eggs/status";
import { movePlant, unselectPlant } from "../../actions";
import { error } from "farmbot-toastr";

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
      currentPoint: undefined,
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
    const wrapper = shallow(<GardenMap {...fakeProps()} />);
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
    const wrapper = shallow(<GardenMap {...fakeProps()} />);
    mockPath = "/app/designer/plants/crop_search/aplant/add";
    wrapper.find("#drop-area-svg").simulate("click", {
      preventDefault: jest.fn(), pageX: -100, pageY: -100
    });
    expect(error).toHaveBeenCalledWith(
      expect.stringContaining("Outside of planting area"));
  });

  it("starts drag and sets activeSpread", async () => {
    const wrapper = shallow(<GardenMap {...fakeProps()} />);
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
    const wrapper = shallow<GardenMap>(<GardenMap {...p} />);
    expect(wrapper.state()).toEqual({});
    wrapper.find("#drop-area-svg").simulate("mouseUp");
    expect(p.dispatch).not.toHaveBeenCalled();
    expect(wrapper.state()).toEqual({
      activeDragSpread: undefined,
      activeDragXY: { x: undefined, y: undefined, z: undefined },
      isDragging: false,
      pageX: 0,
      pageY: 0
    });
    wrapper.setState({ isDragging: true });
    wrapper.find("#drop-area-svg").simulate("mouseUp");
    expect(p.dispatch).toHaveBeenCalled();
    expect(wrapper.instance().state.isDragging).toBeFalsy();
  });

  it("drags: editing", () => {
    mockPath = "/app/designer/plants/1/edit";
    Object.defineProperty(window, "getComputedStyle", {
      value: () => { return { zoom: 0.5 }; }, configurable: true
    });
    const p = fakeProps();
    const wrapper = shallow(<GardenMap {...p} />);
    expect(wrapper.state()).toEqual({});
    wrapper.find("#drop-area-svg").simulate("mouseMove");
    expect(p.dispatch).not.toHaveBeenCalled();
    expect(wrapper.state()).toEqual({});
    wrapper.setState({ isDragging: true, pageX: 200, pageY: 300 });
    wrapper.find("#drop-area-svg").simulate("mouseMove", {
      pageX: 400, pageY: 500
    });
    expect(wrapper.state()).toEqual({
      activeDragXY: { x: 500, y: 600, z: 0 },
      isDragging: true,
      pageX: 400,
      pageY: 500
    });
    expect(movePlant).toHaveBeenCalledWith(expect.objectContaining({
      deltaX: 400, deltaY: 400
    }));
  });

  it("drags: editing, zoom undefined", () => {
    mockPath = "/app/designer/plants/1/edit";
    Object.defineProperty(window, "getComputedStyle", {
      value: () => { return { zoom: undefined }; }, configurable: true
    });
    const p = fakeProps();
    const wrapper = shallow(<GardenMap {...p} />);
    expect(wrapper.state()).toEqual({});
    wrapper.find("#drop-area-svg").simulate("mouseMove");
    expect(p.dispatch).not.toHaveBeenCalled();
    expect(wrapper.state()).toEqual({});
    wrapper.setState({ isDragging: true, pageX: 300, pageY: 400 });
    wrapper.find("#drop-area-svg").simulate("mouseMove", {
      pageX: 400, pageY: 500
    });
    expect(wrapper.state()).toEqual({
      activeDragXY: { x: 200, y: 300, z: 0 },
      isDragging: true,
      pageX: 400,
      pageY: 500
    });
    expect(movePlant).toHaveBeenCalledWith(expect.objectContaining({
      deltaX: 100, deltaY: 100
    }));
  });

  it("drags: editing, X&Y swapped", () => {
    mockPath = "/app/designer/plants/1/edit";
    const p = fakeProps();
    p.getConfigValue = () => true;
    p.botOriginQuadrant = 1;
    const wrapper = shallow(<GardenMap {...p} />);
    expect(wrapper.state()).toEqual({});
    wrapper.find("#drop-area-svg").simulate("mouseMove");
    expect(p.dispatch).not.toHaveBeenCalled();
    expect(wrapper.state()).toEqual({});
    wrapper.setState({ isDragging: true, pageX: 300, pageY: 500 });
    wrapper.find("#drop-area-svg").simulate("mouseMove", {
      pageX: 400, pageY: 500
    });
    expect(wrapper.state()).toEqual({
      activeDragXY: { x: -100, y: 300, z: 0 },
      isDragging: true,
      pageX: 500,
      pageY: 400
    });
    expect(movePlant).toHaveBeenCalledWith(expect.objectContaining({
      deltaX: -200, deltaY: 100
    }));
  });

  it("starts drag: selecting", async () => {
    const p = fakeProps();
    const wrapper = shallow(<GardenMap {...p} />);
    expect(wrapper.state()).toEqual({});
    mockPath = "/app/designer/plants/select";
    await wrapper.find("#drop-area-svg").simulate("mouseDown", {
      pageX: 1000, pageY: 2000
    });
    expect(wrapper.state()).toEqual({
      selectionBox: {
        x0: 580, y0: 1790, x1: undefined, y1: undefined
      }
    });
    expect(p.dispatch).toHaveBeenCalledWith({
      payload: undefined,
      type: Actions.SELECT_PLANT
    });
  });

  it("drags: selecting", () => {
    mockPath = "/app/designer/plants/select";
    const p = fakeProps();
    const wrapper = shallow(<GardenMap {...p} />);
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

  it("selects location", async () => {
    const p = fakeProps();
    const wrapper = shallow(<GardenMap {...p} />);
    expect(wrapper.state()).toEqual({});
    mockPath = "/app/designer/plants/move_to";
    await wrapper.find("#drop-area-svg").simulate("click", {
      pageX: 1000, pageY: 2000, preventDefault: jest.fn()
    });
    expect(p.dispatch).toHaveBeenCalledWith({
      payload: { x: 580, y: 1790, z: 0 },
      type: Actions.CHOOSE_LOCATION
    });
  });

  it("selects location: zoom undefined", async () => {
    const p = fakeProps();
    const wrapper = shallow(<GardenMap {...p} />);
    Object.defineProperty(window, "getComputedStyle", {
      value: () => { return { zoom: undefined }; }, configurable: true
    });
    expect(wrapper.state()).toEqual({});
    mockPath = "/app/designer/plants/move_to";
    await wrapper.find("#drop-area-svg").simulate("click", {
      pageX: 1000, pageY: 2000, preventDefault: jest.fn()
    });
    expect(p.dispatch).toHaveBeenCalledWith({
      payload: { x: 580, y: 1790, z: 0 },
      type: Actions.CHOOSE_LOCATION
    });
  });

  it("starts drawing point", async () => {
    const p = fakeProps();
    const wrapper = shallow(<GardenMap {...p} />);
    expect(wrapper.state()).toEqual({});
    mockPath = "/app/designer/plants/create_point/";
    await wrapper.find("#drop-area-svg").simulate("mouseDown", {
      pageX: 1, pageY: 2
    });
    expect(wrapper.state()).toEqual({ isDragging: true });
    expect(p.dispatch).toHaveBeenCalledWith({
      payload: { cx: -420, cy: -210, r: 0 },
      type: Actions.SET_CURRENT_POINT_DATA
    });
  });

  it("sets drawn point radius", async () => {
    const p = fakeProps();
    p.designer.currentPoint = { cx: -420, cy: -210, r: 0 };
    const wrapper = shallow(<GardenMap {...p} />);
    expect(wrapper.state()).toEqual({});
    mockPath = "/app/designer/plants/create_point/";
    wrapper.setState({ isDragging: true });
    await wrapper.find("#drop-area-svg").simulate("mouseMove", {
      pageX: 10, pageY: 20
    });
    expect(p.dispatch).toHaveBeenCalledWith({
      payload: { cx: -420, cy: -210, r: 22 },
      type: Actions.SET_CURRENT_POINT_DATA
    });
  });

  it("lays eggs", () => {
    setEggStatus(EggKeys.BRING_ON_THE_BUGS, "");
    setEggStatus(EggKeys.BUGS_ARE_STILL_ALIVE, "");
    const noEggs = shallow(<GardenMap {...fakeProps()} />);
    expect(noEggs.find("Bugs").length).toEqual(0);
    setEggStatus(EggKeys.BRING_ON_THE_BUGS, "true");
    setEggStatus(EggKeys.BUGS_ARE_STILL_ALIVE, "");
    const eggs = shallow(<GardenMap {...fakeProps()} />);
    expect(eggs.find("Bugs").length).toEqual(1);
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
    mockPath = "/app/designer/plants/crop_search/mint";
    expectHandledDragOver();
  });

  it(".drop-area: handles drag over (click-to-add mode)", () => {
    mockPath = "/app/designer/plants/crop_search/mint/add";
    expectHandledDragOver();
  });

  it(".drop-area: handles drag start", () => {
    mockPath = "/app/designer/plants";
    const wrapper = shallow(<GardenMap {...fakeProps()} />);
    const e = { preventDefault: jest.fn() };
    wrapper.find(".drop-area").simulate("dragStart", e);
    expect(e.preventDefault).toHaveBeenCalled();
  });

  it(".drop-area: handles drag enter", () => {
    mockPath = "/app/designer/plants/crop_search";
    const wrapper = shallow(<GardenMap {...fakeProps()} />);
    const e = { preventDefault: jest.fn() };
    wrapper.find(".drop-area").simulate("dragEnter", e);
    expect(e.preventDefault).toHaveBeenCalled();
  });

  it("calls unselectPlant on unmount", () => {
    const p = fakeProps();
    const wrapper = shallow(<GardenMap {...p} />);
    // tslint:disable-next-line:no-any
    const instance = wrapper.instance() as any;
    instance.componentWillUnmount();
    expect(unselectPlant).toHaveBeenCalled();
  });
});
