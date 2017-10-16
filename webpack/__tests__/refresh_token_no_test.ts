jest.mock("axios", () => ({
  default: {
    interceptors: {
      response: { use: jest.fn() },
      request: { use: jest.fn() }
    },
    get() { return Promise.reject("NO"); }
  }
}));

jest.mock("../session", () => {
  return {
    Session: {
      clear: jest.fn(),
      getBool: jest.fn(),
    }
  };
});

import { maybeRefreshToken } from "../refresh_token";
import { API } from "../api/index";
import { Session } from "../session";

API.setBaseUrl("http://blah.whatever.party");

describe("maybeRefreshToken()", () => {

  it("logs you out when a refresh fails", (done) => {
    const t = {
      token: {
        encoded: "---",
        unencoded: {
          iat: 123,
          jti: "111",
          iss: "---",
          exp: 456,
          mqtt: "---",
          os_update_server: "---"
        }
      }
    };
    maybeRefreshToken(t).then((result) => {
      expect(result).toBeUndefined();
      done();
    });
  });
});
