import * as React from "react";
import { ToolBayForm } from "../toolbay_form";
import { mount } from "enzyme";
import { mapStateToProps } from "../../state_to_props";
import { fakeState } from "../../../__test_support__/fake_state";

describe("<ToolBayForm/>", () => {
  function bootstrapTest() {
    let state = fakeState();
    let toggle = jest.fn();
    let props = mapStateToProps(state);
    return {
      state,
      toggle,
      props,
      component: mount(<ToolBayForm
        toggle={toggle}
        dispatch={state.dispatch}
        toolSlots={props.toolSlots}
        getToolSlots={props.getToolSlots}
        getChosenToolOption={props.getChosenToolOption}
        getToolOptions={props.getToolOptions}
        changeToolSlot={props.changeToolSlot} />)
    };
  }
  it("renders", () => {
    let test = bootstrapTest();

    expect(test.component.find("input").length).toEqual(3);
    expect(test.component.text()).toContain("Trench Digging Tool");
  });

});
