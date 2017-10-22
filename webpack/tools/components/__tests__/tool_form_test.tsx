import * as React from "react";
import { ToolForm } from "../tool_form";
import { render } from "enzyme";
import { mapStateToProps } from "../../state_to_props";
import { fakeState } from "../../../__test_support__/fake_state";

describe("<ToolForm/>", () => {
  function bootstrapTest() {
    const state = fakeState();
    const toggle = jest.fn();
    const props = mapStateToProps(state);
    return {
      state,
      toggle,
      props,
      component: render(<ToolForm dispatch={state.dispatch}
        tools={props.tools}
        toggle={toggle} />)
    };
  }
  it("renders", () => {
    const test = bootstrapTest();
    // FAILED
    expect(test.component.find("input").length)
      .toEqual(test.props.tools.length);
  });

  it("shows a DIRTY flag when any of the tools are dirty", () => {
    pending("Might not need this test- seems to be testing getArrayStatus()");
  });
});
