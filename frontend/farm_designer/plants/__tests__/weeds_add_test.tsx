import * as React from "react";
import { mount } from "enzyme";
import {
  RawAddWeed as AddWeed, AddWeedProps, mapStateToProps
} from "../weeds_add";
import { fakeState } from "../../../__test_support__/fake_state";

describe("<AddWeed />", () => {
  const fakeProps = (): AddWeedProps => ({
    dispatch: jest.fn(),
  });

  it("renders", () => {
    const wrapper = mount(<AddWeed {...fakeProps()} />);
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
