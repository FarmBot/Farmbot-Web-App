import * as React from "react";
import { ToolBayList } from "../toolbay_list";
import { mount } from "enzyme";
import { mapStateToProps } from "../../state_to_props";
import { fakeState } from "../../../__test_support__/fake_state";

describe("<ToolBayList />", () => {
  function bootstrapTest() {
    let state = fakeState();
    let toggle = jest.fn();
    let props = mapStateToProps(state);
    return {
      state,
      toggle,
      props,
      component: mount(<ToolBayList dispatch={state.dispatch}
        getToolByToolSlotUUID={props.getToolByToolSlotUUID}
        getToolSlots={props.getToolSlots}
        toggle={toggle} />)
    };
  }
  it("renders", () => {
    let test = bootstrapTest();
    expect(test.component.text()).toContain("1101010Trench Digging Tool");
  });
});
