jest.mock("../../i18n", () => {
  return {
    detectLanguage: () => Promise.resolve({})
  };
});

jest.mock("axios", () => {
  return {
    post: jest.fn(() => {
      return Promise.resolve({
        data: { token: { unencoded: {}, encoded: "========" } }
      });
    })
  };
});

import * as React from "react";
import { TosUpdate } from "../component";
import { shallow, mount } from "enzyme";
import axios from "axios";
import { API } from "../../api/index";

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

  it("submits a form", () => {
    type FormEvent = React.FormEvent<HTMLFormElement>;
    const fakeEvent: Partial<FormEvent> = { preventDefault: jest.fn() };
    const i = instance();
    i.setState({
      email: "foo@bar.com",
      password: "password123",
      agree_to_terms: true
    });
    i.forceUpdate();
    i.submit(fakeEvent as FormEvent);
    expect(fakeEvent.preventDefault).toHaveBeenCalled();
    const expectation = {
      user: {
        agree_to_terms: true,
        email: "foo@bar.com",
        password: "password123"
      }
    };
    expect(axios.post)
      .toHaveBeenCalledWith(API.current.tokensPath, expectation);
  });

  it("shows TOS and Privacy links", () => {
    const el = mount(<TosUpdate />);
    ["Privacy Policy", "Terms of Use"].map(string =>
      expect(el.text()).toContain(string));
    ["https://farmbot.io/privacy/", "https://farmbot.io/tos/"]
      .map(string => expect(el.html()).toContain(string));
  });
});
