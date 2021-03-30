jest.mock("../../api/crud", () => ({
  destroy: jest.fn(),
  edit: jest.fn(),
  save: jest.fn(),
}));

import React from "react";
import { mount, shallow } from "enzyme";
import {
  RawWeeds as Weeds, WeedsProps, mapStateToProps,
  WeedsSection, WeedsSectionProps,
} from "../weeds_inventory";
import { fakeState } from "../../__test_support__/fake_state";
import {
  fakeWeed, fakeWebAppConfig,
} from "../../__test_support__/fake_state/resources";
import { SearchField } from "../../ui/search_field";
import { PointSortMenu } from "../../farm_designer/sort_options";
import {
  buildResourceIndex,
} from "../../__test_support__/resource_index_builder";
import { BooleanSetting } from "../../session_keys";
import { destroy, edit, save } from "../../api/crud";

describe("<Weeds> />", () => {
  const fakeProps = (): WeedsProps => ({
    weeds: [],
    dispatch: jest.fn(),
    hoveredPoint: undefined,
    getConfigValue: jest.fn(),
  });

  it("renders no points", () => {
    const wrapper = mount(<Weeds {...fakeProps()} />);
    expect(wrapper.text()).toContain("No weeds yet.");
  });

  it("renders pending weeds", () => {
    const p = fakeProps();
    const weed = fakeWeed();
    weed.body.plant_stage = "pending";
    p.weeds = [weed];
    const wrapper = mount(<Weeds {...p} />);
    expect(wrapper.text()).not.toContain("No pending weeds.");
  });

  it("renders no active weeds", () => {
    const p = fakeProps();
    const weed = fakeWeed();
    weed.body.plant_stage = "removed";
    p.weeds = [weed];
    const wrapper = mount(<Weeds {...p} />);
    expect(wrapper.text()).toContain("No active weeds.");
  });

  it("renders no removed weeds", () => {
    const p = fakeProps();
    const weed = fakeWeed();
    weed.body.plant_stage = "active";
    p.weeds = [weed];
    const wrapper = mount(<Weeds {...p} />);
    expect(wrapper.text()).toContain("No removed weeds.");
  });

  it("changes search term", () => {
    const wrapper = shallow<Weeds>(<Weeds {...fakeProps()} />);
    wrapper.find(SearchField).simulate("change", "0");
    expect(wrapper.state().searchTerm).toEqual("0");
  });

  it("closes section", () => {
    const wrapper = shallow<Weeds>(<Weeds {...fakeProps()} />);
    expect(wrapper.state().pending).toEqual(true);
    wrapper.instance().toggleOpen("pending")();
    expect(wrapper.instance().state.pending).toEqual(false);
  });

  it("changes sort term", () => {
    const wrapper = shallow<Weeds>(<Weeds {...fakeProps()} />);
    const menu = wrapper.find(SearchField).props().customLeftIcon;
    const menuWrapper = shallow(<div>{menu}</div>);
    expect(wrapper.state().sortBy).toEqual("radius");
    expect(wrapper.state().reverse).toEqual(true);
    menuWrapper.find(PointSortMenu).simulate("change", {
      sortBy: undefined, reverse: false
    });
    expect(wrapper.state().sortBy).toEqual(undefined);
    expect(wrapper.state().reverse).toEqual(false);
  });

  it("filters points", () => {
    const p = fakeProps();
    p.weeds = [fakeWeed(), fakeWeed()];
    p.weeds[0].body.name = "weed 0";
    p.weeds[0].body.plant_stage = "removed";
    p.weeds[1].body.name = "weed 1";
    const wrapper = mount(<Weeds {...p} />);
    wrapper.setState({ searchTerm: "0" });
    expect(wrapper.text()).toContain("weed 0");
    expect(wrapper.text()).not.toContain("weed 1");
  });
});

describe("mapStateToProps()", () => {
  it("returns value", () => {
    const state = fakeState();
    const config = fakeWebAppConfig();
    config.body.show_weeds = true;
    state.resources = buildResourceIndex([config]);
    const props = mapStateToProps(state);
    expect(props.getConfigValue(BooleanSetting.show_weeds)).toBeTruthy();
  });
});

describe("<WeedsSection />", () => {
  const fakeProps = (): WeedsSectionProps => ({
    category: "pending",
    sectionTitle: "title",
    emptyStateText: "none",
    open: false,
    hoveredPoint: undefined,
    clickOpen: jest.fn(),
    items: [fakeWeed(), fakeWeed(), fakeWeed()],
    dispatch: jest.fn(),
  });

  it("approves all", () => {
    const p = fakeProps();
    const wrapper = mount(<WeedsSection {...p} />);
    wrapper.find(".fb-button.green").first().simulate("click");
    expect(edit).toHaveBeenCalledTimes(3);
    expect(edit).toHaveBeenCalledWith(p.items[0], { plant_stage: "active" });
    expect(save).toHaveBeenCalledTimes(3);
  });

  it("rejects all", () => {
    const p = fakeProps();
    const wrapper = mount(<WeedsSection {...p} />);
    wrapper.find(".fb-button.red").first().simulate("click");
    expect(destroy).toHaveBeenCalledWith(p.items[0].uuid, true);
  });

  it("renders", () => {
    const wrapper = mount(<WeedsSection {...fakeProps()} />);
    ["(3)", "title", "all"].map(string =>
      expect(wrapper.text().toLowerCase()).toContain(string));
    expect(wrapper.text().toLowerCase()).not.toContain("none");
  });

  it("toggles layer", () => {
    const p = fakeProps();
    const state = fakeState();
    state.resources = buildResourceIndex([fakeWebAppConfig()]);
    p.dispatch = jest.fn(x => x(jest.fn(), () => state));
    p.layerValue = true;
    p.layerSetting = BooleanSetting.show_weeds;
    p.layerDisabled = false;
    const wrapper = mount(<WeedsSection {...p} />);
    wrapper.find(".fb-toggle-button").first().simulate("click");
    expect(edit).toHaveBeenCalledWith(expect.any(Object),
      { [BooleanSetting.show_weeds]: false });
  });

  it("closes section", () => {
    const p = fakeProps();
    p.open = true;
    const wrapper = mount(<WeedsSection {...p} />);
    wrapper.find(".fa-caret-up").simulate("click");
    expect(p.clickOpen).toHaveBeenCalled();
  });
});
