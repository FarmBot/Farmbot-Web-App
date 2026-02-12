import React from "react";
import { render } from "@testing-library/react";
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
    const { container } = render(<InputError {...fakeProps()} />);
    expect(container.textContent).toContain("error");
  });
});
