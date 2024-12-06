import React from "react";
import { mount } from "enzyme";
import {
  RawAddZone as AddZone, AddZoneProps, mapStateToProps,
} from "../add_zone";
import { fakeState } from "../../__test_support__/fake_state";

describe("<AddZone />", () => {
  const fakeProps = (): AddZoneProps => ({
    dispatch: jest.fn(),
  });

  it("renders", () => {
    const wrapper = mount(<AddZone {...fakeProps()} />);
    expect(wrapper.text()).toContain("Add");
  });
});

describe("mapStateToProps()", () => {
  it("returns props", () => {
    const state = fakeState();
    const props = mapStateToProps(state);
    expect(props.dispatch).toEqual(expect.any(Function));
  });
});
