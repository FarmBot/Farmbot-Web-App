let mockPath = "";
jest.mock("../../history", () => ({
  getPathArray: jest.fn(() => mockPath.split("/")),
  push: jest.fn(),
}));

jest.mock("../../api/crud", () => ({ initSave: jest.fn(), init: jest.fn() }));

jest.mock("../../farm_designer/map/actions", () => ({
  unselectPlant: jest.fn(() => jest.fn()),
  setDragIcon: jest.fn(),
}));

import React from "react";
import {
  RawCropInfo as CropInfo, searchForCurrentCrop, mapStateToProps,
  getCropHeaderProps,
  CurveInfo,
} from "../crop_info";
import { mount, shallow } from "enzyme";
import { CropInfoProps } from "../../farm_designer/interfaces";
import { initSave } from "../../api/crud";
import { push } from "../../history";
import {
  fakeCropLiveSearchResult,
} from "../../__test_support__/fake_crop_search_result";
import { unselectPlant } from "../../farm_designer/map/actions";
import { svgToUrl } from "../../open_farm/icons";
import { fakeState } from "../../__test_support__/fake_state";
import { Actions } from "../../constants";
import { clickButton } from "../../__test_support__/helpers";
import { Path } from "../../internal_urls";
import {
  fakeCurve, fakePlant, fakeWebAppConfig,
} from "../../__test_support__/fake_state/resources";
import { buildResourceIndex } from "../../__test_support__/resource_index_builder";
import { fakeBotSize } from "../../__test_support__/fake_bot_data";
import { CurveInfoProps } from "../../curves/interfaces";
import { CurveType } from "../../curves/templates";
import { formatPlantInfo } from "../map_state_to_props";
import { FBSelect } from "../../ui";

describe("<CropInfo />", () => {
  const fakeProps = (): CropInfoProps => {
    const cropSearchResult = fakeCropLiveSearchResult();
    cropSearchResult.crop.svg_icon = "fake_mint_svg";
    cropSearchResult.crop.row_spacing = 100;
    return {
      openfarmCropFetch: jest.fn(),
      dispatch: jest.fn(),
      cropSearchQuery: undefined,
      cropSearchResults: [cropSearchResult],
      cropSearchInProgress: false,
      openedSavedGarden: undefined,
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
    mockPath = Path.mock(Path.cropSearch("mint"));
    const p = fakeProps();
    p.cropSearchResults[0].companions = [];
    const wrapper = mount(<CropInfo {...p} />);
    expect(wrapper.text()).toContain("Mint");
    expect(wrapper.text()).toContain("Drag and drop into map");
    expect(wrapper.text()).toContain("Row Spacing1000mm");
    expect(wrapper.find("img").at(1).props().src)
      .toEqual(svgToUrl("fake_mint_svg"));
  });

  it("returns to crop search", () => {
    mockPath = Path.mock(Path.cropSearch("mint"));
    const p = fakeProps();
    const wrapper = mount(<CropInfo {...p} />);
    wrapper.find(".back-arrow").simulate("click");
    expect(push).toHaveBeenCalledWith(Path.cropSearch());
    expect(p.dispatch).toHaveBeenCalledWith({
      type: Actions.SEARCH_QUERY_CHANGE, payload: "mint",
    });
  });

  it("doesn't change search query", () => {
    mockPath = Path.mock(Path.cropSearch("mint"));
    const p = fakeProps();
    p.cropSearchQuery = "mint";
    const wrapper = mount(<CropInfo {...p} />);
    wrapper.find(".back-arrow").simulate("click");
    expect(push).toHaveBeenCalledWith(Path.cropSearch());
    expect(p.dispatch).not.toHaveBeenCalledWith({
      type: Actions.SEARCH_QUERY_CHANGE, payload: "mint",
    });
  });

  it("disables 'add plant @ UTM' button", () => {
    const wrapper = mount(<CropInfo {...fakeProps()} />);
    expect(wrapper.text()).toContain("location (unknown)");
  });

  it("adds a plant at the current bot position", () => {
    const p = fakeProps();
    p.botPosition = { x: 100, y: 200, z: undefined };
    const wrapper = mount(<CropInfo {...p} />);
    clickButton(wrapper, 0, "location (100, 200)", { partial_match: true });
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
    clickButton(wrapper, 0, "location (unknown)", { partial_match: true });
    expect(initSave).not.toHaveBeenCalled();
  });

  it("renders cm in mm", () => {
    const p = fakeProps();
    p.cropSearchResults[0].crop.spread = 1234;
    const wrapper = mount(<CropInfo {...p} />);
    expect(wrapper.text().toLowerCase()).toContain("12340mm");
  });

  it("renders missing values", () => {
    const p = fakeProps();
    p.cropSearchResults[0].crop.svg_icon = undefined;
    p.cropSearchResults[0].crop.row_spacing = undefined;
    p.cropSearchResults[0].crop.common_names = [];
    const wrapper = mount(<CropInfo {...p} />);
    expect(wrapper.text().toLowerCase()).toContain("iconnot available");
    expect(wrapper.text().toLowerCase()).toContain("spacingnot available");
    expect(wrapper.text().toLowerCase()).toContain("common namesnot available");
  });

  it("handles string of names", () => {
    const p = fakeProps();
    p.cropSearchResults[0].crop.common_names = "names" as unknown as string[];
    const wrapper = mount(<CropInfo {...p} />);
    expect(wrapper.text().toLowerCase()).toContain("common namesnames");
  });

  it("navigates to companion plant", () => {
    mockPath = Path.mock(Path.cropSearch("mint"));
    const p = fakeProps();
    p.openfarmCropFetch = jest.fn(() => jest.fn());
    p.dispatch = jest.fn(x => { x(); return Promise.resolve(); });
    const wrapper = mount(<CropInfo {...p} />);
    jest.clearAllMocks();
    expect(wrapper.text().toLowerCase()).toContain("strawberry");
    const companion = wrapper.find("a").at(1);
    expect(companion.text()).toEqual("Strawberry");
    companion.simulate("click");
    expect(p.openfarmCropFetch).toHaveBeenCalledWith("strawberry");
    expect(push).toHaveBeenCalledWith(Path.cropSearch("strawberry"));
  });

  it("drags companion plant", () => {
    jest.useFakeTimers();
    mockPath = Path.mock(Path.cropSearch("mint"));
    const p = fakeProps();
    const wrapper = mount(<CropInfo {...p} />);
    jest.clearAllMocks();
    expect(wrapper.text().toLowerCase()).toContain("strawberry");
    const companion = wrapper.find("a").at(1);
    expect(companion.text()).toEqual("Strawberry");
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
    mockPath = Path.mock(Path.cropSearch("mint"));
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
    expect(wrapper.text()).toContain("Water: 0L over 2 days");
  });
});

describe("searchForCurrentCrop()", () => {
  it("searches", () => {
    mockPath = Path.mock(Path.cropSearch("mint"));
    const dispatch = jest.fn();
    const fakeOFSearch = jest.fn((_) => jest.fn());
    searchForCurrentCrop(fakeOFSearch)(dispatch);
    expect(fakeOFSearch).toHaveBeenCalledWith("mint");
    expect(unselectPlant).toHaveBeenCalled();
  });
});

describe("getCropHeaderProps()", () => {
  it("handles missing crop", () => {
    mockPath = Path.mock(Path.cropSearch());
    const result = getCropHeaderProps({ cropSearchResults: [] });
    expect(result.result.crop.name).toEqual("");
  });
});

describe("mapStateToProps()", () => {
  it("returns props", () => {
    const state = fakeState();
    const webAppConfig = fakeWebAppConfig();
    webAppConfig.body.show_plants = false;
    state.resources = buildResourceIndex([webAppConfig]);
    state.resources.consumers.farm_designer.cropSearchInProgress = true;
    state.bot.hardware.location_data.position = { x: 1, y: 2, z: 3 };
    const props = mapStateToProps(state);
    expect(props.cropSearchInProgress).toEqual(true);
    expect(props.botPosition).toEqual({ x: 1, y: 2, z: 3 });
    expect(props.getConfigValue("show_plants")).toEqual(false);
  });
});

describe("<CurveInfo />", () => {
  const fakeProps = (): CurveInfoProps => ({
    curveType: CurveType.water,
    dispatch: jest.fn(),
    curve: fakeCurve(),
    sourceFbosConfig: () => ({ value: 0, consistent: true }),
    botSize: fakeBotSize(),
    updatePlant: jest.fn(),
    plant: formatPlantInfo(fakePlant()),
    curves: [],
  });

  it("displays curve", () => {
    const p = fakeProps();
    const curve = fakeCurve();
    curve.body.type = "water";
    curve.body.id = 1;
    p.curve = curve;
    const wrapper = mount(<CurveInfo {...p} />);
    expect(wrapper.text().toLowerCase()).not.toContain("none");
  });

  it("doesn't display curve", () => {
    const p = fakeProps();
    p.curve = undefined;
    const wrapper = mount(<CurveInfo {...p} />);
    expect(wrapper.text().toLowerCase()).toContain("none");
  });

  it("displays curve name", () => {
    const p = fakeProps();
    const curve = fakeCurve();
    curve.body.type = "water";
    curve.body.id = 1;
    p.curve = curve;
    p.updatePlant = undefined;
    p.plant = undefined;
    const wrapper = mount(<CurveInfo {...p} />);
    wrapper.find(".fa-caret-down").first().simulate("click");
    expect(wrapper.text().toLowerCase()).toEqual("water: 0l over 2 daysfake1dayml");
  });

  it("doesn't display curve name", () => {
    const p = fakeProps();
    p.curve = undefined;
    p.updatePlant = undefined;
    p.plant = undefined;
    const wrapper = mount(<CurveInfo {...p} />);
    wrapper.find(".fa-caret-down").first().simulate("click");
    expect(wrapper.text().toLowerCase()).toEqual("water: none");
  });

  it("changes curve", () => {
    const p = fakeProps();
    const curve = fakeCurve();
    curve.body.type = "water";
    curve.body.id = 1;
    p.curves = [curve];
    const wrapper = shallow(<CurveInfo {...p} />);
    wrapper.find(".fa-caret-down").first().simulate("click");
    wrapper.find(FBSelect).simulate("change",
      { label: "", value: 1, headingId: "water" });
    p.plant &&
      expect(p.updatePlant).toHaveBeenCalledWith(p.plant.uuid,
        { water_curve_id: 1 }, true);
  });
});
