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
      .mockReturnValueOnce(Promise.resolve(""))
  };
});

import * as React from "react";
import {
  FormField, sendEmail, DidRegister, MustRegister, CreateAccount
} from "../create_account";
import { shallow } from "enzyme";
import { BlurableInput } from "../../ui/index";
import { success, error } from "farmbot-toastr";
import { resendEmail } from "../resend_verification";
import { ResendPanelBody } from "../resend_panel_body";
import { BlurablePassword } from "../../ui/blurable_password";
import { Content } from "../../constants";

describe("<FormField/>", () => {
  it("renders correct props", () => {
    const onCommit = jest.fn();
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
    expect(success).toHaveBeenCalledWith(Content.VERIFICATION_EMAIL_RESENT);
    expect(resendEmail).toHaveBeenCalledWith("send@email.com");
  });

  it("calls error() when things are not OK", async () => {
    await sendEmail("send@email.com");
    expect(error).toHaveBeenCalledWith(Content.VERIFICATION_EMAIL_RESEND_ERROR);
    expect(resendEmail).toHaveBeenCalledWith("send@email.com");
  });
});

describe("<DidRegister/>", () => {
  it("renders <ResendPanelBody/>", () => {
    const props = {
      submitRegistration: jest.fn(),
      sent: false,
      get: jest.fn(() => "example2@earthlink.net"),
      set: jest.fn()
    };

    const el = shallow(<DidRegister {...props} />);
    const rpb = el.find(ResendPanelBody);
    expect(rpb.length).toEqual(1);
    rpb.simulate("click");
    expect(resendEmail).toHaveBeenCalledWith("example2@earthlink.net");
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

describe("<MustRegister/>", () => {
  it("renders the expected components", () => {
    const el = shallow(<MustRegister submitRegistration={jest.fn()}
      sent={false}
      get={jest.fn()}
      set={jest.fn()} />);
    expect(el.find(FormField).length).toEqual(2);
    expect(el.find(BlurablePassword).length).toEqual(2);
    expect(el.html().toLowerCase()).toContain("create account");
  });
});

describe("<CreateAccount/>", () => {
  it("renders <DidRegister/> when props.sent === true", () => {
    const el = shallow(<CreateAccount submitRegistration={jest.fn()}
      sent={true}
      get={jest.fn()}
      set={jest.fn()} />);
    expect(el.find(DidRegister).length).toEqual(1);
    expect(el.find(MustRegister).length).toEqual(0);
  });

  it("renders <MustRegister/> when props.sent === false", () => {
    const el = shallow(<CreateAccount submitRegistration={jest.fn()}
      sent={false}
      get={jest.fn()}
      set={jest.fn()} />);
    expect(el.find(DidRegister).length).toEqual(0);
    expect(el.find(MustRegister).length).toEqual(1);
  });
});
