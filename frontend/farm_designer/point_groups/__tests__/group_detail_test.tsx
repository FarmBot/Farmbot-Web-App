import {
  fakePointGroup, fakePlant
} from "../../../__test_support__/fake_state/resources";
const GOOD_ID = 9;

const mockPlant = fakePlant();
mockPlant.body.id = 23;

const mockGroup = fakePointGroup();
mockGroup.body.name = "one";
mockGroup.body.id = GOOD_ID;
mockGroup.body.point_ids = [23];

let mockId = GOOD_ID;
jest.mock("../../../history", () => {
  return {
    getPathArray: jest.fn(() => [mockId]),
    push: jest.fn()
  };
});

import React from "react";
import { Provider } from "react-redux";
import { mount } from "enzyme";
import { GroupDetailActive } from "../group_detail_active";
import { GroupDetail } from "../group_detail";
import { fakeState } from "../../../__test_support__/fake_state";
import { createStore } from "redux";
import {
  buildResourceIndex
} from "../../../__test_support__/resource_index_builder";
import { push } from "../../../history";

describe("<GroupDetail />", () => {
  const fakeStore = () => {
    const state = fakeState();
    state.resources = buildResourceIndex([
      mockGroup,
      mockPlant
    ]);
    return createStore(s => s, state);
  };

  it("redirects when group is not found", () => {
    mockId = -23;
    const store = fakeStore();
    const el = mount(<Provider store={store}>
      <GroupDetail {...({} as GroupDetail["props"])} />
    </Provider>);
    const result = el.find(GroupDetailActive);
    expect(result.length).toEqual(0);
    expect(push).toHaveBeenCalledWith("/app/designer/groups");
  });

  it("loads <GroupDetailActive/>", () => {
    mockId = GOOD_ID;
    const store = fakeStore();
    const el = mount(<Provider store={store}>
      <GroupDetail {...({} as GroupDetail["props"])} />
    </Provider>);
    const result = el.find(GroupDetailActive);
    expect(result.length).toEqual(1);
  });
});
