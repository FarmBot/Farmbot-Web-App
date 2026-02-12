import React from "react";
import { LockableButton, LockableButtonProps } from "../lockable_button";
import { fireEvent, render, screen } from "@testing-library/react";

describe("<LockableButton />", () => {
  const fakeProps = (): LockableButtonProps => ({
    disabled: false,
    onClick: jest.fn(),
  });

  it("does not trigger callback when clicked and disabled", () => {
    const p = fakeProps();
    p.disabled = true;
    render(<LockableButton {...p}>x</LockableButton>);
    fireEvent.click(screen.getByRole("button"));
    expect(p.onClick).not.toHaveBeenCalled();
  });

  it("does trigger callback when clicked and enabled", () => {
    const p = fakeProps();
    p.disabled = false;
    render(<LockableButton {...p}>x</LockableButton>);
    fireEvent.click(screen.getByRole("button"));
    expect(p.onClick).toHaveBeenCalled();
  });
});
