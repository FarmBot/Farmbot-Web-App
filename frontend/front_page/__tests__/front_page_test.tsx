import React from "react";
import { mount, shallow } from "enzyme";
import {
  FrontPage, setField, PartialFormEvent, DEFAULT_APP_PAGE,
} from "../front_page";
import axios from "axios";
import { API } from "../../api";
import { Session } from "../../session";
import { success, error } from "../../toast/toast";
import { Content } from "../../constants";
import { AuthState } from "../../auth/interfaces";
import { auth } from "../../__test_support__/fake_state/token";
import { formEvent } from "../../__test_support__/fake_html_events";
import { changeBlurableInput } from "../../__test_support__/helpers";
import { CreateAccount } from "../create_account";
import { ForgotPassword } from "../forgot_password";
import { store } from "../../redux/store";
import { fakeState } from "../../__test_support__/fake_state";

let mockAxiosResponse = Promise.resolve({ data: "" });
let mockAuth: AuthState | undefined = undefined;
let postSpy: jest.SpyInstance;
let fetchStoredTokenSpy: jest.SpyInstance;
let replaceTokenSpy: jest.SpyInstance;
let fetchBrowserLocationSpy: jest.SpyInstance;
let getStateSpy: jest.SpyInstance;
let originalTosUrl: string;
let originalPrivUrl: string;

describe("<FrontPage />", () => {
  const flushPromises = async () => {
    await Promise.resolve();
    await Promise.resolve();
  };

  beforeEach(() => {
    mockAuth = undefined;
    mockAxiosResponse = Promise.resolve({ data: "" });
    originalTosUrl = globalConfig.TOS_URL;
    originalPrivUrl = globalConfig.PRIV_URL;
    const mockState = fakeState();
    getStateSpy = jest.spyOn(store, "getState")
      .mockReturnValue(mockState as never);
    postSpy = jest.spyOn(axios, "post")
      .mockImplementation(() => mockAxiosResponse as never);
    fetchStoredTokenSpy = jest.spyOn(Session, "fetchStoredToken")
      .mockImplementation(() => mockAuth);
    replaceTokenSpy = jest.spyOn(Session, "replaceToken")
      .mockImplementation(jest.fn());
    fetchBrowserLocationSpy = jest.spyOn(API, "fetchBrowserLocation")
      .mockImplementation(() => "//localhost:3000");
    API.setBaseUrl("//localhost:3000");
  });

  afterEach(() => {
    getStateSpy.mockRestore();
    postSpy.mockRestore();
    fetchStoredTokenSpy.mockRestore();
    replaceTokenSpy.mockRestore();
    fetchBrowserLocationSpy.mockRestore();
    globalConfig.TOS_URL = originalTosUrl;
    globalConfig.PRIV_URL = originalPrivUrl;
    jest.useRealTimers();
  });

  const fakeFormEvent = formEvent();

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
    ["https://farm.bot/privacy/", "https://farm.bot/tos/"]
      .map(string => expect(el.html()).toContain(string));
  });

  it("doesn't show TOS and Privacy links", () => {
    globalConfig.TOS_URL = "";
    const wrapper = mount(<FrontPage />);
    ["Privacy Policy", "Terms of Use"].map(string =>
      expect(wrapper.text().toLowerCase()).not.toContain(string.toLowerCase()));
  });

  it("redirects when already logged in", () => {
    mockAuth = auth;
    const el = mount(<FrontPage />);
    el.mount();
    expect(location.assign).toHaveBeenCalledWith(DEFAULT_APP_PAGE);
  });

  it("updates state", () => {
    const wrapper = mount<FrontPage>(<FrontPage />);
    wrapper.setState({ activePanel: "forgotPassword" });
    changeBlurableInput(wrapper, "email", 0);
    expect(wrapper.state().email).toEqual("email");
  });

  it("inputs username", () => {
    const wrapper = shallow<FrontPage>(<FrontPage />);
    expect(wrapper.state().regName).toEqual("");
    wrapper.find(CreateAccount).props().set("regName", "name");
    expect(wrapper.state().regName).toEqual("name");
  });

  it("goes back to login panel", () => {
    const wrapper = mount<FrontPage>(<FrontPage />);
    wrapper.setState({ activePanel: "forgotPassword" });
    wrapper.find(ForgotPassword).props().onGoBack();
    expect(wrapper.state().activePanel).toEqual("login");
  });

  it("updates", async () => {
    mockAxiosResponse = Promise.reject({ response: { status: 403 } });
    const wrapper = mount<FrontPage>(<FrontPage />);
    wrapper.setState({ email: "foo@bar.io", loginPassword: "password" });
    wrapper.instance().update = jest.fn();
    wrapper.instance().submitLogin(fakeFormEvent);
    await flushPromises();
    expect(Session.replaceToken).not.toHaveBeenCalled();
    expect(wrapper.instance().update).toHaveBeenCalled();
  });

  it("submits login: success", async () => {
    mockAxiosResponse = Promise.resolve({ data: "new data" });
    const el = mount<FrontPage>(<FrontPage />);
    el.setState({ email: "foo@bar.io", loginPassword: "password" });
    el.instance().submitLogin(fakeFormEvent);
    await flushPromises();
    expect(fetchBrowserLocationSpy).toHaveBeenCalled();
    expect(axios.post).toHaveBeenCalledWith(
      "http://localhost:3000/api/tokens/",
      { user: { email: "foo@bar.io", password: "password" } });
    expect(Session.replaceToken).toHaveBeenCalledWith("new data");
    expect(location.assign).toHaveBeenCalledWith(DEFAULT_APP_PAGE);
  });

  it("submits login: not verified", async () => {
    jest.useFakeTimers();
    mockAxiosResponse = Promise.reject({ response: { status: 403 } });
    const el = mount<FrontPage>(<FrontPage />);
    el.setState({ email: "foo@bar.io", loginPassword: "password" });
    el.instance().submitLogin(fakeFormEvent);
    await flushPromises();
    expect(fetchBrowserLocationSpy).toHaveBeenCalled();
    expect(axios.post).toHaveBeenCalledWith(
      "http://localhost:3000/api/tokens/",
      { user: { email: "foo@bar.io", password: "password" } });
    expect(Session.replaceToken).not.toHaveBeenCalled();
    expect(error).toHaveBeenCalledWith("Account Not Verified");
    expect(el.instance().state.activePanel).toEqual("resendVerificationEmail");
    jest.runAllTimers();
  });

  it("submits login: TOS update", async () => {
    mockAxiosResponse = Promise.reject({ response: { status: 451 } });
    const el = mount<FrontPage>(<FrontPage />);
    el.setState({ email: "foo@bar.io", loginPassword: "password" });
    el.instance().submitLogin(fakeFormEvent);
    await flushPromises();
    expect(fetchBrowserLocationSpy).toHaveBeenCalled();
    expect(axios.post).toHaveBeenCalledWith(
      "http://localhost:3000/api/tokens/",
      { user: { email: "foo@bar.io", password: "password" } });
    expect(Session.replaceToken).not.toHaveBeenCalled();
    expect(window.location.assign).toHaveBeenCalledWith("/tos_update");
  });

  it("submits login: other error", async () => {
    mockAxiosResponse = Promise.reject({
      response: { status: 400, data: "error" }
    });
    const wrapper = mount<FrontPage>(<FrontPage />);
    wrapper.setState({ email: "foo@bar.io", loginPassword: "password" });
    wrapper.instance().submitLogin(fakeFormEvent);
    await flushPromises();
    expect(fetchBrowserLocationSpy).toHaveBeenCalled();
    expect(axios.post).toHaveBeenCalledWith(
      "http://localhost:3000/api/tokens/",
      { user: { email: "foo@bar.io", password: "password" } });
    expect(Session.replaceToken).not.toHaveBeenCalled();
    expect(error).toHaveBeenCalledWith("Error: error");
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
    el.instance().submitRegistration(fakeFormEvent);
    await flushPromises();
    expect(axios.post).toHaveBeenCalledWith(
      "http://localhost:3000/api/users/", {
        user: {
          agree_to_terms: true, email: "foo@bar.io", name: "Foo Bar",
          password: "password", password_confirmation: "password"
        },
      });
    expect(success).toHaveBeenCalledWith(
      expect.stringContaining("Almost done!"));
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
    el.instance().submitRegistration(fakeFormEvent);
    await flushPromises();
    expect(axios.post).toHaveBeenCalledWith(
      "http://localhost:3000/api/users/", {
        user: {
          agree_to_terms: true, email: "foo@bar.io", name: "Foo Bar",
          password: "password", password_confirmation: "password"
        },
      });
    expect(error).toHaveBeenCalledWith(
      expect.stringContaining("failure"));
    expect(el.instance().state.registrationSent).toEqual(false);
  });

  it("submits forgot password: success", async () => {
    mockAxiosResponse = Promise.resolve({ data: "" });
    const el = mount<FrontPage>(<FrontPage />);
    el.setState({ email: "foo@bar.io", activePanel: "forgotPassword" });
    el.instance().submitForgotPassword(fakeFormEvent);
    await flushPromises();
    expect(axios.post).toHaveBeenCalledWith(
      "http://localhost:3000/api/password_resets/",
      { email: "foo@bar.io" });
    expect(success).toHaveBeenCalledWith(
      "Email has been sent.", { title: "Forgot Password" });
    expect(el.instance().state.activePanel).toEqual("login");
  });

  it("submits forgot password: error", async () => {
    mockAxiosResponse = Promise.reject({ response: { data: ["failure"] } });
    const el = mount<FrontPage>(<FrontPage />);
    el.setState({ email: "foo@bar.io", activePanel: "forgotPassword" });
    el.instance().submitForgotPassword(fakeFormEvent);
    await flushPromises();
    expect(axios.post).toHaveBeenCalledWith(
      "http://localhost:3000/api/password_resets/",
      { email: "foo@bar.io" });
    expect(error).toHaveBeenCalledWith(
      expect.stringContaining("failure"));
    expect(el.instance().state.activePanel).toEqual("forgotPassword");
  });

  it("submits forgot password: no email error", async () => {
    mockAxiosResponse = Promise.reject({ response: { data: ["not found"] } });
    const el = mount<FrontPage>(<FrontPage />);
    el.setState({ email: "foo@bar.io", activePanel: "forgotPassword" });
    el.instance().submitForgotPassword(fakeFormEvent);
    await flushPromises();
    expect(axios.post).toHaveBeenCalledWith(
      "http://localhost:3000/api/password_resets/",
      { email: "foo@bar.io" });
    expect(error).toHaveBeenCalledWith(expect.stringContaining(
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
    jest.clearAllMocks();

    const regName = setField("regName", spy);
    const event3 = fakeEv({ value: "hello!" });
    const expected3 = { regName: event3.currentTarget.value };
    regName(event3);
    expect(spy).toHaveBeenCalledWith(expected3);
    jest.clearAllMocks();
  });

  it("resendVerificationPanel(): ok()", () => {
    const wrapper = mount<FrontPage>(<FrontPage />);
    const component = shallow(<div>
      {wrapper.instance().resendVerificationPanel()}
    </div>);
    wrapper.instance().setState({ activePanel: "resendVerificationEmail" });
    expect(wrapper.instance().state.activePanel)
      .toEqual("resendVerificationEmail");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (component.find("ResendVerification").props() as any).no();
    expect(error).toHaveBeenCalledWith(Content.VERIFICATION_EMAIL_RESEND_ERROR);
    expect(wrapper.instance().state.activePanel).toEqual("login");
  });
});
