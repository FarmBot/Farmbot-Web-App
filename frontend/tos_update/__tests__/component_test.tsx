const mockToken = { token: { unencoded: {}, encoded: "========" } };
let mockPostResponse = Promise.resolve({ data: mockToken });

import React from "react";
import TestRenderer from "react-test-renderer";
import { cleanup, render } from "@testing-library/react";
import { TosUpdate } from "../component";
import axios from "axios";
import { API } from "../../api/index";
import { Session } from "../../session";
import { error } from "../../toast/toast";
import { formEvent, inputEvent } from "../../__test_support__/fake_html_events";
import { TermsCheckbox } from "../../front_page/terms_checkbox";
import * as i18n from "../../i18n";

const wrappers: TestRenderer.ReactTestRenderer[] = [];
const createWrapper = () => {
  const wrapper = TestRenderer.create(<TosUpdate />);
  wrappers.push(wrapper);
  return wrapper;
};

beforeEach(() => {
  jest.clearAllMocks();
  jest.useFakeTimers();
  globalConfig.TOS_URL = globalConfig.TOS_URL || "https://farm.bot/tos/";
  globalConfig.PRIV_URL = globalConfig.PRIV_URL || "https://farm.bot/privacy/";
  jest.spyOn(i18n, "detectLanguage")
    .mockImplementation(() => Promise.resolve({}));
  jest.spyOn(axios, "post")
    .mockImplementation(() => mockPostResponse as never);
  jest.spyOn(Session, "replaceToken")
    .mockImplementation(() => { });
});

afterEach(() => {
  jest.runOnlyPendingTimers();
  cleanup();
  while (wrappers.length > 0) {
    const wrapper = wrappers.pop();
    wrapper && TestRenderer.act(() => wrapper.unmount());
  }
  jest.useRealTimers();
  mockPostResponse = Promise.resolve({ data: mockToken });
});

describe("<TosUpdate />", () => {
  it("renders correctly when envs are set", () => {
    const oldTos = globalConfig.TOS_URL;
    const oldPriv = globalConfig.PRIV_URL;
    globalConfig.TOS_URL = "";
    globalConfig.PRIV_URL = "";
    const { container } = render(<TosUpdate />);
    expect(container.textContent?.toLocaleLowerCase())
      .toContain("something went wrong");
    globalConfig.TOS_URL = oldTos;
    globalConfig.PRIV_URL = oldPriv;
  });

  it("has a setter", () => {
    const tosUpdate = createWrapper().getInstance() as TosUpdate;
    tosUpdate.setState = jest.fn();
    tosUpdate.set("email")(inputEvent("foo@bar.com"));
    expect(tosUpdate.setState).toHaveBeenCalledWith({ email: "foo@bar.com" });
  });

  const fake = {
    email: "foo@bar.com",
    password: "password123",
    agree_to_terms: true,
  };

  const fakeFormEvent = formEvent();

  it("submits a form", async () => {
    const instance = createWrapper().getInstance() as TosUpdate;
    instance.setState(fake);
    instance.submit(fakeFormEvent);
    await mockPostResponse;
    expect(fakeFormEvent.preventDefault).toHaveBeenCalled();
    expect(axios.post).toHaveBeenCalled();
  });

  it("errors while submitting", async () => {
    mockPostResponse = Promise.reject({ response: { data: ["error"] } });
    const instance = createWrapper().getInstance() as TosUpdate;
    instance.setState(fake);
    instance.submit(fakeFormEvent);
    await mockPostResponse.catch(() => undefined);
    jest.runAllTimers();
    expect(fakeFormEvent.preventDefault).toHaveBeenCalled();
    expect(axios.post)
      .toHaveBeenCalledWith(API.current.tokensPath, { user: fake });
    expect(error).toHaveBeenCalledWith(expect.stringContaining("error"));
  });

  it("shows TOS and Privacy links", () => {
    const { container } = render(<TosUpdate />);
    ["Privacy Policy", "Terms of Use"].map(string =>
      expect(container.textContent).toContain(string));
    ["https://farm.bot/privacy/", "https://farm.bot/tos/"].map(string =>
      expect(container.innerHTML).toContain(string));
  });

  it("accepts terms", () => {
    const wrapper = createWrapper();
    const instance = wrapper.getInstance() as TosUpdate;
    const tosForm = TestRenderer.create(instance.tosForm());
    wrappers.push(tosForm);
    expect(instance.state.agree_to_terms).toBeFalsy();
    tosForm.root.findByType(TermsCheckbox).props.onChange({
      currentTarget: { checked: true },
    });
    expect(instance.state.agree_to_terms).toBeTruthy();
  });

  it("errors on click", () => {
    const wrapper = createWrapper();
    const instance = wrapper.getInstance() as TosUpdate;
    expect(instance.state.agree_to_terms).toBeFalsy();
    const tosForm = TestRenderer.create(instance.tosForm());
    wrappers.push(tosForm);
    tosForm.root.findByType("button").props.onClick();
    expect(error).toHaveBeenCalledWith("Please agree to the terms.");
  });

  it("updates", () => {
    const wrapper = createWrapper();
    const instance = wrapper.getInstance() as TosUpdate;
    instance.update = jest.fn();
    const tosForm = TestRenderer.create(instance.tosForm());
    wrappers.push(tosForm);
    tosForm.root.findByType("button").props.onClick();
    expect(instance.update).toHaveBeenCalled();
  });

  it("doesn't error on click", () => {
    const wrapper = createWrapper();
    const instance = wrapper.getInstance() as TosUpdate;
    instance.setState({ agree_to_terms: true });
    expect(instance.state.agree_to_terms).toBeTruthy();
    const tosForm = TestRenderer.create(instance.tosForm());
    wrappers.push(tosForm);
    tosForm.root.findByType("button").props.onClick();
    expect(error).not.toHaveBeenCalled();
  });
});
