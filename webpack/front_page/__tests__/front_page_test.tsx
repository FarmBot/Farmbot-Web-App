let mockAxiosResponse = Promise.resolve({ data: "" });
jest.mock("axios", () => ({
  default: {
    post: jest.fn(() => mockAxiosResponse)
  }
}));

jest.mock("../../session", () => ({
  Session: {
    replaceToken: jest.fn(),
    fetchStoredToken: jest.fn(),
  }
}));

jest.mock("farmbot-toastr", () => ({ error: jest.fn(), init: jest.fn() }));

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
import { mount } from "enzyme";
import { FrontPage, setField, PartialFromEvent } from "../front_page";
import axios from "axios";
import { API } from "../../api";
import { Session } from "../../session";

describe("<FrontPage />", () => {
  beforeEach(function () {
    jest.clearAllMocks();
  });

  it("shows forgot password box", () => {
    const el =mount<>(<FrontPage />);
    expect(el.text()).not.toContain("Reset Password");
    el.find("a.forgot-password").first().simulate("click");
    expect(el.text()).toContain("Reset Password");
  });

  it("shows TOS and Privacy links", () => {
    const el =mount<>(<FrontPage />);
    ["Privacy Policy", "Terms of Use"].map(string =>
      expect(el.text()).toContain(string));
    ["https://farmbot.io/privacy/", "https://farmbot.io/tos/"]
      .map(string => expect(el.html()).toContain(string));
  });

  it("submits login: success", async () => {
    mockAxiosResponse = Promise.resolve({ data: "new data" });
    const el =mount<>(<FrontPage />);
    el.setState({ email: "foo@bar.io", loginPassword: "password" });
    // tslint:disable-next-line:no-any
    const instance = el.instance() as any;
    await instance.submitLogin({ preventDefault: jest.fn() });
    expect(API.setBaseUrl).toHaveBeenCalled();
    expect(axios.post).toHaveBeenCalledWith(
      "://localhost:3000/api/tokens/",
      { user: { email: "foo@bar.io", password: "password" } });
    expect(Session.replaceToken).toHaveBeenCalledWith("new data");
  });

  it("submits login: not verified", async () => {
    mockAxiosResponse = Promise.reject({ response: { status: 403 } });
    const el =mount<>(<FrontPage />);
    el.setState({ email: "foo@bar.io", loginPassword: "password" });
    // tslint:disable-next-line:no-any
    const instance = el.instance() as any;
    await instance.submitLogin({ preventDefault: jest.fn() });
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
    const el =mount<>(<FrontPage />);
    el.setState({ email: "foo@bar.io", loginPassword: "password" });
    // tslint:disable-next-line:no-any
    const instance = el.instance() as any;
    await instance.submitLogin({ preventDefault: jest.fn() });
    expect(API.setBaseUrl).toHaveBeenCalled();
    expect(axios.post).toHaveBeenCalledWith(
      "://localhost:3000/api/tokens/",
      { user: { email: "foo@bar.io", password: "password" } });
    await expect(Session.replaceToken).not.toHaveBeenCalled();
    expect(window.location.assign).toHaveBeenCalledWith("/tos_update");
  });

  it("submits registration", () => {
    const el =mount<>(<FrontPage />);
    el.setState({
      regEmail: "foo@bar.io",
      regName: "Foo Bar",
      regPassword: "password",
      regConfirmation: true,
      agreeToTerms: true
    });
    // tslint:disable-next-line:no-any
    const instance = el.instance() as any;
    instance.submitRegistration({ preventDefault: jest.fn() });
    expect(axios.post).toHaveBeenCalledWith("usersPath", {
      user: {
        agree_to_terms: true, email: "foo@bar.io", name: "Foo Bar",
        password: "password", password_confirmation: true
      }
    });
  });

  it("submits forgot password", () => {
    const el =mount<>(<FrontPage />);
    el.setState({ email: "foo@bar.io" });
    // tslint:disable-next-line:no-any
    const instance = el.instance() as any;
    instance.submitForgotPassword({ preventDefault: jest.fn() });
    expect(axios.post).toHaveBeenCalledWith("resetPath",
      { email: "foo@bar.io" });
  });

  it("renders proper panels", () => {
    const el =mount<>(<FrontPage />);
    el.setState({ activePanel: "resendVerificationEmail" });
    expect(el.text()).toContain("Account Not Verified");
    el.setState({ activePanel: "forgotPassword" });
    expect(el.text()).toContain("Reset Password");
    el.setState({ activePanel: "login" });
    expect(el.text()).toContain("Login");
  });

  it("has a generalized form field setter fn", () => {
    const spy = jest.fn();
    type Input = Partial<PartialFromEvent["currentTarget"]>;
    const fakeEv = (input: Input): PartialFromEvent => {
      return {
        currentTarget: {
          checked: true,
          defaultValue: "defaultValue",
          value: "value",
          ...input
        }
      }
    }

    const agreeToTerms = setField("agreeToTerms", spy)
    const event2 = fakeEv({ checked: false });
    const expected2 = { agreeToTerms: event2.currentTarget.checked };
    agreeToTerms(event2);
    expect(spy).toHaveBeenCalledWith(expected2);
    jest.resetAllMocks();


    const regName = setField("regName", spy)
    const event3 = fakeEv({ value: "hello!" });
    const expected3 = { regName: event3.currentTarget.value };
    regName(event3);
    expect(spy).toHaveBeenCalledWith(expected3);
    jest.resetAllMocks();

  });
});
