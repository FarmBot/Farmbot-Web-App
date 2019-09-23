jest.mock("react-redux", () => ({ connect: jest.fn(() => (x: {}) => x) }));

import * as React from "react";
import { mount } from "enzyme";
import { Help, mapStateToProps } from "../help";
import { fakeState } from "../../__test_support__/fake_state";
import { clickButton } from "../../__test_support__/helpers";
import { tourNames } from "../tours";
import { Actions } from "../../constants";

describe("<Help />", () => {
  const fakeProps = () => ({ dispatch: jest.fn() });

  it("renders", () => {
    const wrapper = mount(<Help {...fakeProps()} />);
    ["help with", "start tour", "getting started"].map(string =>
      expect(wrapper.text().toLowerCase()).toContain(string.toLowerCase()));
  });

  it("starts tour", () => {
    const p = fakeProps();
    const wrapper = mount(<Help {...p} />);
    clickButton(wrapper, 0, "start tour");
    expect(p.dispatch).toHaveBeenCalledWith({
      type: Actions.START_TOUR,
      payload: tourNames()[0].name
    });
  });
});

describe("mapStateToProps()", () => {
  it("returns props", () => {
    const props = mapStateToProps(fakeState());
    expect(props).toEqual({ dispatch: expect.any(Function) });
  });
});
