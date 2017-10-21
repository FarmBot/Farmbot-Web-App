jest.mock("farmbot-toastr", () => ({
  success: jest.fn(),
  error: jest.fn(),
  info: jest.fn(),
  warning: jest.fn()
}));

jest.mock("../resend_verification", () => {

  return {
    resendEmail: jest
      .fn()
      .mockReturnValueOnce(Promise.resolve("")) // success case
      .mockReturnValueOnce(Promise.reject(""))  // failure case
  };
});

import * as React from "react";
import { FormField, sendEmail, DidRegister } from "../create_account";
import { shallow } from "enzyme";
import { BlurableInput } from "../../ui/index";
import { success, error } from "farmbot-toastr";
import { resendEmail } from "../resend_verification";
import { ResendPanelBody } from "../resend_panel_body";

describe("<FormField/>", () => {
  it("renders correct props", () => {
    const onCommit = jest.fn(); // TODO: Why is this not triggering in enzyme?
    const el = shallow(<FormField
      onCommit={onCommit}
      value="my val"
      label="My Label"
      type="email" />);
    expect(el.find(BlurableInput).prop("value")).toEqual("my val");
    expect(el.find(BlurableInput).prop("type")).toEqual("email");
    expect(el.find("label").first().text()).toContain("My Label");
    el.find(BlurableInput).first().simulate("commit", {
      currentTarget: { value: "foobar321" }
    });
    expect(onCommit).toHaveBeenCalledWith("foobar321");
  });
});

describe("sendEmail()", () => {
  it("calls success() when things are OK", async () => {
    await sendEmail("send@email.com");
    expect(success).toHaveBeenCalledWith("Email sent.");
    expect(resendEmail).toHaveBeenCalledWith("send@email.com");
  });

  it("calls error() when things are not OK", async () => {
    await sendEmail("send@email.com");
    expect(error).toHaveBeenCalledWith("Unable to send email.");
    expect(resendEmail).toHaveBeenCalledWith("send@email.com");
  });
});

describe("<DidRegister/>", () => {
  it("renders <ResendPanelBody/>", () => {
    const props = {
      submitRegistration: jest.fn(),
      sent: false,
      get: jest.fn(() => "OK"),
      set: jest.fn()
    };
    const el = shallow(<DidRegister {...props} />);
    expect(el.find(ResendPanelBody).length).toEqual(1);
  });

  it("bail()s on missing email", () => {
    const props = {
      submitRegistration: jest.fn(),
      sent: false,
      get: jest.fn(),
      set: jest.fn()
    };

    expect(() => shallow(<DidRegister {...props} />)).toThrowError();
  });
});

describe("<CreateAccount/>", () => {
  it("renders <DidRegister/> when props.sent === true"); // Use shallow
});
