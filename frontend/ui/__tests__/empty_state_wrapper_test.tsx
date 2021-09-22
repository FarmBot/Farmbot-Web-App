import React from "react";
import { shallow } from "enzyme";
import { EmptyStateWrapper, EmptyStateWrapperProps } from "../empty_state_wrapper";

describe("<EmptyStateWrapper />", () => {
  const fakeProps = (): EmptyStateWrapperProps => ({
    notEmpty: false,
    graphic: "graphic",
    text: "text",
  });

  it("renders", () => {
    const wrapper = shallow(<EmptyStateWrapper {...fakeProps()} />);
    expect(wrapper.text()).toContain("text");
  });
});
