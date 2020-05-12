let mockPath = "/app/designer/weeds";
jest.mock("../../../history", () => ({
  push: jest.fn(),
  getPathArray: () => mockPath.split("/"),
}));

jest.mock("../../map/actions", () => ({
  mapPointClickAction: jest.fn(() => jest.fn()),
}));

import * as React from "react";
import { shallow, mount } from "enzyme";
import {
  WeedInventoryItem, WeedInventoryItemProps,
} from "../weed_inventory_item";
import { fakeWeed } from "../../../__test_support__/fake_state/resources";
import { push } from "../../../history";
import { Actions } from "../../../constants";
import { mapPointClickAction } from "../../map/actions";

describe("<WeedInventoryItem /> />", () => {
  const fakeProps = (): WeedInventoryItemProps => ({
    tpp: fakeWeed(),
    dispatch: jest.fn(),
    hovered: false,
  });

  it("renders named weed", () => {
    const p = fakeProps();
    p.tpp.body.name = "named weed";
    const wrapper = mount(<WeedInventoryItem {...p} />);
    expect(wrapper.text()).toContain("named weed");
  });

  it("renders unnamed weed", () => {
    const p = fakeProps();
    p.tpp.body.name = "";
    const wrapper = mount(<WeedInventoryItem {...p} />);
    expect(wrapper.text()).toContain("Untitled weed");
  });

  it("navigates to weed", () => {
    const p = fakeProps();
    p.tpp.body.id = 1;
    const wrapper = shallow(<WeedInventoryItem {...p} />);
    wrapper.simulate("click");
    expect(mapPointClickAction).not.toHaveBeenCalled();
    expect(push).toHaveBeenCalledWith("/app/designer/weeds/1");
    expect(p.dispatch).toHaveBeenCalledWith({
      type: Actions.TOGGLE_HOVERED_POINT,
      payload: [p.tpp.uuid],
    });
  });

  it("navigates to weed without id", () => {
    const p = fakeProps();
    p.tpp.body.id = undefined;
    const wrapper = shallow(<WeedInventoryItem {...p} />);
    wrapper.simulate("click");
    expect(mapPointClickAction).not.toHaveBeenCalled();
    expect(push).toHaveBeenCalledWith("/app/designer/weeds/ERR_NO_POINT_ID");
    expect(p.dispatch).toHaveBeenCalledWith({
      type: Actions.TOGGLE_HOVERED_POINT,
      payload: [p.tpp.uuid],
    });
  });

  it("removes item in box select mode", () => {
    mockPath = "/app/designer/plants/select";
    const p = fakeProps();
    const wrapper = shallow(<WeedInventoryItem {...p} />);
    wrapper.simulate("click");
    expect(mapPointClickAction).toHaveBeenCalledWith(expect.any(Function),
      p.tpp.uuid);
    expect(push).not.toHaveBeenCalled();
    expect(p.dispatch).toHaveBeenCalledWith({
      type: Actions.TOGGLE_HOVERED_POINT,
      payload: undefined,
    });
  });

  it("hovers weed", () => {
    const p = fakeProps();
    p.tpp.body.id = 1;
    const wrapper = shallow(<WeedInventoryItem {...p} />);
    wrapper.simulate("mouseEnter");
    expect(p.dispatch).toHaveBeenCalledWith({
      type: Actions.TOGGLE_HOVERED_POINT, payload: p.tpp.uuid
    });
  });

  it("shows hovered", () => {
    const p = fakeProps();
    p.hovered = true;
    const wrapper = shallow(<WeedInventoryItem {...p} />);
    expect(wrapper.hasClass("hovered")).toBeTruthy();
  });

  it("un-hovers weed", () => {
    const p = fakeProps();
    p.tpp.body.id = 1;
    const wrapper = shallow(<WeedInventoryItem {...p} />);
    wrapper.simulate("mouseLeave");
    expect(p.dispatch).toHaveBeenCalledWith({
      type: Actions.TOGGLE_HOVERED_POINT, payload: undefined
    });
  });
});
