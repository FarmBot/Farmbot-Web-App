let mockPath = "/app/designer/points/1";
jest.mock("../../history", () => ({
  getPathArray: jest.fn(() => mockPath.split("/")),
  push: jest.fn(),
}));

jest.mock("../../api/crud", () => ({
  destroy: jest.fn(),
}));

import React from "react";
import { mount, shallow } from "enzyme";
import {
  RawEditPoint as EditPoint, EditPointProps,
  mapStateToProps,
} from "../point_info";
import { fakePoint } from "../../__test_support__/fake_state/resources";
import { fakeState } from "../../__test_support__/fake_state";
import {
  buildResourceIndex,
} from "../../__test_support__/resource_index_builder";
import { Xyz } from "farmbot";
import { clickButton } from "../../__test_support__/helpers";
import { destroy } from "../../api/crud";
import { DesignerPanelHeader } from "../../farm_designer/designer_panel";
import { Actions } from "../../constants";
import { push } from "../../history";
import { locationUrl } from "../../farm_designer/move_to";

describe("<EditPoint />", () => {
  const fakeProps = (): EditPointProps => ({
    findPoint: fakePoint,
    dispatch: jest.fn(),
    botOnline: true,
  });

  it("redirects", () => {
    mockPath = "/app/designer/points/";
    const wrapper = mount(<EditPoint {...fakeProps()} />);
    expect(wrapper.text()).toContain("Redirecting...");
    expect(push).toHaveBeenCalledWith("/app/designer/points");
  });

  it("doesn't redirect", () => {
    mockPath = "/app/logs";
    const wrapper = mount(<EditPoint {...fakeProps()} />);
    expect(wrapper.text()).toContain("Redirecting...");
    expect(push).not.toHaveBeenCalled();
  });

  it("renders with points", () => {
    mockPath = "/app/designer/points/1";
    const p = fakeProps();
    const point = fakePoint();
    point.body.meta = { meta_key: "meta value" };
    p.findPoint = () => point;
    const wrapper = mount(<EditPoint {...p} />);
    expect(wrapper.text()).toContain("Edit point");
    expect(wrapper.text()).toContain("meta value");
  });

  it("doesn't render duplicate values", () => {
    mockPath = "/app/designer/points/1";
    const p = fakeProps();
    const point = fakePoint();
    point.body.meta = { color: "red", meta_key: undefined, gridId: "123" };
    p.findPoint = () => point;
    const wrapper = mount(<EditPoint {...p} />);
    expect(wrapper.text()).toContain("Edit point");
    expect(wrapper.text()).not.toContain("red");
    expect(wrapper.text()).not.toContain("grid");
  });

  it("moves the device to a particular point", () => {
    mockPath = "/app/designer/points/1";
    const p = fakeProps();
    const point = fakePoint();
    const coords = { x: 1, y: -2, z: 3 };
    Object.entries(coords).map(([axis, value]: [Xyz, number]) =>
      point.body[axis] = value);
    p.findPoint = () => point;
    const wrapper = mount(<EditPoint {...p} />);
    wrapper.find("button").first().simulate("click");
    expect(push).toHaveBeenCalledWith(locationUrl(coords));
  });

  it("goes back", () => {
    mockPath = "/app/designer/points/1";
    const p = fakeProps();
    const wrapper = shallow(<EditPoint {...p} />);
    wrapper.find(DesignerPanelHeader).simulate("back");
    expect(p.dispatch).toHaveBeenCalledWith({
      type: Actions.TOGGLE_HOVERED_POINT, payload: undefined
    });
  });

  it("deletes point", () => {
    mockPath = "/app/designer/points/1";
    const p = fakeProps();
    const point = fakePoint();
    p.findPoint = () => point;
    const wrapper = mount(<EditPoint {...p} />);
    clickButton(wrapper, 1, "delete");
    expect(destroy).toHaveBeenCalledWith(point.uuid);
  });
});

describe("mapStateToProps()", () => {
  it("returns props", () => {
    const state = fakeState();
    const point = fakePoint();
    point.body.id = 1;
    state.resources = buildResourceIndex([point]);
    const props = mapStateToProps(state);
    expect(props.findPoint(1)).toEqual(point);
  });
});
