let mockPath = "/app/designer/points";
jest.mock("../../../history", () => ({
  push: jest.fn(),
  getPathArray: () => mockPath.split("/"),
}));

jest.mock("../../map/actions", () => ({
  mapPointClickAction: jest.fn(() => jest.fn()),
}));

import * as React from "react";
import { shallow } from "enzyme";
import {
  PointInventoryItem, PointInventoryItemProps,
} from "../point_inventory_item";
import { fakePoint } from "../../../__test_support__/fake_state/resources";
import { push } from "../../../history";
import { Actions } from "../../../constants";
import { mapPointClickAction } from "../../map/actions";

describe("<PointInventoryItem> />", () => {
  const fakeProps = (): PointInventoryItemProps => ({
    tpp: fakePoint(),
    dispatch: jest.fn(),
    hovered: false,
  });

  it("navigates to point", () => {
    mockPath = "/app/designer/points";
    const p = fakeProps();
    p.tpp.body.id = 1;
    const wrapper = shallow(<PointInventoryItem {...p} />);
    wrapper.simulate("click");
    expect(mapPointClickAction).not.toHaveBeenCalled();
    expect(push).toHaveBeenCalledWith("/app/designer/points/1");
    expect(p.dispatch).toHaveBeenCalledWith({
      type: Actions.TOGGLE_HOVERED_POINT,
      payload: [p.tpp.uuid],
    });
  });

  it("removes item in box select mode", () => {
    mockPath = "/app/designer/plants/select";
    const p = fakeProps();
    const wrapper = shallow(<PointInventoryItem {...p} />);
    wrapper.simulate("click");
    expect(mapPointClickAction).toHaveBeenCalledWith(expect.any(Function),
      p.tpp.uuid);
    expect(push).not.toHaveBeenCalled();
    expect(p.dispatch).toHaveBeenCalledWith({
      type: Actions.TOGGLE_HOVERED_POINT,
      payload: undefined,
    });
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
