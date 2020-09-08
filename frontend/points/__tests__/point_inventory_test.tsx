jest.mock("../../history", () => ({
  push: jest.fn(),
  getPathArray: () => [],
}));

import React from "react";
import { mount, shallow } from "enzyme";
import {
  RawPoints as Points, PointsProps, mapStateToProps,
} from "../point_inventory";
import { fakePoint } from "../../__test_support__/fake_state/resources";
import { push } from "../../history";
import { fakeState } from "../../__test_support__/fake_state";
import {
  buildResourceIndex,
} from "../../__test_support__/resource_index_builder";
import { SearchField } from "../../ui/search_field";
import { PointSortMenu } from "../../farm_designer/sort_options";

describe("<Points> />", () => {
  const fakeProps = (): PointsProps => ({
    genericPoints: [],
    dispatch: jest.fn(),
    hoveredPoint: undefined,
  });

  it("renders no points", () => {
    const wrapper = mount(<Points {...fakeProps()} />);
    expect(wrapper.text()).toContain("No points yet.");
  });

  it("renders points", () => {
    const p = fakeProps();
    p.genericPoints = [fakePoint()];
    const wrapper = mount(<Points {...p} />);
    expect(wrapper.text()).toContain("Point 1");
  });

  it("navigates to point info", () => {
    const p = fakeProps();
    p.genericPoints = [fakePoint()];
    p.genericPoints[0].body.id = 1;
    const wrapper = mount(<Points {...p} />);
    wrapper.find(".point-search-item").first().simulate("click");
    expect(push).toHaveBeenCalledWith("/app/designer/points/1");
  });

  it("changes search term", () => {
    const p = fakeProps();
    p.genericPoints = [fakePoint(), fakePoint()];
    p.genericPoints[0].body.name = "point 0";
    p.genericPoints[1].body.name = "point 1";
    const wrapper = shallow<Points>(<Points {...p} />);
    wrapper.find(SearchField).simulate("change", "0");
    expect(wrapper.state().searchTerm).toEqual("0");
  });

  it("filters points", () => {
    const p = fakeProps();
    p.genericPoints = [fakePoint(), fakePoint()];
    p.genericPoints[0].body.name = "point 0";
    p.genericPoints[1].body.name = "point 1";
    const wrapper = mount(<Points {...p} />);
    wrapper.setState({ searchTerm: "0" });
    expect(wrapper.text()).not.toContain("point 1");
  });

  it("changes sort term", () => {
    const wrapper = shallow<Points>(<Points {...fakeProps()} />);
    const menu = wrapper.find(SearchField).props().customLeftIcon;
    const menuWrapper = shallow(<div>{menu}</div>);
    expect(wrapper.state().sortBy).toEqual(undefined);
    menuWrapper.find(PointSortMenu).simulate("change", {
      sortBy: "radius", reverse: true
    });
    expect(wrapper.state().sortBy).toEqual("radius");
    expect(wrapper.state().reverse).toEqual(true);
  });
});

describe("mapStateToProps()", () => {
  it("returns props", () => {
    const state = fakeState();
    const point = fakePoint();
    const discarded = fakePoint();
    state.resources = buildResourceIndex([point, discarded]);
    const props = mapStateToProps(state);
    expect(props.genericPoints).toEqual([point, discarded]);
  });
});
