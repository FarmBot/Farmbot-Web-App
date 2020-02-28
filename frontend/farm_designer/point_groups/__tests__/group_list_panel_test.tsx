jest.mock("../../../history", () => ({
  getPathArray: jest.fn(() => ["L", "O", "L"]),
  history: { push: jest.fn() }
}));

import React from "react";
import { mount, shallow } from "enzyme";
import {
  RawGroupListPanel as GroupListPanel, GroupListPanelProps, mapStateToProps,
} from "../group_list_panel";
import {
  fakePointGroup, fakePlant,
} from "../../../__test_support__/fake_state/resources";
import { history } from "../../../history";
import { fakeState } from "../../../__test_support__/fake_state";
import {
  buildResourceIndex,
} from "../../../__test_support__/resource_index_builder";

describe("<GroupListPanel />", () => {
  const fakeProps = (): GroupListPanelProps => {
    const group1 = fakePointGroup();
    group1.body.name = "one";
    group1.body.id = 9;
    group1.body.point_ids = [1, 2, 3];
    const group2 = fakePointGroup();
    group2.body.name = "two";
    const point1 = fakePlant();
    point1.body.id = 1;
    const point2 = fakePlant();
    point2.body.id = 2;
    const point3 = fakePlant();
    point3.body.id = 3;
    return {
      dispatch: jest.fn(),
      groups: [group1, group2],
      allPoints: [point1, point2, point3],
    };
  };

  it("changes search term", () => {
    const p = fakeProps();
    const wrapper = shallow<GroupListPanel>(<GroupListPanel {...p} />);
    wrapper.find("input").first().simulate("change",
      { currentTarget: { value: "one" } });
    expect(wrapper.state().searchTerm).toEqual("one");
  });

  it("renders relevant group data as a list", () => {
    const p = fakeProps();
    const wrapper = mount(<GroupListPanel {...p} />);
    wrapper.find(".group-search-item").first().simulate("click");
    expect(history.push).toHaveBeenCalledWith("/app/designer/groups/9");

    ["3 items",
      "0 items",
      p.groups[0].body.name,
      p.groups[1].body.name].map(string =>
        expect(wrapper.text()).toContain(string));
  });

  it("renders no groups", () => {
    const p = fakeProps();
    p.groups = [];
    const wrapper = mount(<GroupListPanel {...p} />);
    expect(wrapper.text().toLowerCase()).toContain("no groups yet");
  });

  it("maps state to props", () => {
    const state = fakeState();
    const group = fakePointGroup();
    const resources = buildResourceIndex([group]);
    state.resources = resources;
    const x = mapStateToProps(state);
    expect(x.groups).toContain(group);
  });
});
