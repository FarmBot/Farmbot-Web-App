import { mount } from "enzyme";
import React from "react";
import { Popover, PopoverProps } from "../popover";

describe("<Popover />", () => {
  const fakeProps = (): PopoverProps => ({
    target: <p>target</p>,
    content: <p>content</p>
  });

  it("renders popover", () => {
    const wrapper = mount(<Popover {...fakeProps()} />);
    expect(wrapper.text()).toContain("target");
  });
});
