import React from "react";
import moxios from "moxios";
import { mount } from "enzyme";
import { API } from "../../api";
import { error } from "../../toast/toast";
import { formEvent, inputEvent } from "../../__test_support__/fake_html_events";
import { PasswordReset, State } from "../password_reset";
import { AxiosResponse } from "axios";

describe("<PasswordReset/>", () => {
  API.setBaseUrl("localhost");

  beforeEach(() => moxios.install());
  afterEach(() => moxios.uninstall());

  const respondWith =
    (response: { status: number, response: {} }) =>
      new Promise<Partial<AxiosResponse>>(
        (resolve: (value: Partial<AxiosResponse>) => void, reject) =>
          moxios.wait(() => moxios.requests.mostRecent()
            .respondWith(response)
            .then(resolve, reject)));

  it("handles form submission errors", async () => {
    const pr = new PasswordReset({});
    const e = formEvent();
    pr.submit(e);
    expect(e.preventDefault).toHaveBeenCalled();
    await respondWith({ status: 400, response: { err: "xyz" } });
    expect(error).toHaveBeenCalledWith("Err: xyz");
  });

  it("resets the users password", async () => {
    expect.assertions(5);
    const el = mount(<PasswordReset />);
    el.setState({
      password: "knocknock",
      passwordConfirmation: "knocknock",
      serverURL: "localhost",
      serverPort: "3000"
    });
    el.find("form").simulate("submit", formEvent());
    const resp = await respondWith({ status: 200, response: {} });
    expect(resp.config?.url).toContain("api/password_resets");
    expect(resp.config?.method).toEqual("put");
    const json: State = JSON.parse(resp.config?.data);
    expect(Object.keys(json)).toContain("password");
    expect(Object.keys(json)).toContain("password_confirmation");
    expect(json.password).toEqual("knocknock");
  });

  it("has a form set()ter", () => {
    const el = mount(<PasswordReset />);
    const i = el.instance() as PasswordReset;
    const field = "password";
    const value = "password123";
    i.setState = jest.fn(i.setState);
    i.set(field)(inputEvent(value));
    expect(i.setState).toHaveBeenCalledWith({ [field]: value });
  });
});
