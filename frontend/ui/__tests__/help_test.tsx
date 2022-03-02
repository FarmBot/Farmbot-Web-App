import { PopoverProps } from "../popover";
jest.mock("../popover", () => ({
  Popover: ({ target, content }: PopoverProps) => <div>{target}{content}</div>,
}));

import React from "react";
import { mount } from "enzyme";
import { Help, HelpProps } from "../help";

describe("<Help />", () => {
  const fakeProps = (): HelpProps => ({
    text: "tip",
  });

  it("returns help", () => {
    const wrapper = mount(<Help {...fakeProps()} />);
    expect(wrapper.text()).toContain("tip");
  });

  it("returns help markdown", () => {
    const p = fakeProps();
    p.enableMarkdown = true;
    p.text = "# title";
    const wrapper = mount(<Help {...p} />);
    expect(wrapper.text()).not.toContain("#");
  });
});
