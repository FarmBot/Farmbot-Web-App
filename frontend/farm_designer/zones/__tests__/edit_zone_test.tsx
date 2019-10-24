let mockPath = "/app/designer/zones/1";
jest.mock("../../../history", () => ({
  getPathArray: jest.fn(() => mockPath.split("/")),
  history: { push: jest.fn() }
}));

import * as React from "react";
import { mount } from "enzyme";
import {
  RawEditZone as EditZone, EditZoneProps, mapStateToProps
} from "../edit_zone";
import { fakeState } from "../../../__test_support__/fake_state";

describe("<EditZone />", () => {
  const fakeProps = (): EditZoneProps => ({
    dispatch: jest.fn(),
    findZone: () => undefined,
  });

  it("redirects", () => {
    mockPath = "/app/designer/zones";
    const wrapper = mount(<EditZone {...fakeProps()} />);
    expect(wrapper.text()).toContain("Redirecting...");
  });

  it("renders", () => {
    mockPath = "/app/designer/zones/1";
    const p = fakeProps();
    p.findZone = () => "stub zone";
    const wrapper = mount(<EditZone {...p} />);
    expect(wrapper.text().toLowerCase()).toContain("edit");
  });
});

describe("mapStateToProps()", () => {
  it("returns props", () => {
    const state = fakeState();
    const props = mapStateToProps(state);
    expect(props.findZone(1)).toEqual(undefined);
  });
});
