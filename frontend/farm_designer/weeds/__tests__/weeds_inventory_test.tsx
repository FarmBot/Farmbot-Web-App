import * as React from "react";
import { mount, shallow } from "enzyme";
import {
  RawWeeds as Weeds, WeedsProps, mapStateToProps,
} from "../weeds_inventory";
import { fakeState } from "../../../__test_support__/fake_state";
import { fakeWeed } from "../../../__test_support__/fake_state/resources";
import { SearchField } from "../../../ui/search_field";
import { PointSortMenu } from "../../sort_options";

describe("<Weeds> />", () => {
  const fakeProps = (): WeedsProps => ({
    weeds: [],
    dispatch: jest.fn(),
    hoveredPoint: undefined,
  });

  it("renders no points", () => {
    const wrapper = mount(<Weeds {...fakeProps()} />);
    expect(wrapper.text()).toContain("No weeds yet.");
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
  it("returns props", () => {
    const state = fakeState();
    const props = mapStateToProps(state);
    expect(props.dispatch).toEqual(expect.any(Function));
  });
});
