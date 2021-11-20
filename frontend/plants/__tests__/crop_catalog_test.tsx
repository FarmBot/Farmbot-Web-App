const lodash = require("lodash");
lodash.debounce = jest.fn(x => x);

import React from "react";
import {
  mapStateToProps, RawCropCatalog as CropCatalog,
} from "../crop_catalog";
import { mount, shallow } from "enzyme";
import { CropCatalogProps } from "../../farm_designer/interfaces";
import { Actions } from "../../constants";
import { push } from "../../history";
import {
  fakeCropLiveSearchResult,
} from "../../__test_support__/fake_crop_search_result";
import { SearchField } from "../../ui/search_field";
import { fakeState } from "../../__test_support__/fake_state";
import { Path } from "../../internal_urls";
import { buildResourceIndex } from "../../__test_support__/resource_index_builder";
import { fakePlant } from "../../__test_support__/fake_state/resources";

describe("<CropCatalog />", () => {
  const fakeProps = (): CropCatalogProps => ({
    dispatch: jest.fn(),
    openfarmSearch: jest.fn(() => jest.fn()),
    cropSearchResults: [],
    cropSearchQuery: undefined,
    cropSearchInProgress: false,
    plant: undefined,
    bulkPlantSlug: undefined,
    hoveredPlant: { plantUUID: undefined, icon: "" },
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
    expect(push).toHaveBeenCalledWith(Path.plants());
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

  it("dispatches upon unmount", () => {
    const p = fakeProps();
    const wrapper = mount(<CropCatalog {...p} />);
    wrapper.unmount();
    expect(p.dispatch).toHaveBeenCalledWith({
      type: Actions.SET_PLANT_TYPE_CHANGE_ID, payload: undefined,
    });
  });
});

describe("mapStateToProps()", () => {
  it("returns props", () => {
    const props = mapStateToProps(fakeState());
    expect(props.cropSearchInProgress).toEqual(false);
    expect(props.plant).toEqual(undefined);
  });

  it("returns props with plant", () => {
    const state = fakeState();
    const plant = fakePlant();
    plant.body.id = 1;
    state.resources = buildResourceIndex([plant]);
    state.resources.consumers.farm_designer.plantTypeChangeId = 1;
    const props = mapStateToProps(state);
    expect(props.plant).toEqual(plant);
  });
});
