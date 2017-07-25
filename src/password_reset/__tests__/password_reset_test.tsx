import * as React from "react";
import { mount } from "enzyme";
import { PasswordReset } from "../password_reset";
import * as moxios from "moxios";
import { API } from "../../api/api";
import { State } from "../interfaces";

describe("<PasswordReset/>", () => {
  beforeEach(function () {
    // import and pass your custom axios instance to this method
    moxios.install();
  });

  afterEach(function () {
    // import and pass your custom axios instance to this method
    moxios.uninstall();
  });

  fit("resets the users password", (done) => {
    expect.assertions(5);
    let el = mount(<PasswordReset />);
    el.setState({
      password: "knocknock",
      passwordConfirmation: "knocknock",
      serverURL: "localhost",
      serverPort: "3000"
    });
    el.find("form").simulate("submit", { preventDefault: jest.fn() });
    moxios.wait(function () {
      let request = moxios.requests.mostRecent();
      request.respondWith({
        status: 200,
        response: {}
      }).then(function (resp) {
        expect(resp.config.url).toContain("api/password_resets");
        expect(resp.config.method).toEqual("put");
        let json: State = JSON.parse(resp.config.data);
        expect(Object.keys(json)).toContain("password");
        expect(Object.keys(json)).toContain("password_confirmation");
        expect(json.password).toEqual("knocknock");
        done();
      });
    });
  });
});
