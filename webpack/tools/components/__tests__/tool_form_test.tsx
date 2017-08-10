import * as React from "react";
import { ToolForm } from "../tool_form";
import { mount } from "enzyme";
import { mapStateToProps } from "../../state_to_props";
import { fakeState } from "../../../__test_support__/fake_state";

describe("<ToolForm/>", () => {
  function bootstrapTest() {
    let state = fakeState();
    let toggle = jest.fn();
    let props = mapStateToProps(state);
    return {
      state,
      toggle,
      props,
      component: mount(<ToolForm dispatch={state.dispatch}
        tools={props.tools}
        toggle={toggle} />)
    };
  }
  it("renders", () => {
    let test = bootstrapTest();

    expect(test.component.find("input").length)
      .toEqual(test.props.tools.length);
  });

});
