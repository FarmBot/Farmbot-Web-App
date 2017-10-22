import * as React from "react";
import { ToolForm } from "../tool_form";
import { shallow } from "enzyme";
import { mapStateToProps } from "../../state_to_props";
import { fakeState } from "../../../__test_support__/fake_state";
import { SpecialStatus } from "../../../resources/tagged_resources";

describe("<ToolForm/>", () => {
  function bootstrapTest() {
    const state = fakeState();
    const toggle = jest.fn();
    const props = mapStateToProps(state);
    return {
      state,
      toggle,
      props,
      component: shallow(<ToolForm dispatch={state.dispatch}
        tools={props.tools}
        toggle={toggle} />)
    };
  }
  it("renders", () => {
    const test = bootstrapTest();

    expect(test.component.find("input").length)
      .toEqual(test.props.tools.length);
  });
  it("shows a DIRTY flag when any of the tools are dirty", () => {
    const test = bootstrapTest();
    test.props.tools[0].specialStatus = SpecialStatus.DIRTY;
    test.component.update();
    const txt = test.component.text().replace(/\s+/g, " ");
    expect(txt).toContain("Save *");
  });
});
