jest.mock("../../../toast_errors", () => ({ toastErrors: jest.fn() }));

import { API } from "../../../api/api";
import moxios from "moxios";
import { deleteUser, resetAccount } from "../actions";
import { toastErrors } from "../../../toast_errors";

describe("deleteUser()", () => {
  beforeEach(() => moxios.install());
  afterEach(() => moxios.uninstall());

  interface TestArgs {
    fn: Function;
    method: "post" | "delete";
    url: string;
    code: number;
  }

  /** Set test title string for test case. */
  const ts = (testCase: TestArgs) => Object.assign(testCase, {
    toString: () => [testCase.method, testCase.url, testCase.code].join(" "),
  });

  it.each<TestArgs | jest.DoneCallback>([
    ts({ fn: deleteUser, method: "delete", url: "api/users", code: 200 }),
    ts({ fn: deleteUser, method: "delete", url: "api/users", code: 422 }),
    ts({ fn: resetAccount, method: "post", url: "api/device/reset", code: 200 }),
    ts({ fn: resetAccount, method: "post", url: "api/device/reset", code: 422 }),
  ])("%s", (testArgs: TestArgs, done: jest.DoneCallback) => {
    expect.assertions(4);
    API.setBaseUrl("http://example.com:80");
    const thunk = testArgs.fn({ password: "Foo!" });
    const dispatch = jest.fn();
    const getState = jest.fn();
    getState.mockImplementation(() => ({ auth: {} }));
    window.alert = jest.fn();
    thunk(dispatch, getState);

    moxios.wait(() => {
      const request = moxios.requests.mostRecent();
      request.respondWith({
        status: testArgs.code,
        response: {},
      }).then(resp => {
        expect(resp.config.url).toContain(testArgs.url);
        expect(resp.config.method).toBe(testArgs.method);
        if (testArgs.code == 200) {
          expect(window.alert).toHaveBeenCalled();
          expect(toastErrors).not.toHaveBeenCalled();
        } else {
          expect(window.alert).not.toHaveBeenCalled();
          expect(toastErrors).toHaveBeenCalled();
        }
        done();
      }, console.log);
    });
  });
});
