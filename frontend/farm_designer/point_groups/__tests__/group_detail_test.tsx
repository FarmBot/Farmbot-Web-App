import {
  fakePointGroup, fakePlant,
} from "../../../__test_support__/fake_state/resources";
const GOOD_ID = 9;

const mockPlant = fakePlant();
mockPlant.body.id = 23;

const mockGroup = fakePointGroup();
mockGroup.body.name = "one";
mockGroup.body.id = GOOD_ID;
mockGroup.body.point_ids = [23];

const mockId = GOOD_ID;
let mockPath = `/app/designer/groups/${mockId}`;
jest.mock("../../../history", () => ({
  getPathArray: jest.fn(() => mockPath.split("/")),
  push: jest.fn()
}));

import React from "react";
import { Provider } from "react-redux";
import { mount } from "enzyme";
import { GroupDetailActive } from "../group_detail_active";
import { GroupDetail, findGroupFromUrl } from "../group_detail";
import { fakeState } from "../../../__test_support__/fake_state";
import { createStore } from "redux";
import {
  buildResourceIndex,
} from "../../../__test_support__/resource_index_builder";
import { push } from "../../../history";

describe("<GroupDetail />", () => {
  const fakeStore = () => {
    const state = fakeState();
    state.resources = buildResourceIndex([
      mockGroup,
      mockPlant,
    ]);
    return createStore(s => s, state);
  };

  it("redirects when group is not found", () => {
    mockPath = "/app/designer/groups/-23";
    const store = fakeStore();
    const el = mount(<Provider store={store}>
      <GroupDetail />
    </Provider>);
    const result = el.find(GroupDetailActive);
    expect(result.length).toEqual(0);
    expect(push).toHaveBeenCalledWith("/app/designer/groups");
  });

  it("loads <GroupDetailActive/>", () => {
    mockPath = `/app/designer/groups/${mockId}`;
    const store = fakeStore();
    const el = mount(<Provider store={store}>
      <GroupDetail />
    </Provider>);
    const result = el.find(GroupDetailActive);
    expect(result.length).toEqual(1);
  });
});

describe("findGroupFromUrl()", () => {
  it("finds group from URL", () => {
    mockPath = `/app/designer/groups/${mockId}`;
    const group = fakePointGroup();
    group.body.id = mockId;
    const otherGroup = fakePointGroup();
    otherGroup.body.id = mockId + 1;
    const result = findGroupFromUrl([group]);
    expect(result).toEqual(group);
  });

  it("fails to find group from URL", () => {
    mockPath = `/app/designer/groups/${mockId}`;
    const result = findGroupFromUrl([]);
    expect(result).toEqual(undefined);
  });

  it("fails to find group from URL: undefined array item", () => {
    mockPath = "/app/designer/groups/";
    const result = findGroupFromUrl([]);
    expect(result).toEqual(undefined);
  });

  it("doesn't try to find a group when at a different URL", () => {
    mockPath = `/app/designer/plants/${mockId}`;
    const group = fakePointGroup();
    group.body.id = mockId;
    const result = findGroupFromUrl([group]);
    expect(result).toEqual(undefined);
  });
});
