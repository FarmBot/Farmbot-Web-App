jest.mock("../../farm_designer/map/actions", () => ({
  mapPointClickAction: jest.fn(() => jest.fn()),
}));

let mockDelMode = false;
jest.mock("../../settings/dev/dev_support", () => ({
  DevSettings: {
    quickDeleteEnabled: () => mockDelMode,
  }
}));

jest.mock("../../api/crud", () => ({ destroy: jest.fn() }));

import React from "react";
import { shallow, mount } from "enzyme";
import {
  PointInventoryItem, PointInventoryItemProps,
} from "../point_inventory_item";
import { fakePoint } from "../../__test_support__/fake_state/resources";
import { Actions } from "../../constants";
import { mapPointClickAction } from "../../farm_designer/map/actions";
import { destroy } from "../../api/crud";
import { Path } from "../../internal_urls";

describe("<PointInventoryItem> />", () => {
  const fakeProps = (): PointInventoryItemProps => ({
    tpp: fakePoint(),
    dispatch: jest.fn(),
    hovered: false,
  });

  it("renders named point", () => {
    const p = fakeProps();
    p.tpp.body.name = "named point";
    const wrapper = mount(<PointInventoryItem {...p} />);
    expect(wrapper.text()).toContain("named point");
  });

  it("renders unnamed point", () => {
    const p = fakeProps();
    p.tpp.body.name = "";
    p.tpp.body.meta.color = "";
    const wrapper = mount(<PointInventoryItem {...p} />);
    expect(wrapper.text()).toContain("Untitled point");
    expect(wrapper.html()).toContain("green");
  });

  it("deletes point", () => {
    mockDelMode = true;
    location.pathname = Path.mock(Path.points());
    const p = fakeProps();
    p.tpp.body.id = 1;
    const wrapper = shallow(<PointInventoryItem {...p} />);
    wrapper.simulate("click");
    expect(mapPointClickAction).not.toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
    expect(destroy).toHaveBeenCalledWith(p.tpp.uuid, true);
    mockDelMode = false;
  });

  it("hovers point in quick delete mode", () => {
    mockDelMode = true;
    location.pathname = Path.mock(Path.points());
    const p = fakeProps();
    p.tpp.body.id = 1;
    p.hovered = false;
    const wrapper = mount<typeof PointInventoryItem>(<PointInventoryItem {...p} />);
    expect(wrapper.find(".quick-delete").hasClass("hovered")).toBeFalsy();
    p.hovered = true;
    wrapper.setProps(p);
    expect(wrapper.find(".quick-delete").hasClass("hovered")).toBeTruthy();
    mockDelMode = false;
  });

  it("navigates to point", () => {
    location.pathname = Path.mock(Path.points());
    const p = fakeProps();
    p.tpp.body.id = 1;
    const wrapper = mount(<PointInventoryItem {...p} />);
    wrapper.simulate("click");
    expect(mapPointClickAction).not.toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith(Path.points(1));
    expect(p.dispatch).toHaveBeenCalledWith({
      type: Actions.TOGGLE_HOVERED_POINT,
      payload: p.tpp.uuid,
    });
  });

  it("navigates to point without id", () => {
    location.pathname = Path.mock(Path.points());
    const p = fakeProps();
    p.tpp.body.id = undefined;
    const wrapper = mount(<PointInventoryItem {...p} />);
    wrapper.simulate("click");
    expect(mapPointClickAction).not.toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith(Path.points("ERR_NO_POINT_ID"));
    expect(p.dispatch).toHaveBeenCalledWith({
      type: Actions.TOGGLE_HOVERED_POINT,
      payload: p.tpp.uuid,
    });
  });

  it("removes item in box select mode", () => {
    location.pathname = Path.mock(Path.plants("select"));
    const p = fakeProps();
    const wrapper = mount(<PointInventoryItem {...p} />);
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
