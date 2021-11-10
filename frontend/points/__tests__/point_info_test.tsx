import { Path } from "../../internal_urls";
let mockPath = Path.mock(Path.points(1));
jest.mock("../../history", () => ({
  getPathArray: jest.fn(() => mockPath.split("/")),
  push: jest.fn(),
}));

jest.mock("../../api/crud", () => ({
  destroy: jest.fn(),
  save: jest.fn(),
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
import { destroy, save } from "../../api/crud";
import { DesignerPanelHeader } from "../../farm_designer/designer_panel";
import { Actions } from "../../constants";
import { push } from "../../history";

describe("<EditPoint />", () => {
  const fakeProps = (): EditPointProps => ({
    findPoint: fakePoint,
    dispatch: jest.fn(),
    botOnline: true,
  });

  it("redirects", () => {
    mockPath = Path.mock(Path.points());
    const wrapper = mount(<EditPoint {...fakeProps()} />);
    expect(wrapper.text()).toContain("Redirecting...");
    expect(push).toHaveBeenCalledWith(Path.points());
  });

  it("doesn't redirect", () => {
    mockPath = Path.mock(Path.logs());
    const wrapper = mount(<EditPoint {...fakeProps()} />);
    expect(wrapper.text()).toContain("Redirecting...");
    expect(push).not.toHaveBeenCalled();
  });

  it("renders with points", () => {
    mockPath = Path.mock(Path.points(1));
    const p = fakeProps();
    const point = fakePoint();
    point.body.meta = { meta_key: "meta value" };
    p.findPoint = () => point;
    const wrapper = mount(<EditPoint {...p} />);
    expect(wrapper.text()).toContain("Edit point");
    expect(wrapper.text()).toContain("meta value");
  });

  it("doesn't render duplicate values", () => {
    mockPath = Path.mock(Path.points(1));
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
    mockPath = Path.mock(Path.points(1));
    const p = fakeProps();
    const point = fakePoint();
    const coords = { x: 1, y: -2, z: 3 };
    Object.entries(coords).map(([axis, value]: [Xyz, number]) =>
      point.body[axis] = value);
    p.findPoint = () => point;
    const wrapper = mount(<EditPoint {...p} />);
    wrapper.find("button").first().simulate("click");
    expect(push).toHaveBeenCalledWith(Path.location(coords));
  });

  it("goes back", () => {
    mockPath = Path.mock(Path.points(1));
    const p = fakeProps();
    const wrapper = shallow(<EditPoint {...p} />);
    wrapper.find(DesignerPanelHeader).simulate("back");
    expect(p.dispatch).toHaveBeenCalledWith({
      type: Actions.TOGGLE_HOVERED_POINT, payload: undefined
    });
  });

  it("saves", () => {
    mockPath = Path.mock(Path.points(1));
    const p = fakeProps();
    const point = fakePoint();
    point.body.id = 1;
    p.findPoint = () => point;
    const wrapper = shallow(<EditPoint {...p} />);
    wrapper.find(DesignerPanelHeader).simulate("save");
    expect(save).toHaveBeenCalledWith(point.uuid);
  });

  it("doesn't save", () => {
    mockPath = Path.mock(Path.logs());
    const p = fakeProps();
    const point = fakePoint();
    point.body.id = 1;
    p.findPoint = () => point;
    const wrapper = shallow(<EditPoint {...p} />);
    wrapper.find(DesignerPanelHeader).simulate("save");
    expect(save).not.toHaveBeenCalled();
  });

  it("deletes point", () => {
    mockPath = Path.mock(Path.points(1));
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
