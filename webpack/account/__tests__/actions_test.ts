import { API } from "../../api/api";
import * as moxios from "moxios";
import { deleteUser } from "../actions";

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
    expect.assertions(2);
    API.setBaseUrl("http://example.com:80");
    let thunk = deleteUser({ password: "Foo!" });
    let dispatch = jest.fn();
    let getState = jest.fn();
    getState.mockImplementation(() => ({ auth: {} }));
    thunk(dispatch, getState);
    moxios.wait(function () {
      let request = moxios.requests.mostRecent();
      request.respondWith({
        status: 200,
        response: {}
      }).then(function (resp) {
        expect(resp.config.url).toContain("api/users");
        expect(resp.config.method).toBe("delete");
        done();
      });
    });
  });
});
