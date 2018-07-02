import * as React from "react";
import { mount } from "enzyme";
import { PasswordReset, State } from "../password_reset";
import * as moxios from "moxios";

describe("<PasswordReset/>", () => {
  beforeEach(function () {
    // import and pass your custom axios instance to this method
    moxios.install();
  });

  afterEach(function () {
    // import and pass your custom axios instance to this method
    moxios.uninstall();
  });

  it("resets the users password", (done) => {
    expect.assertions(5);
    const el = mount<{}>(<PasswordReset />);
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
    const el = mount<{}>(<PasswordReset />);
    const i = el.instance() as PasswordReset;
    const field = "password";
    const value = "password123";
    const fn = i.set(field);
    i.setState = jest.fn(i.setState);
    type E = React.FormEvent<HTMLInputElement>;
    const e = { currentTarget: { value } } as E;
    fn(e as E);
    expect(i.setState).toHaveBeenCalledWith({ [field]: value });
  });
});
