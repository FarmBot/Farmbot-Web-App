const mockAuth = (jti = "456"): AuthState => ({
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

jest.mock("axios", () => ({
  default: {
    get() {
      return Promise.resolve({ data: mockAuth("000") });
    }
  }
}));

import { AuthState } from "../auth/interfaces";
import { maybeRefreshToken } from "../refresh_token";
import { API } from "../api/index";

API.setBaseUrl("http://whatever.party");

describe("maybeRefreshToken()", () => {
  it("gives you back your token when things fail", (done) => {
    maybeRefreshToken(mockAuth("111"))
      .then((nextToken) => {
        expect(nextToken.token.unencoded.jti).toEqual("000");
        done();
      });
  });
});
