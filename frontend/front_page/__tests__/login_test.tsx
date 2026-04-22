import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { Login, LoginProps } from "../login";

describe("<Login />", () => {
  const fakeProps = (): LoginProps => ({
    email: undefined,
    onToggleForgotPassword: jest.fn(),
    onSubmit: jest.fn(),
    onEmailChange: jest.fn(),
    onLoginPasswordChange: jest.fn(),
  });

  it("shows login options", () => {
    const p = fakeProps();
    const { container } = render(<Login {...p} />);
    ["Email", "Password", "Forgot password?", "Login"]
      .map(string => expect(container.textContent).toContain(string));
  });

  it("interacts with login options", () => {
    const p = fakeProps();
    const { container } = render(<Login {...p} />);
    fireEvent.change(container.querySelectorAll("input")[0], {
      target: { value: "email" }
    });
    expect(p.onEmailChange).toHaveBeenCalled();
    expect((p.onEmailChange as jest.Mock).mock.calls.length).toEqual(1);
    fireEvent.change(container.querySelectorAll("input")[1], {
      target: { value: "password" }
    });
    expect(p.onLoginPasswordChange).toHaveBeenCalled();
    expect((p.onLoginPasswordChange as jest.Mock).mock.calls.length)
      .toEqual(1);
    fireEvent.click(screen.getByText("Forgot password?"));
    expect(p.onToggleForgotPassword).toHaveBeenCalled();
  });

  it("submits", () => {
    const p = fakeProps();
    const { container } = render(<Login {...p} />);
    fireEvent.submit(container.querySelector("form") as HTMLFormElement);
    expect(p.onSubmit).toHaveBeenCalled();
  });
});
