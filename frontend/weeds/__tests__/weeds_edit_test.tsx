jest.mock("../../api/crud", () => ({
  save: jest.fn(),
  edit: jest.fn(),
  destroy: jest.fn(),
}));

import { PopoverProps } from "../../ui/popover";
jest.mock("../../ui/popover", () => ({
  Popover: ({ target, content }: PopoverProps) => <div>{target}{content}</div>,
}));

import React from "react";
import { mount, shallow } from "enzyme";
import {
  RawEditWeed as EditWeed, EditWeedProps, mapStateToProps,
} from "../weeds_edit";
import {
  fakeWebAppConfig, fakeWeed,
} from "../../__test_support__/fake_state/resources";
import { fakeState } from "../../__test_support__/fake_state";
import {
  buildResourceIndex,
} from "../../__test_support__/resource_index_builder";
import { Actions } from "../../constants";
import { DesignerPanelHeader } from "../../farm_designer/designer_panel";
import { destroy, edit, save } from "../../api/crud";
import { fakeMovementState } from "../../__test_support__/fake_bot_data";
import { Path } from "../../internal_urls";

describe("<EditWeed />", () => {
  const fakeProps = (): EditWeedProps => ({
    dispatch: jest.fn(),
    findPoint: () => undefined,
    botOnline: true,
    defaultAxes: "XY",
    arduinoBusy: false,
    currentBotLocation: { x: 10, y: 20, z: 30 },
    movementState: fakeMovementState(),
  });

  it("redirects", () => {
    location.pathname = Path.mock(Path.weeds("nope"));
    const wrapper = mount(<EditWeed {...fakeProps()} />);
    expect(wrapper.text()).toContain("Redirecting...");
    expect(mockNavigate).toHaveBeenCalledWith(Path.weeds());
  });

  it("doesn't redirect", () => {
    location.pathname = Path.mock(Path.logs());
    const wrapper = mount(<EditWeed {...fakeProps()} />);
    expect(wrapper.text()).toContain("Redirecting...");
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it("renders", () => {
    location.pathname = Path.mock(Path.weeds(1));
    const p = fakeProps();
    const weed = fakeWeed();
    weed.body.name = "weed 1";
    weed.body.id = 1;
    p.findPoint = () => weed;
    const wrapper = mount(<EditWeed {...p} />);
    expect(wrapper.text().toLowerCase()).toContain("weed 1");
  });

  it("goes back", () => {
    location.pathname = Path.mock(Path.weeds(1));
    const p = fakeProps();
    const weed = fakeWeed();
    weed.body.id = 1;
    p.findPoint = () => weed;
    const wrapper = shallow(<EditWeed {...p} />);
    wrapper.find(DesignerPanelHeader).simulate("back");
    expect(p.dispatch).toHaveBeenCalledWith({
      type: Actions.TOGGLE_HOVERED_POINT, payload: undefined
    });
  });

  it("changes color", () => {
    location.pathname = Path.mock(Path.weeds(1));
    const p = fakeProps();
    p.findPoint = fakeWeed;
    const wrapper = mount(<EditWeed {...p} />);
    wrapper.find(".color-picker-item-wrapper").first().simulate("click");
    expect(edit).toHaveBeenCalledWith(expect.any(Object),
      { meta: { color: "blue" } });
  });

  it("deletes weed", () => {
    location.pathname = Path.mock(Path.weeds(1));
    const p = fakeProps();
    const weed = fakeWeed();
    p.findPoint = () => weed;
    const wrapper = mount(<EditWeed {...p} />);
    wrapper.find(".fa-trash").first().simulate("click");
    expect(destroy).toHaveBeenCalledWith(weed.uuid);
  });

  it("saves", () => {
    location.pathname = Path.mock(Path.weeds(1));
    const p = fakeProps();
    const weed = fakeWeed();
    weed.body.id = 1;
    p.findPoint = () => weed;
    const wrapper = shallow(<EditWeed {...p} />);
    wrapper.find(DesignerPanelHeader).simulate("save");
    expect(save).toHaveBeenCalledWith(weed.uuid);
  });

  it("doesn't save", () => {
    location.pathname = Path.mock(Path.logs());
    const p = fakeProps();
    const weed = fakeWeed();
    weed.body.id = 1;
    p.findPoint = () => weed;
    const wrapper = shallow(<EditWeed {...p} />);
    wrapper.find(DesignerPanelHeader).simulate("save");
    expect(save).not.toHaveBeenCalled();
  });
});

describe("mapStateToProps()", () => {
  it("returns props", () => {
    const state = fakeState();
    const weed = fakeWeed();
    const config = fakeWebAppConfig();
    config.body.go_button_axes = "X";
    weed.body.id = 1;
    state.resources = buildResourceIndex([weed, config]);
    const props = mapStateToProps(state);
    expect(props.findPoint(1)).toEqual(weed);
    expect(props.defaultAxes).toEqual("X");
  });
});
