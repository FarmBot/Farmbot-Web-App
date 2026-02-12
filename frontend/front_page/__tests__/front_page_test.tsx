import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
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
import {
  changeBlurableInput, changeBlurableInputRTL,
} from "../../__test_support__/helpers";
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

const setStateSync = (instance: FrontPage) => {
  instance.setState = ((state: Partial<FrontPage["state"]>) => {
    instance.state = { ...instance.state, ...state };
  }) as FrontPage["setState"];
  return instance;
};

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
    render(<FrontPage />);
    expect(screen.queryByText("Reset Password")).toBeNull();
    fireEvent.click(screen.getByText("Forgot password?"));
    expect(screen.getAllByText("Reset Password").length).toBeGreaterThan(0);
  });

  it("shows TOS and Privacy links", () => {
    render(<FrontPage />);
    expect(screen.getByText("Privacy Policy")).toBeTruthy();
    expect(screen.getByText("Terms of Use")).toBeTruthy();
    expect(screen.getByText("Privacy Policy").closest("a")?.href)
      .toContain("https://farm.bot/privacy/");
    expect(screen.getByText("Terms of Use").closest("a")?.href)
      .toContain("https://farm.bot/tos/");
  });

  it("doesn't show TOS and Privacy links", () => {
    globalConfig.TOS_URL = "";
    render(<FrontPage />);
    expect(screen.queryByText("Privacy Policy")).toBeNull();
    expect(screen.queryByText("Terms of Use")).toBeNull();
  });

  it("redirects when already logged in", () => {
    mockAuth = auth;
    render(<FrontPage />);
    expect(location.assign).toHaveBeenCalledWith(DEFAULT_APP_PAGE);
  });

  it("updates state", () => {
    const { container } = render(<FrontPage />);
    fireEvent.click(screen.getByText("Forgot password?"));
    changeBlurableInput({ container }, "email", 0);
    const input = container.querySelector(
      "input[type='email']") as HTMLInputElement | null;
    expect(input?.value).toEqual("email");
  });

  it("inputs username", () => {
    const { container } = render(<FrontPage />);
    const nameInput = container.querySelector("#Name") as HTMLInputElement;
    changeBlurableInputRTL(nameInput, "name");
    expect(nameInput.value).toEqual("name");
  });

  it("goes back to login panel", () => {
    render(<FrontPage />);
    fireEvent.click(screen.getByText("Forgot password?"));
    fireEvent.click(screen.getByText("BACK"));
    expect(screen.getByRole("button", { name: "Login" })).toBeTruthy();
  });

  it("updates", async () => {
    mockAxiosResponse = Promise.reject({ response: { status: 403 } });
    const instance = setStateSync(new FrontPage({}));
    instance.setState({ email: "foo@bar.io", loginPassword: "password" });
    instance.update = jest.fn();
    instance.submitLogin(fakeFormEvent);
    await flushPromises();
    expect(Session.replaceToken).not.toHaveBeenCalled();
    expect(instance.update).toHaveBeenCalled();
  });

  it("submits login: success", async () => {
    mockAxiosResponse = Promise.resolve({ data: "new data" });
    const instance = setStateSync(new FrontPage({}));
    instance.setState({ email: "foo@bar.io", loginPassword: "password" });
    instance.submitLogin(fakeFormEvent);
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
    const instance = setStateSync(new FrontPage({}));
    instance.setState({ email: "foo@bar.io", loginPassword: "password" });
    instance.submitLogin(fakeFormEvent);
    await flushPromises();
    expect(fetchBrowserLocationSpy).toHaveBeenCalled();
    expect(axios.post).toHaveBeenCalledWith(
      "http://localhost:3000/api/tokens/",
      { user: { email: "foo@bar.io", password: "password" } });
    expect(Session.replaceToken).not.toHaveBeenCalled();
    expect(error).toHaveBeenCalledWith("Account Not Verified");
    expect(instance.state.activePanel).toEqual("resendVerificationEmail");
    jest.runAllTimers();
  });

  it("submits login: TOS update", async () => {
    mockAxiosResponse = Promise.reject({ response: { status: 451 } });
    const instance = setStateSync(new FrontPage({}));
    instance.setState({ email: "foo@bar.io", loginPassword: "password" });
    instance.submitLogin(fakeFormEvent);
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
    const instance = setStateSync(new FrontPage({}));
    instance.setState({ email: "foo@bar.io", loginPassword: "password" });
    instance.submitLogin(fakeFormEvent);
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
    const instance = setStateSync(new FrontPage({}));
    instance.setState({
      regEmail: "foo@bar.io",
      regName: "Foo Bar",
      regPassword: "password",
      regConfirmation: "password",
      agreeToTerms: true
    });
    instance.submitRegistration(fakeFormEvent);
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
    expect(instance.state.registrationSent).toEqual(true);
  });

  it("submits registration: failure", async () => {
    mockAxiosResponse = Promise.reject({ response: { data: ["failure"] } });
    const instance = setStateSync(new FrontPage({}));
    instance.setState({
      regEmail: "foo@bar.io",
      regName: "Foo Bar",
      regPassword: "password",
      regConfirmation: "password",
      agreeToTerms: true
    });
    instance.submitRegistration(fakeFormEvent);
    await flushPromises();
    expect(axios.post).toHaveBeenCalledWith(
      "http://localhost:3000/api/users/", {
        user: {
          agree_to_terms: true, email: "foo@bar.io", name: "Foo Bar",
          password: "password", password_confirmation: "password"
        },
      });
    expect(error).toHaveBeenCalledWith(expect.stringContaining("failure"));
    expect(instance.state.registrationSent).toEqual(false);
  });

  it("submits forgot password: success", async () => {
    mockAxiosResponse = Promise.resolve({ data: "" });
    const instance = setStateSync(new FrontPage({}));
    instance.setState({ email: "foo@bar.io", activePanel: "forgotPassword" });
    instance.submitForgotPassword(fakeFormEvent);
    await flushPromises();
    expect(axios.post).toHaveBeenCalledWith(
      "http://localhost:3000/api/password_resets/",
      { email: "foo@bar.io" });
    expect(success).toHaveBeenCalledWith(
      "Email has been sent.", { title: "Forgot Password" });
    expect(instance.state.activePanel).toEqual("login");
  });

  it("submits forgot password: error", async () => {
    mockAxiosResponse = Promise.reject({ response: { data: ["failure"] } });
    const instance = setStateSync(new FrontPage({}));
    instance.setState({ email: "foo@bar.io", activePanel: "forgotPassword" });
    instance.submitForgotPassword(fakeFormEvent);
    await flushPromises();
    expect(axios.post).toHaveBeenCalledWith(
      "http://localhost:3000/api/password_resets/",
      { email: "foo@bar.io" });
    expect(error).toHaveBeenCalledWith(expect.stringContaining("failure"));
    expect(instance.state.activePanel).toEqual("forgotPassword");
  });

  it("submits forgot password: no email error", async () => {
    mockAxiosResponse = Promise.reject({ response: { data: ["not found"] } });
    const instance = setStateSync(new FrontPage({}));
    instance.setState({ email: "foo@bar.io", activePanel: "forgotPassword" });
    instance.submitForgotPassword(fakeFormEvent);
    await flushPromises();
    expect(axios.post).toHaveBeenCalledWith(
      "http://localhost:3000/api/password_resets/",
      { email: "foo@bar.io" });
    expect(error).toHaveBeenCalledWith(expect.stringContaining(
      "not associated with an account"));
    expect(instance.state.activePanel).toEqual("forgotPassword");
  });

  it("renders proper panels", () => {
    const instance = setStateSync(new FrontPage({}));
    const { container, rerender } = render(<div>{instance.activePanel()}</div>);
    instance.setState({ activePanel: "resendVerificationEmail" });
    rerender(<div>{instance.activePanel()}</div>);
    expect(container.textContent).toContain("Account Not Verified");
    instance.setState({ activePanel: "forgotPassword" });
    rerender(<div>{instance.activePanel()}</div>);
    expect(container.textContent).toContain("Reset Password");
    instance.setState({ activePanel: "login" });
    rerender(<div>{instance.activePanel()}</div>);
    expect(container.textContent).toContain("Login");
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
    const instance = setStateSync(new FrontPage({}));
    instance.setState({ activePanel: "resendVerificationEmail" });
    expect(instance.state.activePanel).toEqual("resendVerificationEmail");
    const panel = instance.resendVerificationPanel() as React.ReactElement<{
      ok: (resp: unknown) => void;
      no: (err: unknown) => void;
    }>;
    panel.props.ok({});
    expect(success).toHaveBeenCalledWith(Content.VERIFICATION_EMAIL_RESENT);
    expect(instance.state.activePanel).toEqual("login");
  });

  it("resendVerificationPanel(): no()", () => {
    const instance = setStateSync(new FrontPage({}));
    instance.setState({ activePanel: "resendVerificationEmail" });
    expect(instance.state.activePanel).toEqual("resendVerificationEmail");
    const panel = instance.resendVerificationPanel() as React.ReactElement<{
      ok: (resp: unknown) => void;
      no: (err: unknown) => void;
    }>;
    panel.props.no({});
    expect(error).toHaveBeenCalledWith(Content.VERIFICATION_EMAIL_RESEND_ERROR);
    expect(instance.state.activePanel).toEqual("login");
  });
});
