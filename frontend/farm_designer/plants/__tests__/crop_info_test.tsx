jest.mock("react-redux", () => ({ connect: jest.fn() }));

let mockPath = "";
jest.mock("../../../history", () => ({
  getPathArray: jest.fn(() => { return mockPath.split("/"); }),
  history: { push: jest.fn() }
}));

jest.mock("../../../api/crud", () => ({
  initSave: jest.fn()
}));

jest.mock("../../actions", () => ({
  unselectPlant: jest.fn(() => jest.fn()),
  setDragIcon: jest.fn(),
}));

import * as React from "react";
import { CropInfo, searchForCurrentCrop } from "../crop_info";
import { mount } from "enzyme";
import { CropInfoProps } from "../../interfaces";
import { initSave } from "../../../api/crud";
import { history } from "../../../history";
import {
  fakeCropLiveSearchResult
} from "../../../__test_support__/fake_crop_search_result";
import { unselectPlant } from "../../actions";
import { svgToUrl } from "../../../open_farm/icons";

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
    };
  };

  it("renders", () => {
    mockPath = "/app/designer/plants/crop_search/mint";
    const wrapper = mount(<CropInfo {...fakeProps()} />);
    expect(wrapper.text()).toContain("Mint");
    expect(wrapper.text()).toContain("Drag and drop into map");
    expect(wrapper.text()).toContain("Row Spacing1000mm");
    expect(wrapper.find("img").last().props().src)
      .toEqual(svgToUrl("fake_mint_svg"));
  });

  it("navigates to /add", () => {
    mockPath = "/app/designer/plants/crop_search/mint";
    const wrapper = mount(<CropInfo {...fakeProps()} />);
    wrapper.find(".right-button").simulate("click");
    expect(history.push).toHaveBeenCalledWith(
      "/app/designer/plants/crop_search/mint/add");
  });

  it("returns to crop search", () => {
    mockPath = "/app/designer/plants/crop_search/mint";
    const wrapper = mount(<CropInfo {...fakeProps()} />);
    wrapper.find(".back-arrow").simulate("click");
    expect(history.push).toHaveBeenCalledWith(
      "/app/designer/plants/crop_search/");
  });

  it("disables 'add plant @ UTM' button", () => {
    const wrapper = mount(<CropInfo {...fakeProps()} />);
    expect(wrapper.text()).toContain("location (unknown)");
  });

  it("adds a plant at the current bot position", () => {
    const p = fakeProps();
    p.botPosition = { x: 100, y: 200, z: undefined };
    const wrapper = mount(<CropInfo {...p} />);
    const button = wrapper.find("button").last();
    expect(button.text()).toContain("location (100, 200)");
    button.simulate("click");
    expect(initSave).toHaveBeenCalledWith("Point",
      expect.objectContaining({
        name: "Mint",
        x: 100,
        y: 200,
        z: 0
      }));
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
    expect(wrapper.text().toLowerCase()).toContain("iconnot set");
    expect(wrapper.text().toLowerCase()).toContain("spacingnot set");
    expect(wrapper.text().toLowerCase()).toContain("common namesnot set");
  });
});

describe("searchForCurrentCrop()", () => {
  it("searches", () => {
    mockPath = "/app/designer/plants/crop_search/mint";
    const dispatch = jest.fn();
    const fakeOFSearch = jest.fn(() => jest.fn());
    searchForCurrentCrop(fakeOFSearch)(dispatch);
    expect(fakeOFSearch).toHaveBeenCalledWith("mint");
    expect(unselectPlant).toHaveBeenCalled();
  });
});
