import React from "react";
import {
  RawCropInfo as CropInfo, mapStateToProps,
} from "../crop_info";
import { mount, shallow } from "enzyme";
import { CropInfoProps } from "../../farm_designer/interfaces";
import { initSave } from "../../api/crud";
import * as crud from "../../api/crud";
import * as mapActions from "../../farm_designer/map/actions";
import { fakeState } from "../../__test_support__/fake_state";
import { Actions } from "../../constants";
import { Path } from "../../internal_urls";
import {
  fakeCurve, fakePlant, fakeWebAppConfig,
} from "../../__test_support__/fake_state/resources";
import { buildResourceIndex } from "../../__test_support__/resource_index_builder";
import { fakeBotSize } from "../../__test_support__/fake_bot_data";
import { fakeDesignerState } from "../../__test_support__/fake_designer_state";
import { CurveType } from "../../curves/templates";
import { changeCurve, findCurve } from "../curve_info";
import { BlurableInput, FBSelect } from "../../ui";
import { mockDispatch } from "../../__test_support__/fake_dispatch";

let initSaveSpy: jest.SpyInstance;
let initSpy: jest.SpyInstance;
let unselectPlantSpy: jest.SpyInstance;
let setDragIconSpy: jest.SpyInstance;

beforeEach(() => {
  initSaveSpy = jest.spyOn(crud, "initSave").mockImplementation(jest.fn());
  initSpy = jest.spyOn(crud, "init").mockImplementation(jest.fn());
  unselectPlantSpy = jest.spyOn(mapActions, "unselectPlant")
    .mockImplementation(jest.fn(() => jest.fn()));
  setDragIconSpy = jest.spyOn(mapActions, "setDragIcon")
    .mockImplementation(jest.fn());
});

afterEach(() => {
  initSaveSpy.mockRestore();
  initSpy.mockRestore();
  unselectPlantSpy.mockRestore();
  setDragIconSpy.mockRestore();
});

describe("<CropInfo />", () => {
  const fakeProps = (): CropInfoProps => {
    const designer = fakeDesignerState();
    return {
      dispatch: jest.fn(() => Promise.resolve()),
      designer,
      botPosition: { x: undefined, y: undefined, z: undefined },
      xySwap: false,
      getConfigValue: jest.fn(),
      sourceFbosConfig: () => ({ value: 0, consistent: true }),
      botSize: fakeBotSize(),
      curves: [],
      plants: [],
    };
  };

  it("renders", () => {
    location.pathname = Path.mock(Path.cropSearch("mint"));
    const p = fakeProps();
    const wrapper = mount(<CropInfo {...p} />);
    expect(wrapper.text()).toContain("Mint");
    expect(wrapper.text()).toContain("Row Spacing");
    expect(wrapper.find("img").at(0).props().src)
      .toEqual("/crops/icons/mint.avif");
  });

  it("returns to crop search", () => {
    location.pathname = Path.mock(Path.cropSearch("mint"));
    const p = fakeProps();
    const wrapper = mount(<CropInfo {...p} />);
    wrapper.find(".back-arrow").simulate("click");
    expect(mockNavigate).toHaveBeenCalledWith(Path.cropSearch());
    expect(p.dispatch).toHaveBeenCalledWith({
      type: Actions.SEARCH_QUERY_CHANGE, payload: "mint",
    });
  });

  it("renders stage", () => {
    location.pathname = Path.mock(Path.cropSearch("mint"));
    const p = fakeProps();
    p.designer.cropStage = "planted";
    const wrapper = shallow(<CropInfo {...p} />);
    expect(wrapper.find(FBSelect).first().props().selectedItem).toEqual({
      label: "Planted", value: "planted",
    });
  });

  it("updates stage", () => {
    location.pathname = Path.mock(Path.cropSearch("mint"));
    const p = fakeProps();
    const wrapper = shallow(<CropInfo {...p} />);
    wrapper.find("FBSelect").first().simulate("change",
      { label: "", value: "planned" });
    expect(p.dispatch).toHaveBeenCalledWith({
      type: Actions.SET_CROP_STAGE, payload: "planned",
    });
  });

  it("renders planted at", () => {
    location.pathname = Path.mock(Path.cropSearch("mint"));
    const p = fakeProps();
    p.designer.cropPlantedAt = "2020-01-20T20:00:00.000Z";
    const wrapper = shallow(<CropInfo {...p} />);
    expect(wrapper.find(BlurableInput).first().props().value).toEqual("2020-01-20");
  });

  it("updates planted at", () => {
    location.pathname = Path.mock(Path.cropSearch("mint"));
    const p = fakeProps();
    const wrapper = shallow(<CropInfo {...p} />);
    wrapper.find("BlurableInput").first().simulate("commit",
      { currentTarget: { value: "2020-01-20T20:00:00.000Z" } });
    expect(p.dispatch).toHaveBeenCalledWith({
      type: Actions.SET_CROP_PLANTED_AT, payload: "2020-01-20T20:00:00.000Z",
    });
  });

  it("renders radius", () => {
    location.pathname = Path.mock(Path.cropSearch("mint"));
    const p = fakeProps();
    p.designer.cropRadius = 100;
    const wrapper = shallow(<CropInfo {...p} />);
    expect(wrapper.find(BlurableInput).at(1).props().value).toEqual(100);
  });

  it("updates radius", () => {
    location.pathname = Path.mock(Path.cropSearch("mint"));
    const p = fakeProps();
    const wrapper = shallow(<CropInfo {...p} />);
    wrapper.find("BlurableInput").at(1).simulate("commit",
      { currentTarget: { value: "100" } });
    expect(p.dispatch).toHaveBeenCalledWith({
      type: Actions.SET_CROP_RADIUS, payload: 100,
    });
  });

  it("updates curves", () => {
    location.pathname = Path.mock(Path.cropSearch("mint"));
    const p = fakeProps();
    mount(<CropInfo {...p} />);
    expect(p.dispatch).toHaveBeenCalledWith({
      type: Actions.SET_CROP_WATER_CURVE_ID, payload: undefined,
    });
  });

  it("doesn't change search query", () => {
    location.pathname = Path.mock(Path.cropSearch("mint"));
    const p = fakeProps();
    p.designer.cropSearchQuery = "mint";
    const wrapper = mount(<CropInfo {...p} />);
    wrapper.find(".back-arrow").simulate("click");
    expect(mockNavigate).toHaveBeenCalledWith(Path.cropSearch());
    expect(p.dispatch).not.toHaveBeenCalledWith({
      type: Actions.SEARCH_QUERY_CHANGE, payload: "mint",
    });
  });

  it("disables 'add plant @ UTM' button", () => {
    const wrapper = mount(<CropInfo {...fakeProps()} />);
    expect(wrapper.text()).toContain("location (unknown)");
  });

  it("adds a plant at the current bot position", () => {
    location.pathname = Path.mock(Path.cropSearch("mint"));
    const p = fakeProps();
    p.botPosition = { x: 100, y: 200, z: undefined };
    const wrapper = mount(<CropInfo {...p} />);
    wrapper.find("button")
      .filterWhere(button =>
        button.text().toLowerCase().includes("location (100, 200)"))
      .first()
      .simulate("click");
    expect(initSave).toHaveBeenCalledWith("Point",
      expect.objectContaining({
        name: "Mint",
        x: 100,
        y: 200,
        z: 0
      }));
  });

  it("doesn't add a plant at the current bot position", () => {
    const p = fakeProps();
    p.botPosition = { x: 100, y: undefined, z: undefined };
    const wrapper = mount(<CropInfo {...p} />);
    wrapper.find("button")
      .filterWhere(button =>
        button.text().toLowerCase().includes("location (unknown)"))
      .first()
      .simulate("click");
    expect(initSave).not.toHaveBeenCalled();
  });

  it("renders cm in mm", () => {
    location.pathname = Path.mock(Path.cropSearch("mint"));
    const p = fakeProps();
    const wrapper = mount(<CropInfo {...p} />);
    expect(wrapper.text().toLowerCase()).toContain("750mm");
  });

  it("renders missing values", () => {
    location.pathname = Path.mock(Path.cropSearch("x"));
    const p = fakeProps();
    const wrapper = mount(<CropInfo {...p} />);
    expect(wrapper.text().toLowerCase()).toContain("sowingnot available");
    expect(wrapper.text().toLowerCase()).toContain("common namesnot available");
  });

  it("handles string of names", () => {
    location.pathname = Path.mock(Path.cropSearch("mint"));
    const p = fakeProps();
    const wrapper = mount(<CropInfo {...p} />);
    expect(wrapper.text().toLowerCase()).toContain("common namesmint, spearmint");
  });

  it("navigates to companion plant", () => {
    location.pathname = Path.mock(Path.cropSearch("mint"));
    const p = fakeProps();
    p.dispatch = mockDispatch(jest.fn(), () => fakeState());
    const wrapper = mount(<CropInfo {...p} />);
    jest.clearAllMocks();
    expect(wrapper.text().toLowerCase()).toContain("green zebra tomato");
    const companion = wrapper.find("a")
      .filterWhere(link => link.text() === "Green Zebra Tomato")
      .first();
    expect(companion.text()).toEqual("Green Zebra Tomato");
    companion.simulate("click");
    expect(mockNavigate).toHaveBeenCalledWith(
      Path.cropSearch("green-zebra-tomato"));
  });

  it("drags companion plant", () => {
    jest.useFakeTimers();
    location.pathname = Path.mock(Path.cropSearch("mint"));
    const p = fakeProps();
    const wrapper = mount(<CropInfo {...p} />);
    jest.clearAllMocks();
    expect(wrapper.text().toLowerCase()).toContain("green zebra tomato");
    const companion = wrapper.find("a")
      .filterWhere(link => link.text() === "Green Zebra Tomato")
      .first();
    expect(companion.text()).toEqual("Green Zebra Tomato");
    companion.simulate("dragStart");
    expect(p.dispatch).toHaveBeenCalledWith({
      type: Actions.SET_COMPANION_INDEX,
      payload: 0,
    });
    companion.simulate("dragEnd");
    jest.runAllTimers();
    expect(p.dispatch).toHaveBeenCalledWith({
      type: Actions.SET_COMPANION_INDEX,
      payload: undefined,
    });
  });

  it("renders curves", () => {
    location.pathname = Path.mock(Path.cropSearch("mint"));
    const p = fakeProps();
    const curve = fakeCurve();
    curve.body.type = "water";
    curve.body.id = 1;
    p.curves = [curve];
    const plant = fakePlant();
    plant.body.openfarm_slug = "mint";
    plant.body.water_curve_id = 1;
    p.plants = [plant];
    const wrapper = mount(<CropInfo {...p} />);
    expect(wrapper.text()).toContain("Mint");
    expect(wrapper.text()).toContain("Water");
  });
});

describe("mapStateToProps()", () => {
  it("returns props", () => {
    const state = fakeState();
    const webAppConfig = fakeWebAppConfig();
    webAppConfig.body.show_plants = false;
    state.resources = buildResourceIndex([webAppConfig]);
    state.bot.hardware.location_data.position = { x: 1, y: 2, z: 3 };
    const props = mapStateToProps(state);
    expect(props.botPosition).toEqual({ x: 1, y: 2, z: 3 });
    expect(props.getConfigValue("show_plants")).toEqual(false);
  });
});

describe("findCurve()", () => {
  it("finds curve", () => {
    const curve = fakeCurve();
    curve.body.id = 1;
    const designer = fakeDesignerState();
    designer.cropWaterCurveId = curve.body.id;
    const result = findCurve([curve], designer)(CurveType.water);
    expect(result).toEqual(curve);
  });
});

describe("changeCurve()", () => {
  it("changes curve", () => {
    const dispatch = jest.fn();
    changeCurve(dispatch)(1, CurveType.water);
    expect(dispatch).toHaveBeenCalledWith({
      type: Actions.SET_CROP_WATER_CURVE_ID, payload: 1,
    });
  });
});
