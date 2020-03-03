jest.mock("../../i18n", () => ({ detectLanguage: () => Promise.resolve({}) }));

const mockToken = { token: { unencoded: {}, encoded: "========" } };
let mockPostResponse = Promise.resolve({ data: mockToken });
jest.mock("axios", () => ({
  post: jest.fn(() => mockPostResponse),
}));

jest.mock("../../session", () => ({ Session: { replaceToken: jest.fn() } }));

import * as React from "react";
import { TosUpdate } from "../component";
import { shallow, mount } from "enzyme";
import axios from "axios";
import { API } from "../../api/index";
import { Session } from "../../session";
import { error } from "../../toast/toast";
import { formEvent, inputEvent } from "../../__test_support__/fake_html_events";
import { TermsCheckbox } from "../../front_page/terms_checkbox";

describe("<TosUpdate/>", () => {
  it("renders correctly when envs are set", () => {
    const oldTos = globalConfig.TOS_URL;
    const oldPriv = globalConfig.PRIV_URL;
    globalConfig.TOS_URL = "";
    globalConfig.PRIV_URL = "";
    const el = mount(<TosUpdate />);
    expect(el.text().toLocaleLowerCase()).toContain("something went wrong");
    globalConfig.TOS_URL = oldTos;
    globalConfig.PRIV_URL = oldPriv;
  });

  it("has a setter", () => {
    const tosUpdate = shallow<TosUpdate>(<TosUpdate />).instance();
    tosUpdate.setState = jest.fn();
    tosUpdate.set("email")(inputEvent("foo@bar.com"));
    expect(tosUpdate.setState).toHaveBeenCalledWith({ email: "foo@bar.com" });
  });

  const fake = {
    email: "foo@bar.com",
    password: "password123",
    agree_to_terms: true
  };

  const fakeFormEvent = formEvent();

  it("submits a form", async () => {
    location.assign = jest.fn();
    const i = shallow<TosUpdate>(<TosUpdate />).instance();
    i.setState(fake);
    await i.submit(fakeFormEvent);
    expect(fakeFormEvent.preventDefault).toHaveBeenCalled();
    expect(axios.post)
      .toHaveBeenCalledWith(API.current.tokensPath, { user: fake });
    expect(Session.replaceToken).toHaveBeenCalledWith(mockToken);
    expect(location.assign).toHaveBeenCalledWith("/app/controls");
  });

  it("errors while submitting", async () => {
    mockPostResponse = Promise.reject({ response: { data: ["error"] } });
    const i = shallow<TosUpdate>(<TosUpdate />).instance();
    i.setState(fake);
    await i.submit(fakeFormEvent);
    expect(fakeFormEvent.preventDefault).toHaveBeenCalled();
    await expect(axios.post)
      .toHaveBeenCalledWith(API.current.tokensPath, { user: fake });
    await expect(error).toHaveBeenCalledWith(expect.stringContaining("error"));
  });

  it("shows TOS and Privacy links", () => {
    const el = mount(<TosUpdate />);
    ["Privacy Policy", "Terms of Use"].map(string =>
      expect(el.text()).toContain(string));
    ["https://farm.bot/privacy/", "https://farm.bot/tos/"]
      .map(string => expect(el.html()).toContain(string));
  });

  it("accepts terms", () => {
    const wrapper = mount<TosUpdate>(<TosUpdate />);
    const tosForm = shallow(wrapper.instance().tosForm());
    expect(wrapper.state().agree_to_terms).toBeFalsy();
    tosForm.find(TermsCheckbox).simulate("change", {
      currentTarget: { checked: true }
    });
    expect(wrapper.state().agree_to_terms).toBeTruthy();
  });

  it("errors on click", () => {
    const wrapper = mount<TosUpdate>(<TosUpdate />);
    expect(wrapper.state().agree_to_terms).toBeFalsy();
    const tosForm = shallow(wrapper.instance().tosForm());
    tosForm.find("button").simulate("click");
    expect(error).toHaveBeenCalledWith("Please agree to the terms.");
  });

  it("doesn't error on click", () => {
    const wrapper = mount<TosUpdate>(<TosUpdate />);
    wrapper.setState({ agree_to_terms: true });
    expect(wrapper.state().agree_to_terms).toBeTruthy();
    const tosForm = shallow(wrapper.instance().tosForm());
    tosForm.find("button").simulate("click");
    expect(error).not.toHaveBeenCalled();
  });
});
