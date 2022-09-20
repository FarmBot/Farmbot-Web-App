import { Path } from "../../internal_urls";
let mockPath = Path.mock(Path.weeds(1));
jest.mock("../../history", () => ({
  getPathArray: jest.fn(() => mockPath.split("/")),
  push: jest.fn(),
}));

jest.mock("../../api/crud", () => ({
  save: jest.fn(),
  edit: jest.fn(),
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
import { push } from "../../history";
import { edit, save } from "../../api/crud";
import { ColorPicker } from "../../ui";
import { fakeMovementState } from "../../__test_support__/fake_bot_data";

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
    mockPath = Path.mock(Path.weeds("nope"));
    const wrapper = mount(<EditWeed {...fakeProps()} />);
    expect(wrapper.text()).toContain("Redirecting...");
    expect(push).toHaveBeenCalledWith(Path.weeds());
  });

  it("doesn't redirect", () => {
    mockPath = Path.mock(Path.logs());
    const wrapper = mount(<EditWeed {...fakeProps()} />);
    expect(wrapper.text()).toContain("Redirecting...");
    expect(push).not.toHaveBeenCalled();
  });

  it("renders", () => {
    mockPath = Path.mock(Path.weeds(1));
    const p = fakeProps();
    const weed = fakeWeed();
    weed.body.name = "weed 1";
    weed.body.id = 1;
    p.findPoint = () => weed;
    const wrapper = mount(<EditWeed {...p} />);
    expect(wrapper.text().toLowerCase()).toContain("weed 1");
  });

  it("goes back", () => {
    mockPath = Path.mock(Path.weeds(1));
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
    mockPath = Path.mock(Path.weeds(1));
    const p = fakeProps();
    p.findPoint = fakeWeed;
    const wrapper = shallow(<EditWeed {...p} />);
    wrapper.find(ColorPicker).simulate("change", "blue");
    expect(edit).toHaveBeenCalledWith(expect.any(Object),
      { meta: { color: "blue" } });
  });

  it("saves", () => {
    mockPath = Path.mock(Path.weeds(1));
    const p = fakeProps();
    const weed = fakeWeed();
    weed.body.id = 1;
    p.findPoint = () => weed;
    const wrapper = shallow(<EditWeed {...p} />);
    wrapper.find(DesignerPanelHeader).simulate("save");
    expect(save).toHaveBeenCalledWith(weed.uuid);
  });

  it("doesn't save", () => {
    mockPath = Path.mock(Path.logs());
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
