let mockPath = "/app/designer/weeds/1";
jest.mock("../../../history", () => ({
  getPathArray: jest.fn(() => mockPath.split("/")),
  history: { push: jest.fn() }
}));

import * as React from "react";
import { mount } from "enzyme";
import {
  RawEditWeed as EditWeed, EditWeedProps, mapStateToProps
} from "../weeds_edit";
import { fakePoint } from "../../../__test_support__/fake_state/resources";
import { fakeState } from "../../../__test_support__/fake_state";
import {
  buildResourceIndex
} from "../../../__test_support__/resource_index_builder";

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
    const point = fakePoint();
    point.body.id = 1;
    p.findPoint = () => point;
    const wrapper = mount(<EditWeed {...p} />);
    expect(wrapper.text().toLowerCase()).toContain("edit");
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
