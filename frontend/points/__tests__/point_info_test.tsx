jest.mock("../../api/crud", () => ({
  destroy: jest.fn(),
  save: jest.fn(),
  edit: jest.fn(),
}));

jest.mock("../../devices/actions", () => ({ move: jest.fn() }));

import { PopoverProps } from "../../ui/popover";
jest.mock("../../ui/popover", () => ({
  Popover: ({ target, content }: PopoverProps) => <div>{target}{content}</div>,
}));

import React from "react";
import { mount, shallow } from "enzyme";
import {
  RawEditPoint as EditPoint, EditPointProps,
  mapStateToProps,
} from "../point_info";
import {
  fakePoint, fakeWebAppConfig,
} from "../../__test_support__/fake_state/resources";
import { fakeState } from "../../__test_support__/fake_state";
import {
  buildResourceIndex,
} from "../../__test_support__/resource_index_builder";
import { clickButton } from "../../__test_support__/helpers";
import { destroy, edit, save } from "../../api/crud";
import { DesignerPanelHeader } from "../../farm_designer/designer_panel";
import { Actions } from "../../constants";
import { move } from "../../devices/actions";
import { fakeMovementState } from "../../__test_support__/fake_bot_data";
import { Path } from "../../internal_urls";

describe("<EditPoint />", () => {
  const fakeProps = (): EditPointProps => ({
    findPoint: fakePoint,
    dispatch: jest.fn(),
    botOnline: true,
    defaultAxes: "XY",
    arduinoBusy: false,
    currentBotLocation: { x: 10, y: 20, z: 30 },
    movementState: fakeMovementState(),
  });

  it("redirects", () => {
    location.pathname = Path.mock(Path.points());
    const wrapper = mount(<EditPoint {...fakeProps()} />);
    expect(wrapper.text()).toContain("Redirecting...");
    expect(mockNavigate).toHaveBeenCalledWith(Path.points());
  });

  it("doesn't redirect", () => {
    location.pathname = Path.mock(Path.logs());
    const wrapper = mount(<EditPoint {...fakeProps()} />);
    expect(wrapper.text()).toContain("Redirecting...");
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it("renders with points", () => {
    location.pathname = Path.mock(Path.points(1));
    const p = fakeProps();
    const point = fakePoint();
    point.body.name = "Point 1";
    point.body.meta = { meta_key: "meta value" };
    p.findPoint = () => point;
    const wrapper = mount(<EditPoint {...p} />);
    expect(wrapper.text()).toContain("Point 1");
    expect(wrapper.text()).toContain("meta value");
  });

  it("doesn't render duplicate values", () => {
    location.pathname = Path.mock(Path.points(1));
    const p = fakeProps();
    const point = fakePoint();
    point.body.name = "Point 1";
    point.body.meta = { color: "red", meta_key: undefined, gridId: "123" };
    p.findPoint = () => point;
    const wrapper = mount(<EditPoint {...p} />);
    expect(wrapper.text()).toContain("Point 1");
    expect(wrapper.text()).not.toContain("red");
    expect(wrapper.text()).not.toContain("grid");
  });

  it("moves to point location", () => {
    const wrapper = mount(<EditPoint {...fakeProps()} />);
    clickButton(wrapper, 0, "go (x, y)");
    expect(move).toHaveBeenCalledWith({ x: 200, y: 400, z: 30 });
  });

  it("goes back", () => {
    location.pathname = Path.mock(Path.points(1));
    const p = fakeProps();
    const wrapper = shallow(<EditPoint {...p} />);
    wrapper.find(DesignerPanelHeader).simulate("back");
    expect(p.dispatch).toHaveBeenCalledWith({
      type: Actions.TOGGLE_HOVERED_POINT, payload: undefined
    });
  });

  it("changes color", () => {
    location.pathname = Path.mock(Path.points(1));
    const p = fakeProps();
    const wrapper = mount(<EditPoint {...p} />);
    wrapper.find(".color-picker-item-wrapper").first().simulate("click");
    expect(edit).toHaveBeenCalledWith(expect.any(Object),
      { meta: { color: "blue" } });
  });

  it("saves", () => {
    location.pathname = Path.mock(Path.points(1));
    const p = fakeProps();
    const point = fakePoint();
    point.body.id = 1;
    p.findPoint = () => point;
    const wrapper = shallow(<EditPoint {...p} />);
    wrapper.find(DesignerPanelHeader).simulate("save");
    expect(save).toHaveBeenCalledWith(point.uuid);
  });

  it("doesn't save", () => {
    location.pathname = Path.mock(Path.logs());
    const p = fakeProps();
    const point = fakePoint();
    point.body.id = 1;
    p.findPoint = () => point;
    const wrapper = shallow(<EditPoint {...p} />);
    wrapper.find(DesignerPanelHeader).simulate("save");
    expect(save).not.toHaveBeenCalled();
  });

  it("deletes point", () => {
    location.pathname = Path.mock(Path.points(1));
    const p = fakeProps();
    const point = fakePoint();
    p.findPoint = () => point;
    const wrapper = mount(<EditPoint {...p} />);
    wrapper.find(".fa-trash").first().simulate("click");
    expect(destroy).toHaveBeenCalledWith(point.uuid);
  });
});

describe("mapStateToProps()", () => {
  it("returns props", () => {
    const state = fakeState();
    const point = fakePoint();
    const config = fakeWebAppConfig();
    config.body.go_button_axes = "X";
    point.body.id = 1;
    state.resources = buildResourceIndex([point, config]);
    const props = mapStateToProps(state);
    expect(props.findPoint(1)).toEqual(point);
    expect(props.defaultAxes).toEqual("X");
  });
});
