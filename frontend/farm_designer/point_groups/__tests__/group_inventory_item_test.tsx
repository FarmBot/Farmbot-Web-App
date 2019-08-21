import React from "react";
import { GroupInventoryItem } from "../group_inventory_item";
import { fakePointGroup } from "../../../__test_support__/fake_state/resources";
import { mount } from "enzyme";

describe("<GroupInventoryItem/>", () => {
  it("renders information about the current group", () => {
    const dispatch = jest.fn();
    const group = fakePointGroup();
    const onClick = jest.fn();
    group.body.point_ids = [1, 2, 3];
    group.body.name = "woosh";

    const x = mount(<GroupInventoryItem
      group={group}
      hovered={true}
      dispatch={dispatch}
      onClick={onClick} />);
    expect(x.text()).toContain("3 items");
    expect(x.text()).toContain("woosh");
    expect(x.find(".hovered").length).toBe(1);
  });
});
