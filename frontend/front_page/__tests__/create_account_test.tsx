let mockResponse = Promise.resolve("");
jest.mock("../resend_verification", () => ({
  resendEmail: jest.fn(() => mockResponse),
}));

import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import {
  FormField, sendEmail, DidRegister, MustRegister, CreateAccount,
  FormFieldProps, CreateAccountProps,
} from "../create_account";
import { success, error } from "../../toast/toast";
import { resendEmail } from "../resend_verification";
import { Content } from "../../constants";
import { changeBlurableInputRTL } from "../../__test_support__/helpers";

describe("<FormField />", () => {
  const fakeProps = (): FormFieldProps => ({
    label: "My Label",
    type: "email",
    value: "my val",
    onCommit: jest.fn(),
  });

  it("renders correct props", () => {
    const p = fakeProps();
    render(<FormField {...p} />);
    expect(screen.getByDisplayValue("my val")).toBeInTheDocument();
    const input = screen.getByLabelText("My Label");
    changeBlurableInputRTL(input, "foo");
    expect(p.onCommit).toHaveBeenCalledWith("foo");
  });
});

describe("sendEmail()", () => {
  it("calls success() when things are OK", async () => {
    await sendEmail("send@email.com", jest.fn());
    expect(success).toHaveBeenCalledWith(Content.VERIFICATION_EMAIL_RESENT);
    expect(resendEmail).toHaveBeenCalledWith("send@email.com");
  });

  it("calls error() when things are not OK", async () => {
    mockResponse = Promise.reject("");
    await sendEmail("send@email.com", jest.fn());
    expect(error).toHaveBeenCalledWith(Content.VERIFICATION_EMAIL_RESEND_ERROR);
    expect(resendEmail).toHaveBeenCalledWith("send@email.com");
  });
});

const fakeCreateAccountProps = (): CreateAccountProps => ({
  submitRegistration: jest.fn(),
  sent: false,
  get: jest.fn(),
  set: jest.fn(),
  callback: jest.fn(),
});

describe("<DidRegister />", () => {
  it("renders <ResendPanelBody/>", () => {
    const p = fakeCreateAccountProps();
    p.get = jest.fn(() => "example2@earthlink.net");
    render(<DidRegister {...p} />);
    const button = screen.getByRole("button");
    fireEvent.click(button);
    expect(resendEmail).toHaveBeenCalledWith("example2@earthlink.net");
  });

  it("bails on missing email", () => {
    expect(() => render(<DidRegister {...fakeCreateAccountProps()} />))
      .toThrow();
  });
});

describe("<MustRegister />", () => {
  it("renders the expected components", () => {
    render(<MustRegister {...fakeCreateAccountProps()} />);
    expect(screen.getByText("Create Account")).toBeInTheDocument();
  });

  it("inputs username", () => {
    const p = fakeCreateAccountProps();
    render(<MustRegister {...p} />);
    const input = screen.getByLabelText("Name");
    changeBlurableInputRTL(input, "name");
    expect(p.set).toHaveBeenCalledWith("regName", "name");
  });

  it("inputs password", () => {
    const p = fakeCreateAccountProps();
    render(<MustRegister {...p} />);
    const input = screen.getByLabelText("Password");
    fireEvent.blur(input, { target: { value: "password" } });
    expect(p.set).toHaveBeenCalledWith("regPassword", "password");
  });
});

describe("<CreateAccount />", () => {
  it("renders <DidRegister /> after verification email is sent", () => {
    const p = fakeCreateAccountProps();
    p.sent = true;
    p.get = jest.fn(() => "example2@earthlink.net");
    render(<CreateAccount {...p} />);
    expect(screen.getByText("Resend Verification Email")).toBeInTheDocument();
  });

  it("renders <MustRegister /> before verification email is sent", () => {
    render(<CreateAccount {...fakeCreateAccountProps()} />);
    expect(screen.getByText("Create Account")).toBeInTheDocument();
  });
});
