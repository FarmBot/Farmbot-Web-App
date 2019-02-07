let mockAxiosResponse = Promise.resolve({ data: "" });

jest.mock("axios", () => ({
  post: jest.fn(() => mockAxiosResponse)
}));

jest.mock("../../session", () => ({
  Session: {
    replaceToken: jest.fn(),
    fetchStoredToken: jest.fn(),
  }
}));

jest.mock("../../api", () => ({
  API: {
    setBaseUrl: jest.fn(),
    fetchBrowserLocation: jest.fn(),
    fetchHostName: () => "localhost",
    inferPort: () => 3000,
    current: {
      tokensPath: "://localhost:3000/api/tokens/",
      passwordResetPath: "resetPath",
      usersPath: "usersPath"
    }
  }
}));

import * as React from "react";
import { mount, shallow } from "enzyme";
import { FrontPage, setField, PartialFormEvent } from "../front_page";
import axios from "axios";
import { API } from "../../api";
import { Session } from "../../session";
import { success, error } from "farmbot-toastr";
import { Content } from "../../constants";

describe("<FrontPage />", () => {
  type FormEvent = React.FormEvent<{}>;
  const fakeEvent: Partial<FormEvent> = {
    preventDefault: jest.fn()
  };

  it("shows forgot password box", () => {
    const el = mount(<FrontPage />);
    expect(el.text()).not.toContain("Reset Password");
    el.find("a.forgot-password").first().simulate("click");
    expect(el.text()).toContain("Reset Password");
  });

  it("shows TOS and Privacy links", () => {
    const el = mount(<FrontPage />);
    ["Privacy Policy", "Terms of Use"].map(string =>
      expect(el.text()).toContain(string));
    ["https://farmbot.io/privacy/", "https://farmbot.io/tos/"]
      .map(string => expect(el.html()).toContain(string));
  });

  it("submits login: success", async () => {
    mockAxiosResponse = Promise.resolve({ data: "new data" });
    const el = mount<FrontPage>(<FrontPage />);
    el.setState({ email: "foo@bar.io", loginPassword: "password" });
    await el.instance().submitLogin(fakeEvent as FormEvent);
    expect(API.setBaseUrl).toHaveBeenCalled();
    expect(axios.post).toHaveBeenCalledWith(
      "://localhost:3000/api/tokens/",
      { user: { email: "foo@bar.io", password: "password" } });
    expect(Session.replaceToken).toHaveBeenCalledWith("new data");
  });

  it("submits login: not verified", async () => {
    mockAxiosResponse = Promise.reject({ response: { status: 403 } });
    const el = mount<FrontPage>(<FrontPage />);
    el.setState({ email: "foo@bar.io", loginPassword: "password" });
    await el.instance().submitLogin(fakeEvent as FormEvent);
    expect(API.setBaseUrl).toHaveBeenCalled();
    expect(axios.post).toHaveBeenCalledWith(
      "://localhost:3000/api/tokens/",
      { user: { email: "foo@bar.io", password: "password" } });
    expect(Session.replaceToken).not.toHaveBeenCalled();
    // expect(error).toHaveBeenCalledWith("Account Not Verified");
    // expect(instance.state.activePanel).toEqual("resendVerificationEmail");
  });

  it("submits login: TOS update", async () => {
    mockAxiosResponse = Promise.reject({ response: { status: 451 } });
    window.location.assign = jest.fn();
    const el = mount<FrontPage>(<FrontPage />);
    el.setState({ email: "foo@bar.io", loginPassword: "password" });
    await el.instance().submitLogin(fakeEvent as FormEvent);
    expect(API.setBaseUrl).toHaveBeenCalled();
    expect(axios.post).toHaveBeenCalledWith(
      "://localhost:3000/api/tokens/",
      { user: { email: "foo@bar.io", password: "password" } });
    await expect(Session.replaceToken).not.toHaveBeenCalled();
    expect(window.location.assign).toHaveBeenCalledWith("/tos_update");
  });

  it("submits registration: success", async () => {
    mockAxiosResponse = Promise.resolve({ data: "new data" });
    const el = mount<FrontPage>(<FrontPage />);
    el.setState({
      regEmail: "foo@bar.io",
      regName: "Foo Bar",
      regPassword: "password",
      regConfirmation: "password",
      agreeToTerms: true
    });
    await el.instance().submitRegistration(fakeEvent as FormEvent);
    expect(axios.post).toHaveBeenCalledWith("usersPath", {
      user: {
        agree_to_terms: true, email: "foo@bar.io", name: "Foo Bar",
        password: "password", password_confirmation: "password"
      }
    });
    expect(success).toHaveBeenCalledWith(
      expect.stringContaining("Almost done!"), "Success");
    expect(el.instance().state.registrationSent).toEqual(true);
  });

  it("submits registration: failure", async () => {
    mockAxiosResponse = Promise.reject({ response: { data: ["failure"] } });
    const el = mount<FrontPage>(<FrontPage />);
    el.setState({
      regEmail: "foo@bar.io",
      regName: "Foo Bar",
      regPassword: "password",
      regConfirmation: "password",
      agreeToTerms: true
    });
    await el.instance().submitRegistration(fakeEvent as FormEvent);
    await expect(axios.post).toHaveBeenCalledWith("usersPath", {
      user: {
        agree_to_terms: true, email: "foo@bar.io", name: "Foo Bar",
        password: "password", password_confirmation: "password"
      }
    });
    await expect(error).toHaveBeenCalledWith(
      expect.stringContaining("failure"));
    expect(el.instance().state.registrationSent).toEqual(false);
  });

  it("submits forgot password: success", async () => {
    mockAxiosResponse = Promise.resolve({ data: "" });
    const el = mount<FrontPage>(<FrontPage />);
    el.setState({ email: "foo@bar.io", activePanel: "forgotPassword" });
    await el.instance().submitForgotPassword(
      fakeEvent as React.FormEvent<HTMLFormElement>);
    await expect(axios.post).toHaveBeenCalledWith("resetPath",
      { email: "foo@bar.io" });
    await expect(success).toHaveBeenCalledWith(
      "Email has been sent.", "Forgot Password");
    expect(el.instance().state.activePanel).toEqual("login");
  });

  it("submits forgot password: error", async () => {
    mockAxiosResponse = Promise.reject({ response: { data: ["failure"] } });
    const el = mount<FrontPage>(<FrontPage />);
    el.setState({ email: "foo@bar.io", activePanel: "forgotPassword" });
    await el.instance().submitForgotPassword(
      fakeEvent as React.FormEvent<HTMLFormElement>);
    await expect(axios.post).toHaveBeenCalledWith("resetPath",
      { email: "foo@bar.io" });
    await expect(error).toHaveBeenCalledWith(
      expect.stringContaining("failure"));
    expect(el.instance().state.activePanel).toEqual("forgotPassword");
  });

  it("submits forgot password: no email error", async () => {
    mockAxiosResponse = Promise.reject({ response: { data: ["not found"] } });
    const el = mount<FrontPage>(<FrontPage />);
    el.setState({ email: "foo@bar.io", activePanel: "forgotPassword" });
    await el.instance().submitForgotPassword(
      fakeEvent as React.FormEvent<HTMLFormElement>);
    await expect(axios.post).toHaveBeenCalledWith("resetPath",
      { email: "foo@bar.io" });
    await expect(error).toHaveBeenCalledWith(expect.stringContaining(
      "not associated with an account"));
    expect(el.instance().state.activePanel).toEqual("forgotPassword");
  });

  it("renders proper panels", () => {
    const el = mount(<FrontPage />);
    el.setState({ activePanel: "resendVerificationEmail" });
    expect(el.text()).toContain("Account Not Verified");
    el.setState({ activePanel: "forgotPassword" });
    expect(el.text()).toContain("Reset Password");
    el.setState({ activePanel: "login" });
    expect(el.text()).toContain("Login");
  });

  it("has a generalized form field setter fn", () => {
    const spy = jest.fn();
    type Input = Partial<PartialFormEvent["currentTarget"]>;
    const fakeEv = (input: Input): PartialFormEvent => {
      return {
        currentTarget: {
          checked: true,
          defaultValue: "defaultValue",
          value: "value",
          ...input
        }
      };
    };

    const agreeToTerms = setField("agreeToTerms", spy);
    const event2 = fakeEv({ checked: false });
    const expected2 = { agreeToTerms: event2.currentTarget.checked };
    agreeToTerms(event2);
    expect(spy).toHaveBeenCalledWith(expected2);
    jest.resetAllMocks();

    const regName = setField("regName", spy);
    const event3 = fakeEv({ value: "hello!" });
    const expected3 = { regName: event3.currentTarget.value };
    regName(event3);
    expect(spy).toHaveBeenCalledWith(expected3);
    jest.resetAllMocks();

  });

  it("resendVerificationPanel(): ok()", () => {
    const wrapper = mount<FrontPage>(<FrontPage />);
    const component = shallow(<div>
      {wrapper.instance().resendVerificationPanel()}
    </div>);
    wrapper.instance().setState({ activePanel: "resendVerificationEmail" });
    expect(wrapper.instance().state.activePanel)
      .toEqual("resendVerificationEmail");
    // tslint:disable-next-line:no-any
    (component.find("ResendVerification").props() as any).ok();
    expect(success).toHaveBeenCalledWith(Content.VERIFICATION_EMAIL_RESENT);
    expect(wrapper.instance().state.activePanel).toEqual("login");
  });

  it("resendVerificationPanel(): no()", () => {
    const wrapper = mount<FrontPage>(<FrontPage />);
    const component = shallow(<div>
      {wrapper.instance().resendVerificationPanel()}
    </div>);
    wrapper.instance().setState({ activePanel: "resendVerificationEmail" });
    expect(wrapper.instance().state.activePanel)
      .toEqual("resendVerificationEmail");
    // tslint:disable-next-line:no-any
    (component.find("ResendVerification").props() as any).no();
    expect(error).toHaveBeenCalledWith(Content.VERIFICATION_EMAIL_RESEND_ERROR);
    expect(wrapper.instance().state.activePanel).toEqual("login");
  });
});
