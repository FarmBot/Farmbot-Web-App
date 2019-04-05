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
import { error } from "farmbot-toastr";

type E = React.FormEvent<HTMLInputElement>;

describe("<TosUpdate/>", () => {
  const instance = () => shallow<TosUpdate>(<TosUpdate />).instance();
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
    const wow = instance();
    wow.setState = jest.fn();
    const fn = wow.set("email");
    fn({ currentTarget: { value: "foo@bar.com" } } as E);
    expect(wow.setState).toHaveBeenCalledWith({ email: "foo@bar.com" });
  });

  type FormEvent = React.FormEvent<HTMLFormElement>;
  const fakeEvent: Partial<FormEvent> = { preventDefault: jest.fn() };
  const fake = {
    email: "foo@bar.com",
    password: "password123",
    agree_to_terms: true
  };

  it("submits a form", async () => {
    location.assign = jest.fn();
    const i = instance();
    i.setState(fake);
    await i.submit(fakeEvent as FormEvent);
    expect(fakeEvent.preventDefault).toHaveBeenCalled();
    expect(axios.post)
      .toHaveBeenCalledWith(API.current.tokensPath, { user: fake });
    expect(Session.replaceToken).toHaveBeenCalledWith(mockToken);
    expect(location.assign).toHaveBeenCalledWith("/app/controls");
  });

  it("errors while submitting", async () => {
    mockPostResponse = Promise.reject({ response: { data: ["error"] } });
    const i = instance();
    i.setState(fake);
    await i.submit(fakeEvent as FormEvent);
    expect(fakeEvent.preventDefault).toHaveBeenCalled();
    await expect(axios.post)
      .toHaveBeenCalledWith(API.current.tokensPath, { user: fake });
    await expect(error).toHaveBeenCalledWith(expect.stringContaining("error"));
  });

  it("shows TOS and Privacy links", () => {
    const el = mount(<TosUpdate />);
    ["Privacy Policy", "Terms of Use"].map(string =>
      expect(el.text()).toContain(string));
    ["https://farmbot.io/privacy/", "https://farmbot.io/tos/"]
      .map(string => expect(el.html()).toContain(string));
  });
});
