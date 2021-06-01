jest.mock("../../open_farm/cached_crop", () => ({
  maybeGetCachedPlantIcon: jest.fn(),
}));

jest.mock("../../history", () => ({
  push: jest.fn(),
  getPathArray: () => "/app/designer/plants".split("/"),
}));

import React from "react";
import {
  RawPlants as Plants, PlantInventoryProps, mapStateToProps,
} from "../plant_inventory";
import { mount, shallow } from "enzyme";
import { fakePlant } from "../../__test_support__/fake_state/resources";
import { fakeState } from "../../__test_support__/fake_state";
import { SearchField } from "../../ui/search_field";
import { Actions } from "../../constants";
import { push } from "../../history";
import { cropSearchUrl } from "../crop_catalog";

describe("<PlantInventory />", () => {
  const fakeProps = (): PlantInventoryProps => ({
    plants: [fakePlant()],
    dispatch: jest.fn(),
    hoveredPlantListItem: undefined,
  });

  it("renders", () => {
    const wrapper = mount(<Plants {...fakeProps()} />);
    ["Strawberry Plant",
      "11 days old"].map(string => expect(wrapper.text()).toContain(string));
    expect(wrapper.find("input").props().placeholder)
      .toEqual("Search your plants...");
  });

  it("has link to crops", () => {
    const wrapper = mount(<Plants {...fakeProps()} />);
    expect(wrapper.html()).toContain("fa-plus");
    expect(wrapper.html()).toContain(cropSearchUrl());
  });

  it("changes search term", () => {
    const wrapper = shallow<Plants>(<Plants {...fakeProps()} />);
    expect(wrapper.state().searchTerm).toEqual("");
    wrapper.find(SearchField).simulate("change", "mint");
    expect(wrapper.state().searchTerm).toEqual("mint");
  });

  it("displays no results state", () => {
    const p = fakeProps();
    const wrapper = mount<Plants>(<Plants {...p} />);
    wrapper.setState({ searchTerm: "mint" });
    expect(wrapper.text().toLowerCase()).toContain("no results in your garden");
    expect(wrapper.text().toLowerCase())
      .toContain("do you want to search all crops?");
  });

  it("navigates to crop search", () => {
    const p = fakeProps();
    const wrapper = mount<Plants>(<Plants {...p} />);
    wrapper.setState({ searchTerm: "mint" });
    const noResult = mount(wrapper.instance().noResult);
    noResult.find("a").first().simulate("click");
    expect(p.dispatch).toHaveBeenCalledWith({
      type: Actions.SEARCH_QUERY_CHANGE, payload: "mint",
    });
    expect(push).toHaveBeenCalledWith(cropSearchUrl());
  });
});

describe("mapStateToProps()", () => {
  it("returns props", () => {
    const state = fakeState();
    state.resources.consumers.farm_designer.hoveredPlantListItem = "uuid";
    const result = mapStateToProps(state);
    expect(result.hoveredPlantListItem).toEqual("uuid");
  });
});
