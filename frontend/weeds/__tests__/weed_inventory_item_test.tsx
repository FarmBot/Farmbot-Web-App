jest.mock("../../farm_designer/map/actions", () => ({
  mapPointClickAction: jest.fn(() => jest.fn()),
  selectPoint: jest.fn(),
}));

jest.mock("../../api/crud", () => ({
  destroy: jest.fn(),
  edit: jest.fn(),
  save: jest.fn(),
}));

import React from "react";
import { shallow, mount } from "enzyme";
import {
  WeedInventoryItem, WeedInventoryItemProps,
} from "../weed_inventory_item";
import { fakeWeed } from "../../__test_support__/fake_state/resources";
import { Actions } from "../../constants";
import { mapPointClickAction } from "../../farm_designer/map/actions";
import { edit, save, destroy } from "../../api/crud";
import { Path } from "../../internal_urls";

describe("<WeedInventoryItem /> />", () => {
  const fakeProps = (): WeedInventoryItemProps => ({
    tpp: fakeWeed(),
    dispatch: jest.fn(),
    hovered: false,
    maxSize: 0,
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
    expect(mockNavigate).toHaveBeenCalledWith(Path.weeds(1));
    expect(p.dispatch).toHaveBeenCalledWith({
      type: Actions.TOGGLE_HOVERED_POINT,
      payload: p.tpp.uuid,
    });
  });

  it("navigates to weed without id", () => {
    const p = fakeProps();
    p.tpp.body.id = undefined;
    const wrapper = shallow(<WeedInventoryItem {...p} />);
    wrapper.simulate("click");
    expect(mapPointClickAction).not.toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith(Path.weeds("ERR_NO_POINT_ID"));
    expect(p.dispatch).toHaveBeenCalledWith({
      type: Actions.TOGGLE_HOVERED_POINT,
      payload: p.tpp.uuid,
    });
  });

  it("removes item in box select mode", () => {
    location.pathname = Path.mock(Path.plants("select"));
    const p = fakeProps();
    const wrapper = shallow(<WeedInventoryItem {...p} />);
    wrapper.simulate("click");
    expect(mapPointClickAction).toHaveBeenCalledWith(
      expect.any(Function),
      expect.any(Function),
      p.tpp.uuid);
    expect(mockNavigate).not.toHaveBeenCalled();
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

  it("approves weed", () => {
    const p = fakeProps();
    p.pending = true;
    const wrapper = mount(<WeedInventoryItem {...p} />);
    wrapper.find(".fb-button.green").first().simulate("click");
    expect(edit).toHaveBeenCalledWith(p.tpp, { plant_stage: "active" });
    expect(save).toHaveBeenCalledWith(p.tpp.uuid);
  });

  it("rejects weed", () => {
    const p = fakeProps();
    p.pending = true;
    const wrapper = mount(<WeedInventoryItem {...p} />);
    wrapper.find(".fb-button.red").first().simulate("click");
    expect(destroy).toHaveBeenCalledWith(p.tpp.uuid, true);
  });

  it.each<[number, number, number]>([
    [100, 0, 1],
    [100, 100, 1],
    [75, 100, 0.75],
    [25, 100, 0.5],
  ])("has correct scale", (radius, max, scale) => {
    const p = fakeProps();
    p.pending = true;
    p.tpp.body.radius = radius;
    p.maxSize = max;
    const wrapper = mount(<WeedInventoryItem {...p} />);
    expect(wrapper.find(".weed-item-icon").props().style?.transform)
      .toEqual(`scale(${scale})`);
  });
});
