jest.mock("../../toast/toast", () => {
  return {
    init: jest.fn(),
    error: jest.fn(),
  };
});

import * as moxios from "moxios";
import * as React from "react";
import { API } from "../../api";
import { DeepPartial } from "redux";
import { error } from "../../toast/toast";
import { inputEvent } from "../../__test_support__/fake_html_events";
import { mount } from "enzyme";
import { PasswordReset, State } from "../password_reset";

describe("<PasswordReset/>", () => {
  beforeEach(function () {
    // import and pass your custom axios instance to this method
    moxios.install();
    API.setBaseUrl("localhost");
  });

  afterEach(function () {
    // import and pass your custom axios instance to this method
    moxios.uninstall();
  });

  it("handles form submission errors", (done) => {
    type InputEvent = React.SyntheticEvent<HTMLInputElement>;
    const eventLike: DeepPartial<InputEvent> = { preventDefault: jest.fn() };
    const pr = new PasswordReset({});

    pr.submit(eventLike as InputEvent);
    expect(eventLike.preventDefault).toHaveBeenCalled();
    moxios.wait(function () {
      const request = moxios.requests.mostRecent();
      request
        .respondWith({ status: 400, response: { err: "xyz" } })
        .then(() => {
          expect(error).toHaveBeenCalledWith("Err: xyz");
          done();
        });
    });
  });

  it("resets the users password", (done) => {
    expect.assertions(5);
    const el = mount(<PasswordReset />);
    el.setState({
      password: "knocknock",
      passwordConfirmation: "knocknock",
      serverURL: "localhost",
      serverPort: "3000"
    });
    el.find("form").simulate("submit", { preventDefault: jest.fn() });
    moxios.wait(function () {
      const request = moxios.requests.mostRecent();
      request.respondWith({
        status: 200,
        response: {}
      }).then(function (resp) {
        expect(resp.config.url).toContain("api/password_resets");
        expect(resp.config.method).toEqual("put");
        const json: State = JSON.parse(resp.config.data);
        expect(Object.keys(json)).toContain("password");
        expect(Object.keys(json)).toContain("password_confirmation");
        expect(json.password).toEqual("knocknock");
        done();
      });
    });
  });

  it("Has a form set()ter", () => {
    const el = mount(<PasswordReset />);
    const i = el.instance() as PasswordReset;
    const field = "password";
    const value = "password123";
    i.setState = jest.fn(i.setState);
    i.set(field)(inputEvent(value));
    expect(i.setState).toHaveBeenCalledWith({ [field]: value });
  });
});
