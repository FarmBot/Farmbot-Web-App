jest.mock("../../../open_farm/cached_crop", () => ({
  maybeGetCachedPlantIcon: jest.fn(),
  setImgSrc: jest.fn(),
}));

jest.mock("../../map/actions", () => ({ setHoveredPlant: jest.fn() }));
jest.mock("../../../api/crud", () => ({ overwrite: jest.fn() }));

import React from "react";
import {
  PointGroupItem, PointGroupItemProps, genericPointIcon, OTHER_POINT_ICON,
  genericWeedIcon,
} from "../point_group_item";
import { shallow, mount } from "enzyme";
import {
  fakePlant, fakePointGroup, fakePoint, fakeToolSlot, fakeWeed,
} from "../../../__test_support__/fake_state/resources";
import {
  maybeGetCachedPlantIcon, setImgSrc,
} from "../../../open_farm/cached_crop";
import { setHoveredPlant } from "../../map/actions";
import { overwrite } from "../../../api/crud";
import { cloneDeep } from "lodash";
import { imgEvent } from "../../../__test_support__/fake_html_events";
import { error } from "../../../toast/toast";
import { svgToUrl, DEFAULT_ICON } from "../../../open_farm/icons";
import { DEFAULT_WEED_ICON } from "../../map/layers/weeds/garden_weed";

describe("<PointGroupItem/>", () => {
  const fakeProps = (): PointGroupItemProps => ({
    dispatch: jest.fn(),
    point: fakePlant(),
    group: fakePointGroup(),
    hovered: true
  });

  it("renders", () => {
    const p = fakeProps();
    const el = shallow<PointGroupItem>(<PointGroupItem {...p} />);
    const i = el.instance() as PointGroupItem;
    expect(el.first().prop("onMouseEnter")).toEqual(i.enter);
    expect(el.first().prop("onMouseLeave")).toEqual(i.leave);
    expect(el.first().prop("onClick")).toEqual(i.click);
  });

  it("fetches plant icon", async () => {
    const p = fakeProps();
    p.point = fakePlant();
    const i = new PointGroupItem(p);
    const fakeImgEvent = imgEvent();
    await i.maybeGetCachedIcon(fakeImgEvent);
    const slug = i.props.point.body.pointer_type === "Plant" ?
      i.props.point.body.openfarm_slug : "slug";
    expect(maybeGetCachedPlantIcon)
      .toHaveBeenCalledWith(slug, expect.any(Object), expect.any(Function));
    expect(setImgSrc).not.toHaveBeenCalled();
  });

  it("sets icon in state", () => {
    const i = new PointGroupItem(fakeProps());
    i.setState = jest.fn();
    i.setIconState("fake icon");
    expect(i.setState).toHaveBeenCalledWith({ icon: "fake icon" });
  });

  it("displays default plant icon", () => {
    const p = fakeProps();
    p.point = fakePlant();
    const wrapper = mount<PointGroupItem>(<PointGroupItem {...p} />);
    expect(wrapper.find("img").props().src).toEqual(DEFAULT_ICON);
  });

  it("displays point icon", () => {
    const p = fakeProps();
    p.point = fakePoint();
    const wrapper = mount<PointGroupItem>(<PointGroupItem {...p} />);
    expect(wrapper.find("img").props().src).toEqual(
      svgToUrl(genericPointIcon(undefined)));
  });

  it("displays weed icon", () => {
    const p = fakeProps();
    p.point = fakeWeed();
    p.point.body.meta.color = undefined;
    const wrapper = mount<PointGroupItem>(<PointGroupItem {...p} />);
    expect(wrapper.find("img").first().props().src).toEqual(DEFAULT_WEED_ICON);
    expect(wrapper.find("img").last().props().src).toEqual(
      svgToUrl(genericWeedIcon(undefined)));
  });

  it("displays other icon", () => {
    const p = fakeProps();
    p.point = fakeToolSlot();
    const wrapper = mount<PointGroupItem>(<PointGroupItem {...p} />);
    expect(wrapper.find("img").props().src).toEqual(
      svgToUrl(OTHER_POINT_ICON));
  });

  it("handles mouse enter", () => {
    const i = new PointGroupItem(fakeProps());
    i.state.icon = "X";
    i.enter();
    expect(i.props.dispatch).toHaveBeenCalledTimes(1);
    expect(setHoveredPlant).toHaveBeenCalledWith(i.props.point.uuid, "X");
  });

  it("handles mouse exit", () => {
    const i = new PointGroupItem(fakeProps());
    i.state.icon = "X";
    i.leave();
    expect(i.props.dispatch).toHaveBeenCalledTimes(1);
    expect(setHoveredPlant).toHaveBeenCalledWith(undefined);
  });

  it("handles clicks", () => {
    const p = fakeProps();
    p.point.body.id = 1;
    p.group.body.point_ids = [1];
    const i = new PointGroupItem(p);
    i.click();
    expect(i.props.dispatch).toHaveBeenCalledTimes(2);
    const expectedGroupBody = cloneDeep(p.group.body);
    expectedGroupBody.point_ids = [];
    expect(overwrite).toHaveBeenCalledWith(p.group, expectedGroupBody);
    expect(setHoveredPlant).toHaveBeenCalledWith(undefined);
  });

  it("errors on click", () => {
    const p = fakeProps();
    p.point.body.id = 1;
    p.group.body.point_ids = [];
    const i = new PointGroupItem(p);
    i.click();
    expect(i.props.dispatch).not.toHaveBeenCalled();
    expect(overwrite).not.toHaveBeenCalled();
    expect(setHoveredPlant).not.toHaveBeenCalled();
    expect(error).toHaveBeenCalledWith(
      "Cannot remove points selected by criteria.");
  });
});
