jest.mock("../../../history", () => {
  return {
    getPathArray: jest.fn(() => ["L", "O", "L"]),
    history: {
      push: jest.fn(),
    }
  };
});

import React from "react";
import { mount } from "enzyme";
import { GroupListPanel, newUpdater } from "../group_list_panel";
import { Provider } from "react-redux";
import { createStore, DeepPartial } from "redux";
import { fakeState } from "../../../__test_support__/fake_state";
import { buildResourceIndex } from "../../../__test_support__/resource_index_builder";
import { fakePointGroup } from "../../../__test_support__/fake_state/resources";
import { history } from "../../../history";

describe("<GroupListPanel />", () => {
  const setUpTests = () => {
    const fake1 = fakePointGroup();
    fake1.body.name = "one";
    fake1.body.id = 9;
    fake1.body.point_ids = [1, 2, 3];

    const fake2 = fakePointGroup();
    fake2.body.name = "two";

    const state = fakeState();
    state.resources = buildResourceIndex([fake1, fake2]);
    const store = createStore(s => s, state);

    return { store, fake1, fake2 };
  };

  it("handles the `change` event", () => {
    const setState = jest.fn();
    const fn = newUpdater(setState, "searchTerm");
    type E = React.SyntheticEvent<HTMLInputElement>;
    const e: DeepPartial<E> = { currentTarget: { value: "X" } };
    fn(e as E);
    expect(setState).toHaveBeenCalledWith({ searchTerm: "X" });
  });

  it("renders relevant group data as a list", () => {
    const { store, fake1, fake2 } = setUpTests();

    const el = mount(<Provider store={store}>
      <GroupListPanel {...({} as GroupListPanel["props"])} />
    </Provider>);
    el.find(".plant-search-item").first().simulate("click");
    expect(history.push).toHaveBeenCalledWith("/app/designer/groups/9");

    const text = el.text();
    expect(text).toContain("3 items");
    expect(text).toContain("0 items");
    expect(text).toContain(fake2.body.name);
    expect(text).toContain(fake1.body.name);
  });
});
