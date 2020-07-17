import React from "react";
import { RawHelpPanel as HelpPanel, mapStateToProps } from "../help";
import { mount } from "enzyme";
import { clickButton } from "../../__test_support__/helpers";
import { Actions } from "../../constants";
import { tourNames } from "../tours";
import { fakeState } from "../../__test_support__/fake_state";

describe("<HelpPanel />", () => {
  it("starts tour", () => {
    const dispatch = jest.fn();
    const wrapper = mount(<HelpPanel dispatch={dispatch} />);
    clickButton(wrapper, 0, "start tour");
    expect(dispatch).toHaveBeenCalledWith({
      type: Actions.START_TOUR,
      payload: tourNames()[0].name
    });
  });
});

describe("mapStateToProps()", () => {
  it("returns props", () => {
    const props = mapStateToProps(fakeState());
    expect(props.dispatch).toEqual(expect.any(Function));
  });
});
