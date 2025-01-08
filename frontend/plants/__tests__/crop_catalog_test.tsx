const lodash = require("lodash");
lodash.debounce = jest.fn(x => x);

import React from "react";
import {
  mapStateToProps, RawCropCatalog as CropCatalog,
} from "../crop_catalog";
import { mount, shallow } from "enzyme";
import { CropCatalogProps } from "../../farm_designer/interfaces";
import { Actions } from "../../constants";
import { fakeState } from "../../__test_support__/fake_state";
import { Path } from "../../internal_urls";
import { buildResourceIndex } from "../../__test_support__/resource_index_builder";
import { fakePlant } from "../../__test_support__/fake_state/resources";
import { SearchField } from "../../ui/search_field";

describe("<CropCatalog />", () => {
  const fakeProps = (): CropCatalogProps => ({
    dispatch: jest.fn(),
    plant: undefined,
    bulkPlantSlug: undefined,
    hoveredPlant: { plantUUID: undefined },
    cropSearchQuery: "",
  });

  it("renders", () => {
    const wrapper = mount(<CropCatalog {...fakeProps()} />);
    expect(wrapper.text()).toContain("Choose a crop");
    expect(wrapper.find("input").props().placeholder)
      .toEqual("Search crops...");
  });

  it("changes search term", () => {
    const p = fakeProps();
    const wrapper = shallow(<CropCatalog {...p} />);
    wrapper.find(SearchField).simulate("change", "term");
    expect(p.dispatch).toHaveBeenCalledWith({
      type: Actions.SEARCH_QUERY_CHANGE,
      payload: "term",
    });
  });

  it("goes back", () => {
    const wrapper = mount(<CropCatalog {...fakeProps()} />);
    wrapper.find("i").first().simulate("click");
    expect(mockNavigate).toHaveBeenCalledWith(Path.plants());
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
