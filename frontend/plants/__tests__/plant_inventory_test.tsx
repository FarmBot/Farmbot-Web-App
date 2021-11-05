jest.mock("../../open_farm/cached_crop", () => ({
  maybeGetCachedPlantIcon: jest.fn(),
}));

jest.mock("../../history", () => ({
  push: jest.fn(),
  getPathArray: () => "/app/designer/plants".split("/"),
}));

jest.mock("../../point_groups/actions", () => ({
  createGroup: jest.fn(),
}));

jest.mock("../../api/delete_points", () => ({
  deletePoints: jest.fn(),
}));

import React from "react";
import {
  RawPlants as Plants, PlantInventoryProps, mapStateToProps, PanelSection,
  PanelSectionProps,
} from "../plant_inventory";
import { mount, shallow } from "enzyme";
import {
  fakePlant, fakePointGroup, fakeSavedGarden,
} from "../../__test_support__/fake_state/resources";
import { fakeState } from "../../__test_support__/fake_state";
import { SearchField } from "../../ui/search_field";
import { Actions } from "../../constants";
import { push } from "../../history";
import { cropSearchUrl } from "../crop_catalog";
import { createGroup } from "../../point_groups/actions";
import { DEFAULT_CRITERIA } from "../../point_groups/criteria/interfaces";
import { deletePoints } from "../../api/delete_points";
import { Panel } from "../../farm_designer/panel_header";
import { plantsPanelState } from "../../__test_support__/panel_state";

describe("<PlantInventory />", () => {
  const fakeProps = (): PlantInventoryProps => ({
    plants: [fakePlant()],
    dispatch: jest.fn(),
    hoveredPlantListItem: undefined,
    groups: [],
    allPoints: [],
    savedGardens: [],
    plantTemplates: [],
    plantPointerCount: 0,
    openedSavedGarden: undefined,
    plantsPanelState: plantsPanelState(),
  });

  it("renders", () => {
    const wrapper = mount(<Plants {...fakeProps()} />);
    ["Strawberry Plant",
      "11 days old"].map(string => expect(wrapper.text()).toContain(string));
    expect(wrapper.find("input").props().placeholder)
      .toEqual("Search your plants...");
  });

  it("renders groups", () => {
    const p = fakeProps();
    const group1 = fakePointGroup();
    group1.body.name = "Plant Group";
    group1.body.criteria.string_eq = { pointer_type: ["Plant"] };
    const group2 = fakePointGroup();
    group2.body.name = "Weed Group";
    group2.body.criteria.string_eq = { pointer_type: ["Weed"] };
    p.groups = [group1, group2];
    const wrapper = mount(<Plants {...p} />);
    expect(wrapper.text()).toContain("Groups (1)");
  });

  it("renders saved gardens", () => {
    const p = fakeProps();
    const savedGarden = fakeSavedGarden();
    savedGarden.body.name = "Saved Garden";
    p.savedGardens = [savedGarden];
    const wrapper = mount(<Plants {...p} />);
    expect(wrapper.text()).toContain("Gardens (1)");
  });

  it("toggles section", () => {
    const p = fakeProps();
    const wrapper = shallow<Plants>(<Plants {...p} />);
    wrapper.instance().toggleOpen("groups")();
    expect(p.dispatch).toHaveBeenCalledWith({
      type: Actions.TOGGLE_PLANTS_PANEL_OPTION,
      payload: "groups",
    });
  });

  it("navigates to group", () => {
    const wrapper = shallow<Plants>(<Plants {...fakeProps()} />);
    wrapper.instance().navigate(1)();
    expect(push).toHaveBeenCalledWith("/app/designer/groups/1");
  });

  it("adds new group", () => {
    const wrapper = shallow(<Plants {...fakeProps()} />);
    wrapper.find(PanelSection).first().props().addNew();
    expect(createGroup).toHaveBeenCalledWith({
      criteria: { ...DEFAULT_CRITERIA, string_eq: { pointer_type: ["Plant"] } }
    });
  });

  it("adds new saved garden", () => {
    const wrapper = shallow(<Plants {...fakeProps()} />);
    wrapper.find(PanelSection).at(1).props().addNew();
    expect(push).toHaveBeenCalledWith("/app/designer/gardens/add");
  });

  it("adds new plant", () => {
    const wrapper = shallow(<Plants {...fakeProps()} />);
    wrapper.find(PanelSection).last().props().addNew();
    expect(push).toHaveBeenCalledWith("/app/designer/plants/crop_search/");
  });

  it("deletes all plants", () => {
    window.confirm = () => true;
    const wrapper = shallow(<Plants {...fakeProps()} />);
    wrapper.find(PanelSection).at(1).find("button").simulate("click");
    expect(deletePoints).toHaveBeenCalledWith("plants", { pointer_type: "Plant" });
  });

  it("has link to crops", () => {
    const wrapper = mount(<Plants {...fakeProps()} />);
    expect(wrapper.html()).toContain("fa-plus");
    expect(wrapper.html()).toContain("plus-plant");
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

describe("<PanelSection />", () => {
  const fakeProps = (): PanelSectionProps => ({
    panel: Panel.Plants,
    isOpen: true,
    toggleOpen: jest.fn(),
    itemCount: 1,
    title: "title",
    addNew: jest.fn(),
    addTitle: "add",
    addClassName: "plus",
    children: <p>text</p>,
  });

  it("renders open", () => {
    const wrapper = mount(<PanelSection {...fakeProps()} />);
    expect(wrapper.text().toLowerCase()).toContain("text");
  });
});
