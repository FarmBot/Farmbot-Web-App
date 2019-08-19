import React from "react";
import { mount } from "enzyme";
import { GroupListPanel } from "../group_list_panel";
import { Provider } from "react-redux";
import { createStore } from "redux";
import { fakeState } from "../../../__test_support__/fake_state";
import { buildResourceIndex } from "../../../__test_support__/resource_index_builder";
import { fakePointGroup } from "../../../__test_support__/fake_state/resources";

describe("<GroupListPanel />", () => {
  it("renders relevant group data as a list", () => {
    const fake1 = fakePointGroup();
    fake1.body.name = "one";
    fake1.body.point_ids = [1, 2, 3];

    const fake2 = fakePointGroup();
    fake2.body.name = "two";

    const state = fakeState();
    state.resources = buildResourceIndex([fake1, fake2]);
    const store = createStore(s => s, state);
    const text = mount(<Provider store={store}>
      <GroupListPanel {...({} as GroupListPanel["props"])} />
    </Provider>).text();

    expect(text).toContain("3 items");
    expect(text).toContain("0 items");
    expect(text).toContain(fake2.body.name);
    expect(text).toContain(fake1.body.name);
  });
});
