import React from "react";
import { ForgotPassword } from "../forgot_password";
import { fireEvent, render } from "@testing-library/react";

describe("<ForgotPassword/>", () => {
  it("calls onSubmit()", () => {
    const props = {
      onGoBack: jest.fn(),
      onSubmit: jest.fn(),
      email: "stubbo_mc_stubbington@gmail.com",
      onEmailChange: jest.fn()
    };

    const { container } = render(<ForgotPassword {...props} />);
    const form = container.querySelector("form");
    expect(form).toBeTruthy();
    fireEvent.submit(form as HTMLFormElement);

    expect(props.onSubmit).toHaveBeenCalled();
  });
});
