jest.mock("../../point_groups/actions", () => ({
  createGroup: jest.fn(),
}));

jest.mock("../../api/delete_points", () => ({
  deletePoints: jest.fn(),
}));

import { PopoverProps } from "../../ui/popover";
jest.mock("../../ui/popover", () => ({
  Popover: ({ target, content }: PopoverProps) => <div>{target}{content}</div>,
}));

let mockValue: number | boolean = 0;
jest.mock("../../config_storage/actions", () => ({
  setWebAppConfigValue: jest.fn(),
  getWebAppConfigValue: jest.fn(x => { x(); return () => mockValue; }),
}));

import React from "react";
import {
  RawPlants as Plants, PlantInventoryProps, mapStateToProps, PanelSection,
  PanelSectionProps,
} from "../plant_inventory";
import { mount, shallow } from "enzyme";
import {
  fakePlant, fakePointGroup, fakeSavedGarden, fakeWebAppConfig,
} from "../../__test_support__/fake_state/resources";
import { fakeState } from "../../__test_support__/fake_state";
import { SearchField } from "../../ui/search_field";
import { Actions } from "../../constants";
import { createGroup } from "../../point_groups/actions";
import { DEFAULT_CRITERIA } from "../../point_groups/criteria/interfaces";
import { deletePoints } from "../../api/delete_points";
import { Panel } from "../../farm_designer/panel_header";
import { plantsPanelState } from "../../__test_support__/panel_state";
import { Path } from "../../internal_urls";
import { buildResourceIndex } from "../../__test_support__/resource_index_builder";
import { changeBlurableInput } from "../../__test_support__/helpers";
import { setWebAppConfigValue } from "../../config_storage/actions";
import { NumericSetting } from "../../session_keys";

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
    getConfigValue: () => 0,
  });

  it("renders", () => {
    const wrapper = mount(<Plants {...fakeProps()} />);
    ["Strawberry Plant 1",
      "planned"].map(string => expect(wrapper.text()).toContain(string));
    expect(wrapper.find("input").first().props().placeholder)
      .toEqual("Search your plants...");
  });

  it("changes number setting", () => {
    mockValue = 0;
    const p = fakeProps();
    const wrapper = mount(<Plants {...p} />);
    changeBlurableInput(wrapper, "100", 1);
    expect(setWebAppConfigValue).toHaveBeenCalledWith(
      NumericSetting.default_plant_depth, 100);
  });

  it("renders groups", () => {
    const p = fakeProps();
    const group1 = fakePointGroup();
    group1.body.name = "Plant Group";
    group1.body.criteria.string_eq = { pointer_type: ["Plant"] };
    const group2 = fakePointGroup();
    group2.body.name = "Weed Group";
    group2.body.criteria.string_eq = { pointer_type: ["Weed"] };
    const group3 = fakePointGroup();
    group3.body.name = "Weed Group";
    group3.body.criteria.string_eq = {};
    p.groups = [group1, group2, group3];
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
    wrapper.instance().navigate = jest.fn();
    wrapper.instance().navigateById(1)();
    expect(wrapper.instance().navigate).toHaveBeenCalledWith(Path.groups(1));
  });

  it("adds new group", () => {
    const wrapper = shallow(<Plants {...fakeProps()} />);
    wrapper.find(PanelSection).first().props().addNew();
    expect(createGroup).toHaveBeenCalledWith({
      criteria: { ...DEFAULT_CRITERIA, string_eq: { pointer_type: ["Plant"] } },
      navigate: expect.anything(),
    });
  });

  it("adds new saved garden", () => {
    const wrapper = shallow<Plants>(<Plants {...fakeProps()} />);
    wrapper.instance().navigate = jest.fn();
    wrapper.find(PanelSection).at(1).props().addNew();
    expect(wrapper.instance().navigate).toHaveBeenCalledWith(
      Path.savedGardens("add"));
  });

  it("adds new plant", () => {
    const wrapper = shallow<Plants>(<Plants {...fakeProps()} />);
    wrapper.instance().navigate = jest.fn();
    wrapper.find(PanelSection).last().props().addNew();
    expect(wrapper.instance().navigate).toHaveBeenCalledWith(Path.cropSearch());
  });

  it("deletes all plants", () => {
    window.confirm = () => true;
    const p = fakeProps();
    p.plantsPanelState.plants = true;
    const wrapper = mount(<Plants {...p} />);
    const plantsSection = wrapper.find(PanelSection).at(2);
    expect(plantsSection.text().toLowerCase()).toContain("delete all");
    plantsSection.find("button").simulate("click");
    expect(deletePoints).toHaveBeenCalledWith("plants", { pointer_type: "Plant" });
  });

  it("doesn't show delete all button", () => {
    window.confirm = () => true;
    const p = fakeProps();
    p.plantsPanelState.plants = true;
    p.openedSavedGarden = 1;
    const wrapper = mount(<Plants {...p} />);
    const plantsSection = wrapper.find(PanelSection).at(2);
    expect(plantsSection.text().toLowerCase()).not.toContain("delete all");
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
    wrapper.instance().navigate = jest.fn();
    wrapper.setState({ searchTerm: "mint" });
    const noResult = mount(wrapper.instance().noResult);
    noResult.find("a").first().simulate("click");
    expect(p.dispatch).toHaveBeenCalledWith({
      type: Actions.SEARCH_QUERY_CHANGE, payload: "mint",
    });
    expect(wrapper.instance().navigate).toHaveBeenCalledWith(Path.cropSearch());
  });
});

describe("mapStateToProps()", () => {
  it("returns props", () => {
    mockValue = false;
    const state = fakeState();
    const webAppConfig = fakeWebAppConfig();
    webAppConfig.body.show_plants = false;
    state.resources = buildResourceIndex([webAppConfig]);
    state.resources.consumers.farm_designer.hoveredPlantListItem = "uuid";
    const result = mapStateToProps(state);
    expect(result.hoveredPlantListItem).toEqual("uuid");
    expect(result.getConfigValue("show_plants")).toEqual(false);
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

  it("calls add", () => {
    const p = fakeProps();
    const wrapper = mount(<PanelSection {...p} />);
    wrapper.find(".fb-button").first().simulate("click");
    expect(p.addNew).toHaveBeenCalled();
  });
});
