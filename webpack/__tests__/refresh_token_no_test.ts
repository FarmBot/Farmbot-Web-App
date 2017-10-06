jest.mock("axios", () => ({
  default: {
    get() {
      return Promise.reject("NO");
    }
  }
}));

import { AuthState } from "../auth/interfaces";
import { maybeRefreshToken } from "../refresh_token";
import { API } from "../api/index";

API.setBaseUrl("http://blah.whatever.party");

const fakeAuth = (jti = "456"): AuthState => ({
  token: {
    encoded: "---",
    unencoded: {
      iat: 123,
      jti,
      iss: "---",
      exp: 456,
      mqtt: "---",
      os_update_server: "---"
    }
  }
});

describe("maybeRefreshToken()", () => {

  it("gives you the old token when it cant find a new one", (done) => {
    maybeRefreshToken(fakeAuth("111"))
      .then((nextToken) => {
        expect(nextToken.token.unencoded.jti).toEqual("111");
        done();
      });
  });
});
