import * as React from "react";
import { ToolBayForm } from "../toolbay_form";
import { mount } from "enzyme";
import { mapStateToProps } from "../../state_to_props";
import { fakeState } from "../../../__test_support__/fake_state";
import { Actions } from "../../../constants";
import { SpecialStatus } from "../../../resources/tagged_resources";

describe("<ToolBayForm/>", () => {
  function bootstrapTest() {
    const state = fakeState();
    const toggle = jest.fn();
    const props = mapStateToProps(state);
    const dispatch = jest.fn();
    return {
      state,
      toggle,
      props,
      dispatch,
      component: mount(<ToolBayForm
        toggle={toggle}
        dispatch={dispatch}
        toolSlots={props.toolSlots}
        getToolSlots={props.getToolSlots}
        getChosenToolOption={props.getChosenToolOption}
        getToolOptions={props.getToolOptions}
        changeToolSlot={props.changeToolSlot}
        botPosition={{ x: 1, y: 2, z: 3 }} />)
    };
  }

  it("renders ToolSlot", () => {
    const test = bootstrapTest();
    const inputs = test.component.find("input");
    expect(inputs.length).toEqual(3);
    expect(test.component.text()).toContain("Trench Digging Tool");
    [0, 1, 2].map(i => expect(inputs.at(i).props().value).toEqual("10"));
  });

  it("fills inputs with bot position", () => {
    const test = bootstrapTest();
    const buttons = test.component.find("button");
    expect(buttons.length).toEqual(6);
    buttons.at(3).simulate("click");
    expect(test.dispatch).toHaveBeenCalledWith({
      type: Actions.EDIT_RESOURCE,
      payload: expect.objectContaining({
        update: { x: 1, y: 2, z: 3 }
      })
    });
  });

});
