jest.mock("react-redux", () => ({ connect: jest.fn() }));

let mockPath = "/app/designer/points/1";
jest.mock("../../../history", () => ({
  getPathArray: jest.fn(() => mockPath.split("/")),
  history: { push: jest.fn() }
}));

import * as React from "react";
import { mount } from "enzyme";
import { EditPoint, EditPointProps, mapStateToProps } from "../point_info";
import { fakePoint } from "../../../__test_support__/fake_state/resources";
import { fakeState } from "../../../__test_support__/fake_state";
import { buildResourceIndex } from "../../../__test_support__/resource_index_builder";

describe("<EditPoint />", () => {
  const fakeProps = (): EditPointProps => ({
    findPoint: fakePoint,
    dispatch: jest.fn(),
  });

  it("renders redirect", () => {
    mockPath = "/app/designer/points";
    const wrapper = mount(<EditPoint {...fakeProps()} />);
    expect(wrapper.text()).toContain("Redirecting...");
  });

  it("renders with points", () => {
    mockPath = "/app/designer/points/1";
    const wrapper = mount(<EditPoint {...fakeProps()} />);
    expect(wrapper.text()).toContain("Edit Point 1");
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
