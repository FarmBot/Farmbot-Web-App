let mockPath = "";
jest.mock("../../history", () => ({
  getPathArray: jest.fn(() => { return mockPath.split("/"); }),
  history: { push: jest.fn() }
}));

jest.mock("../../api/crud", () => ({ initSave: jest.fn() }));

jest.mock("../../farm_designer/map/actions", () => ({
  unselectPlant: jest.fn(() => jest.fn()),
  setDragIcon: jest.fn(),
}));

import React from "react";
import {
  RawCropInfo as CropInfo, searchForCurrentCrop, mapStateToProps,
  getCropHeaderProps,
} from "../crop_info";
import { mount } from "enzyme";
import { CropInfoProps } from "../../farm_designer/interfaces";
import { initSave } from "../../api/crud";
import { history } from "../../history";
import {
  fakeCropLiveSearchResult,
} from "../../__test_support__/fake_crop_search_result";
import { unselectPlant } from "../../farm_designer/map/actions";
import { svgToUrl } from "../../open_farm/icons";
import { fakeState } from "../../__test_support__/fake_state";
import { Actions } from "../../constants";
import { cropSearchUrl } from "../crop_catalog";
import { clickButton } from "../../__test_support__/helpers";

describe("<CropInfo />", () => {
  const fakeProps = (): CropInfoProps => {
    const cropSearchResult = fakeCropLiveSearchResult();
    cropSearchResult.crop.svg_icon = "fake_mint_svg";
    cropSearchResult.crop.row_spacing = 100;
    return {
      openfarmSearch: jest.fn(),
      dispatch: jest.fn(),
      cropSearchQuery: undefined,
      cropSearchResults: [cropSearchResult],
      cropSearchInProgress: false,
      openedSavedGarden: undefined,
      botPosition: { x: undefined, y: undefined, z: undefined },
      xySwap: false,
    };
  };

  it("renders", () => {
    mockPath = cropSearchUrl("mint");
    const wrapper = mount(<CropInfo {...fakeProps()} />);
    expect(wrapper.text()).toContain("Mint");
    expect(wrapper.text()).toContain("Drag and drop into map");
    expect(wrapper.text()).toContain("Row Spacing1000mm");
    expect(wrapper.find("img").last().props().src)
      .toEqual(svgToUrl("fake_mint_svg"));
  });

  it("returns to crop search", () => {
    mockPath = cropSearchUrl("mint");
    const p = fakeProps();
    const wrapper = mount(<CropInfo {...p} />);
    wrapper.find(".back-arrow").simulate("click");
    expect(history.push).toHaveBeenCalledWith(cropSearchUrl());
    expect(p.dispatch).toHaveBeenCalledWith({
      type: Actions.SEARCH_QUERY_CHANGE, payload: "mint",
    });
  });

  it("doesn't change search query", () => {
    mockPath = cropSearchUrl("mint");
    const p = fakeProps();
    p.cropSearchQuery = "mint";
    const wrapper = mount(<CropInfo {...p} />);
    wrapper.find(".back-arrow").simulate("click");
    expect(history.push).toHaveBeenCalledWith(cropSearchUrl());
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
});

describe("searchForCurrentCrop()", () => {
  it("searches", () => {
    mockPath = cropSearchUrl("mint");
    const dispatch = jest.fn();
    const fakeOFSearch = jest.fn((_) => jest.fn());
    searchForCurrentCrop(fakeOFSearch)(dispatch);
    expect(fakeOFSearch).toHaveBeenCalledWith("mint");
    expect(unselectPlant).toHaveBeenCalled();
  });
});

describe("getCropHeaderProps()", () => {
  it("handles missing crop", () => {
    mockPath = cropSearchUrl();
    const result = getCropHeaderProps({ cropSearchResults: [] });
    expect(result.result.crop.name).toEqual("");
  });
});

describe("mapStateToProps()", () => {
  it("returns props", () => {
    const state = fakeState();
    state.resources.consumers.farm_designer.cropSearchInProgress = true;
    state.bot.hardware.location_data.position = { x: 1, y: 2, z: 3 };
    const props = mapStateToProps(state);
    expect(props.cropSearchInProgress).toEqual(true);
    expect(props.botPosition).toEqual({ x: 1, y: 2, z: 3 });
  });
});
