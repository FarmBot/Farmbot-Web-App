const lodash = require("lodash");
lodash.debounce = jest.fn(x => x);

jest.mock("../../history", () => ({ history: { push: jest.fn() } }));

import React from "react";
import {
  cropSearchUrl, mapStateToProps, RawCropCatalog as CropCatalog,
} from "../crop_catalog";
import { mount, shallow } from "enzyme";
import { CropCatalogProps } from "../../farm_designer/interfaces";
import { Actions } from "../../constants";
import { history } from "../../history";
import {
  fakeCropLiveSearchResult,
} from "../../__test_support__/fake_crop_search_result";
import { SearchField } from "../../ui/search_field";
import { fakeState } from "../../__test_support__/fake_state";

describe("cropSearchUrl()", () => {
  it("returns url", () => {
    expect(cropSearchUrl()).toEqual("/app/designer/plants/crop_search/");
    expect(cropSearchUrl("mint")).toEqual("/app/designer/plants/crop_search/mint");
  });
});

describe("<CropCatalog />", () => {
  const fakeProps = (): CropCatalogProps => ({
    dispatch: jest.fn(),
    openfarmSearch: jest.fn(() => jest.fn()),
    cropSearchResults: [],
    cropSearchQuery: undefined,
    cropSearchInProgress: false,
  });

  it("renders", () => {
    const wrapper = mount(<CropCatalog {...fakeProps()} />);
    expect(wrapper.text()).toContain("Choose a crop");
    expect(wrapper.find("input").props().placeholder)
      .toEqual("Search OpenFarm...");
  });

  it("handles search term change", () => {
    const p = fakeProps();
    const wrapper = shallow(<CropCatalog {...p} />);
    wrapper.find(SearchField).simulate("change", "apple");
    expect(p.dispatch).toHaveBeenCalledWith({
      payload: "apple",
      type: Actions.SEARCH_QUERY_CHANGE
    });
    // Requires lodash.debouce to be mocked
    expect(p.openfarmSearch).toHaveBeenCalledWith("apple");
  });

  it("goes back", () => {
    const wrapper = mount(<CropCatalog {...fakeProps()} />);
    wrapper.find("i").first().simulate("click");
    expect(history.push).toHaveBeenCalledWith("/app/designer/plants");
  });

  it("search term is too short", () => {
    const p = fakeProps();
    p.cropSearchQuery = "ab";
    const wrapper = mount(<CropCatalog {...p} />);
    expect(wrapper.text().toLowerCase()).toContain("too short");
  });

  it("shows result update spinner", () => {
    const p = fakeProps();
    p.cropSearchQuery = "abc";
    p.cropSearchInProgress = true;
    p.cropSearchResults = [fakeCropLiveSearchResult()];
    const wrapper = mount(<CropCatalog {...p} />);
    expect(wrapper.find(".spinner").length).toEqual(1);
  });
});

describe("mapStateToProps()", () => {
  it("returns props", () => {
    const props = mapStateToProps(fakeState());
    expect(props.cropSearchInProgress).toEqual(false);
  });
});
