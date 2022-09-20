let mockResponse = Promise.resolve("");
jest.mock("../resend_verification", () => ({
  resendEmail: jest.fn(() => mockResponse),
}));

import React from "react";
import {
  FormField, sendEmail, DidRegister, MustRegister, CreateAccount,
  FormFieldProps, CreateAccountProps,
} from "../create_account";
import { mount, shallow } from "enzyme";
import { BlurableInput } from "../../ui";
import { success, error } from "../../toast/toast";
import { resendEmail } from "../resend_verification";
import { ResendPanelBody } from "../resend_panel_body";
import { BlurablePassword } from "../../ui/blurable_password";
import { Content } from "../../constants";
import { changeBlurableInput } from "../../__test_support__/helpers";

describe("<FormField />", () => {
  const fakeProps = (): FormFieldProps => ({
    label: "My Label",
    type: "email",
    value: "my val",
    onCommit: jest.fn(),
  });

  it("renders correct props", () => {
    const p = fakeProps();
    const wrapper = shallow(<FormField {...p} />);
    expect(wrapper.find(BlurableInput).prop("value")).toEqual("my val");
    expect(wrapper.find(BlurableInput).prop("type")).toEqual("email");
    expect(wrapper.find("label").first().text()).toContain("My Label");
    wrapper.find(BlurableInput).first().simulate("commit", {
      currentTarget: { value: "foobar321" }
    });
    expect(p.onCommit).toHaveBeenCalledWith("foobar321");
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
    const wrapper = shallow(<DidRegister {...p} />);
    wrapper.find(ResendPanelBody).simulate("click");
    expect(resendEmail).toHaveBeenCalledWith("example2@earthlink.net");
  });

  it("bails on missing email", () => {
    expect(() => shallow(<DidRegister {...fakeCreateAccountProps()} />))
      .toThrow();
  });
});

describe("<MustRegister />", () => {
  it("renders the expected components", () => {
    const wrapper = shallow(<MustRegister {...fakeCreateAccountProps()} />);
    expect(wrapper.find(FormField).length).toEqual(2);
    expect(wrapper.find(BlurablePassword).length).toEqual(2);
    expect(wrapper.html().toLowerCase()).toContain("create account");
  });

  it("inputs username", () => {
    const p = fakeCreateAccountProps();
    const wrapper = mount(<MustRegister {...p} />);
    changeBlurableInput(wrapper, "name", 1);
    expect(p.set).toHaveBeenCalledWith("regName", "name");
  });

  it("inputs password", () => {
    const p = fakeCreateAccountProps();
    const wrapper = mount(<MustRegister {...p} />);
    const input = shallow(wrapper.find("input").at(2).getElement());
    input.simulate("blur", { currentTarget: { value: "password" } });
    expect(p.set).toHaveBeenCalledWith("regPassword", "password");
  });
});

describe("<CreateAccount />", () => {
  it("renders <DidRegister /> after verification email is sent", () => {
    const p = fakeCreateAccountProps();
    p.sent = true;
    const wrapper = shallow(<CreateAccount {...p} />);
    expect(wrapper.find(DidRegister).length).toEqual(1);
    expect(wrapper.find(MustRegister).length).toEqual(0);
  });

  it("renders <MustRegister /> before verification email is sent", () => {
    const wrapper = shallow(<CreateAccount {...fakeCreateAccountProps()} />);
    expect(wrapper.find(DidRegister).length).toEqual(0);
    expect(wrapper.find(MustRegister).length).toEqual(1);
  });
});
