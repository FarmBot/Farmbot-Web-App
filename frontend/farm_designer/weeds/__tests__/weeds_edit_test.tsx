let mockPath = "/app/designer/weeds/1";
jest.mock("../../../history", () => ({
  getPathArray: jest.fn(() => mockPath.split("/")),
  history: { push: jest.fn() }
}));

import * as React from "react";
import { mount, shallow } from "enzyme";
import {
  RawEditWeed as EditWeed, EditWeedProps, mapStateToProps,
} from "../weeds_edit";
import { fakeWeed } from "../../../__test_support__/fake_state/resources";
import { fakeState } from "../../../__test_support__/fake_state";
import {
  buildResourceIndex,
} from "../../../__test_support__/resource_index_builder";
import { Actions } from "../../../constants";
import { DesignerPanelHeader } from "../../designer_panel";

describe("<EditWeed />", () => {
  const fakeProps = (): EditWeedProps => ({
    dispatch: jest.fn(),
    findPoint: () => undefined,
  });

  it("redirects", () => {
    mockPath = "/app/designer/weeds";
    const wrapper = mount(<EditWeed {...fakeProps()} />);
    expect(wrapper.text()).toContain("Redirecting...");
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
