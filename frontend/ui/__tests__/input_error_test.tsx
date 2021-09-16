import { PopoverProps } from "../popover";
jest.mock("../popover", () => ({
  Popover: ({ target, content }: PopoverProps) => <div>{target}{content}</div>,
}));

import React from "react";
import { mount } from "enzyme";
import { InputError, InputErrorProps } from "../input_error";

describe("<InputError />", () => {
  const fakeProps = (): InputErrorProps => ({
    error: "error",
  });

  it("returns error", () => {
    const wrapper = mount(<InputError {...fakeProps()} />);
    expect(wrapper.text()).toContain("error");
  });
});
