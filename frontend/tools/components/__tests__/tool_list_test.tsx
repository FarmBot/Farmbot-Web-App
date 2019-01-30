import * as React from "react";
import { ToolList } from "../tool_list";
import { mount } from "enzyme";
import { mapStateToProps } from "../../state_to_props";
import { fakeState } from "../../../__test_support__/fake_state";
import { ToolListAndFormProps } from "../../interfaces";

describe("<ToolList />", () => {
  const fakeProps = (): ToolListAndFormProps => {
    const props = mapStateToProps(fakeState());
    return {
      dispatch: jest.fn(),
      tools: props.tools,
      toggle: jest.fn(),
      isActive: props.isActive,
    };
  };

  it("renders tool names and statuses", () => {
    const wrapper = mount(<ToolList {...fakeProps()} />);
    expect(wrapper.text()).toContain("Trench Digging Toolactive");
    expect(wrapper.text()).toContain("Berry Picking Toolinactive");
  });
});
