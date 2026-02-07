import React from "react";
import { mount } from "enzyme";
import { InputError, InputErrorProps } from "../input_error";
import * as popover from "../popover";

let popoverSpy: jest.SpyInstance;

beforeEach(() => {
  popoverSpy = jest.spyOn(popover, "Popover")
    .mockImplementation(({ target, content }: popover.PopoverProps) =>
      <div>{target}{content}</div>);
});

afterEach(() => {
  popoverSpy.mockRestore();
});

describe("<InputError />", () => {
  const fakeProps = (): InputErrorProps => ({
    error: "error",
  });

  it("returns error", () => {
    const wrapper = mount(<InputError {...fakeProps()} />);
    expect(wrapper.text()).toContain("error");
  });
});
