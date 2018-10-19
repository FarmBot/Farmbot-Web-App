jest.mock("../../../api/crud", () => ({
  init: jest.fn(),
  saveAll: jest.fn(),
}));

import * as React from "react";
import { ToolBayForm } from "../toolbay_form";
import { mount } from "enzyme";
import { mapStateToProps } from "../../state_to_props";
import { fakeState } from "../../../__test_support__/fake_state";
import { ToolBayFormProps } from "../../interfaces";
import { clickButton } from "../../../__test_support__/helpers";
import { saveAll, init } from "../../../api/crud";
import { emptyToolSlot } from "../empty_tool_slot";

describe("<ToolBayForm/>", () => {
  const fakeProps = (): ToolBayFormProps => {
    const props = mapStateToProps(fakeState());
    return {
      toggle: jest.fn(),
      dispatch: jest.fn(),
      toolSlots: props.toolSlots,
      getToolSlots: props.getToolSlots,
      getChosenToolOption: props.getChosenToolOption,
      getToolOptions: props.getToolOptions,
      changeToolSlot: props.changeToolSlot,
      botPosition: { x: 1, y: 2, z: 3 },
    };
  };

  it("renders ToolSlot", () => {
    const wrapper = mount(<ToolBayForm {...fakeProps()} />);
    const inputs = wrapper.find("input");
    expect(inputs.length).toEqual(3);
    expect(wrapper.text()).toContain("Trench Digging Tool");
    [0, 1, 2].map(i => expect(inputs.at(i).props().value).toEqual("10"));
  });

  it("saves tool slots", () => {
    const wrapper = mount(<ToolBayForm {...fakeProps()} />);
    clickButton(wrapper, 1, "saved", { partial_match: true });
    expect(saveAll).toHaveBeenCalledTimes(1);
  });

  it("adds new tool slot", () => {
    const wrapper = mount(<ToolBayForm {...fakeProps()} />);
    clickButton(wrapper, 2, "");
    expect(init).toHaveBeenCalledWith(emptyToolSlot());
  });
});
