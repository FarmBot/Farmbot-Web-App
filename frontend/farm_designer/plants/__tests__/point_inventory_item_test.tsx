jest.mock("../../../history", () => ({ push: jest.fn() }));

import * as React from "react";
import { shallow } from "enzyme";
import {
  PointInventoryItem, PointInventoryItemProps
} from "../point_inventory_item";
import { fakePoint } from "../../../__test_support__/fake_state/resources";
import { push } from "../../../history";
import { Actions } from "../../../constants";

describe("<PointInventoryItem> />", () => {
  const fakeProps = (): PointInventoryItemProps => ({
    tpp: fakePoint(),
    dispatch: jest.fn(),
    hovered: false,
    navName: "points",
  });

  it("navigates to point", () => {
    const p = fakeProps();
    p.tpp.body.id = 1;
    const wrapper = shallow(<PointInventoryItem {...p} />);
    wrapper.simulate("click");
    expect(push).toHaveBeenCalledWith("/app/designer/points/1");
  });

  it("hovers point", () => {
    const p = fakeProps();
    p.tpp.body.id = 1;
    const wrapper = shallow(<PointInventoryItem {...p} />);
    wrapper.simulate("mouseEnter");
    expect(p.dispatch).toHaveBeenCalledWith({
      type: Actions.TOGGLE_HOVERED_POINT, payload: p.tpp.uuid
    });
  });

  it("shows hovered", () => {
    const p = fakeProps();
    p.hovered = true;
    const wrapper = shallow(<PointInventoryItem {...p} />);
    expect(wrapper.hasClass("hovered")).toBeTruthy();
  });

  it("un-hovers point", () => {
    const p = fakeProps();
    p.tpp.body.id = 1;
    const wrapper = shallow(<PointInventoryItem {...p} />);
    wrapper.simulate("mouseLeave");
    expect(p.dispatch).toHaveBeenCalledWith({
      type: Actions.TOGGLE_HOVERED_POINT, payload: undefined
    });
  });
});
