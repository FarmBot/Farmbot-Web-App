let mockPath = "/app/designer/weeds/1";
jest.mock("../../history", () => ({
  getPathArray: jest.fn(() => mockPath.split("/")),
  push: jest.fn(),
}));

jest.mock("../../api/crud", () => ({
  save: jest.fn(),
}));

import React from "react";
import { mount, shallow } from "enzyme";
import {
  RawEditWeed as EditWeed, EditWeedProps, mapStateToProps,
} from "../weeds_edit";
import { fakeWeed } from "../../__test_support__/fake_state/resources";
import { fakeState } from "../../__test_support__/fake_state";
import {
  buildResourceIndex,
} from "../../__test_support__/resource_index_builder";
import { Actions } from "../../constants";
import { DesignerPanelHeader } from "../../farm_designer/designer_panel";
import { push } from "../../history";
import { save } from "../../api/crud";

describe("<EditWeed />", () => {
  const fakeProps = (): EditWeedProps => ({
    dispatch: jest.fn(),
    findPoint: () => undefined,
    botOnline: true,
  });

  it("redirects", () => {
    mockPath = "/app/designer/weeds/nope";
    const wrapper = mount(<EditWeed {...fakeProps()} />);
    expect(wrapper.text()).toContain("Redirecting...");
    expect(push).toHaveBeenCalledWith("/app/designer/weeds");
  });

  it("doesn't redirect", () => {
    mockPath = "/app/logs";
    const wrapper = mount(<EditWeed {...fakeProps()} />);
    expect(wrapper.text()).toContain("Redirecting...");
    expect(push).not.toHaveBeenCalled();
  });

  it("renders", () => {
    mockPath = "/app/designer/weeds/1";
    const p = fakeProps();
    const weed = fakeWeed();
    weed.body.id = 1;
    p.findPoint = () => weed;
    const wrapper = mount(<EditWeed {...p} />);
    expect(wrapper.text().toLowerCase()).toContain("edit");
  });

  it("goes back", () => {
    mockPath = "/app/designer/weeds/1";
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

  it("saves", () => {
    mockPath = "/app/designer/weeds/1";
    const p = fakeProps();
    const weed = fakeWeed();
    weed.body.id = 1;
    p.findPoint = () => weed;
    const wrapper = shallow(<EditWeed {...p} />);
    wrapper.find(DesignerPanelHeader).simulate("save");
    expect(save).toHaveBeenCalledWith(weed.uuid);
  });

  it("doesn't save", () => {
    mockPath = "/app/designer/logs";
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
    weed.body.id = 1;
    state.resources = buildResourceIndex([weed]);
    const props = mapStateToProps(state);
    expect(props.findPoint(1)).toEqual(weed);
  });
});
