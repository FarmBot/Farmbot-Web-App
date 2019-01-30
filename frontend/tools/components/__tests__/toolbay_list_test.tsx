import * as React from "react";
import { ToolBayList } from "../toolbay_list";
import { mount } from "enzyme";
import { mapStateToProps } from "../../state_to_props";
import { fakeState } from "../../../__test_support__/fake_state";
import { ToolBayListProps } from "../../interfaces";

describe("<ToolBayList />", () => {
  const fakeProps = (): ToolBayListProps => {
    const props = mapStateToProps(fakeState());
    return {
      getToolByToolSlotUUID: props.getToolByToolSlotUUID,
      getToolSlots: props.getToolSlots,
      toggle: jest.fn(),
    };
  };

  it("renders", () => {
    const wrapper = mount(<ToolBayList {...fakeProps()} />);
    expect(wrapper.text()).toContain("1101010Trench Digging Tool");
  });
});
