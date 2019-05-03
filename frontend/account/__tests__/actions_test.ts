jest.mock("../../toast_errors", () => ({ toastErrors: jest.fn() }));

import { API } from "../../api/api";
import * as moxios from "moxios";
import { deleteUser, resetAccount } from "../actions";
import { toastErrors } from "../../toast_errors";

describe("deleteUser()", () => {
  beforeEach(function () {
    // import and pass your custom axios instance to this method
    moxios.install();
  });

  afterEach(function () {
    // import and pass your custom axios instance to this method
    moxios.uninstall();
  });

  it("cancels the account", (done) => {
    expect.assertions(3);
    API.setBaseUrl("http://example.com:80");
    const thunk = deleteUser({ password: "Foo!" });
    const dispatch = jest.fn();
    const getState = jest.fn();
    getState.mockImplementation(() => ({ auth: {} }));
    window.alert = jest.fn();
    thunk(dispatch, getState);

    moxios.wait(function () {
      const request = moxios.requests.mostRecent();
      request.respondWith({
        status: 200,
        response: {}
      }).then(function (resp) {
        expect(window.alert).toHaveBeenCalled();
        expect(resp.config.url).toContain("api/users");
        expect(resp.config.method).toBe("delete");
        done();
      });
    });
  });

  it("resets the account", (done) => {
    expect.assertions(3);
    API.setBaseUrl("http://example.com:80");
    const thunk = resetAccount({ password: "Foo!" });
    const dispatch = jest.fn();
    const getState = jest.fn();
    getState.mockImplementation(() => ({ auth: {} }));
    window.alert = jest.fn();
    thunk(dispatch, getState);

    moxios.wait(function () {
      const request = moxios.requests.mostRecent();
      request.respondWith({
        status: 200,
        response: {}
      }).then(function (resp) {
        expect(window.alert).toHaveBeenCalled();
        expect(resp.config.url).toContain("api/device/reset");
        expect(resp.config.method).toBe("post");
        done();
      });
    });
  });

  it("errors while resetting an account", (done) => {
    expect.assertions(3);
    API.setBaseUrl("http://example.com:80");
    const thunk = resetAccount({ password: "not Foo!" });
    const dispatch = jest.fn();
    const getState = jest.fn();
    getState.mockImplementation(() => ({ auth: {} }));
    window.alert = jest.fn();
    thunk(dispatch, getState);

    moxios.wait(function () {
      const request = moxios.requests.mostRecent();
      request.respondWith({
        status: 422,
        response: {}
      }).then(resp => {
        expect(window.alert).not.toHaveBeenCalled();
        expect(toastErrors).toHaveBeenCalled();
        expect(resp.config.url).toContain("api/device/reset");
        done();
      });
    });
  });
});
