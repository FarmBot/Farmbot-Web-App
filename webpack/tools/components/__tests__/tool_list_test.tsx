import * as React from "react";
import { ToolList } from "../tool_list";
import { mount } from "enzyme";
import { mapStateToProps } from "../../state_to_props";
import { fakeState } from "../../../__test_support__/fake_state";

describe("<ToolList />", () => {
  function bootstrapTest() {
    const state = fakeState();
    const toggle = jest.fn();
    const props = mapStateToProps(state);
    return {
      state,
      toggle,
      props,
      component: mount<{}>(<ToolList dispatch={state.dispatch}
        tools={props.tools}
        toggle={toggle}
        isActive={props.isActive} />)
    };
  }
  it("renders tool names and statuses", () => {
    const test = bootstrapTest();
    expect(test.component.text()).toContain("Trench Digging Toolactive");
    expect(test.component.text()).toContain("Berry Picking Toolinactive");
  });
});
