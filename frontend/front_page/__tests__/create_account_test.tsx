import React from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import {
  FormField, sendEmail, DidRegister, MustRegister, CreateAccount,
  FormFieldProps, CreateAccountProps,
} from "../create_account";
import { success, error } from "../../toast/toast";
import * as resendVerification from "../resend_verification";
import { Content } from "../../constants";
import { changeBlurableInputRTL } from "../../__test_support__/helpers";

let resendEmailSpy: jest.SpyInstance;
let mockResponse: Promise<unknown>;

beforeEach(() => {
  mockResponse = Promise.resolve("");
  resendEmailSpy = jest.spyOn(resendVerification, "resendEmail")
    .mockImplementation(() => mockResponse);
});

afterEach(() => {
  cleanup();
  jest.restoreAllMocks();
});

const findElement = (
  node: React.ReactNode,
  predicate: (element: React.ReactElement<{
    label?: string;
    onCommit?: (value: string) => void;
    children?: React.ReactNode;
  }>) => boolean,
): React.ReactElement<{
  label?: string;
  onCommit?: (value: string) => void;
  children?: React.ReactNode;
}> | undefined => {
  if (Array.isArray(node)) {
    for (const item of React.Children.toArray(node)) {
      const found = findElement(item, predicate);
      if (found) { return found; }
    }
    return undefined;
  }
  const element = node as React.ReactElement<{
    label?: string;
    onCommit?: (value: string) => void;
    children?: React.ReactNode;
  }>;
  if (!React.isValidElement(element)) { return undefined; }
  if (predicate(element)) { return element; }
  return findElement(element.props.children, predicate);
};

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
    const input = screen.getByDisplayValue("my val");
    changeBlurableInputRTL(input, "foo");
    expect(p.onCommit).toHaveBeenCalledWith("foo");
  });
});

describe("sendEmail()", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockResponse = Promise.resolve("");
  });

  it("calls success() when things are OK", async () => {
    await sendEmail("send@email.com", jest.fn());
    expect(success).toHaveBeenCalledWith(Content.VERIFICATION_EMAIL_RESENT);
    expect(resendEmailSpy).toHaveBeenCalledWith("send@email.com");
  });

  it("calls error() when things are not OK", async () => {
    mockResponse = Promise.reject("");
    await sendEmail("send@email.com", jest.fn());
    expect(error).toHaveBeenCalledWith(Content.VERIFICATION_EMAIL_RESEND_ERROR);
    expect(resendEmailSpy).toHaveBeenCalledWith("send@email.com");
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
    const button = screen.getByRole("button", {
      name: /resend verification email/i,
    });
    fireEvent.click(button);
    expect(resendEmailSpy).toHaveBeenCalledWith("example2@earthlink.net");
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
    const form = MustRegister(p);
    const field = findElement(form,
      element => element.type === FormField && element.props.label === "Name");
    if (!field || typeof field.props.onCommit !== "function") {
      throw new Error("Expected username field");
    }
    field.props.onCommit("name");
    expect(p.set).toHaveBeenCalledWith("regName", "name");
  });

  it("inputs password", () => {
    const p = fakeCreateAccountProps();
    const form = MustRegister(p);
    const field = findElement(form,
      element => element.type === FormField && element.props.label === "Password");
    if (!field || typeof field.props.onCommit !== "function") {
      throw new Error("Expected password field");
    }
    field.props.onCommit("password");
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
