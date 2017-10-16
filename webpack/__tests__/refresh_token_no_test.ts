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

API.setBaseUrl("http://blah.whatever.party");

describe("maybeRefreshToken()", () => {

  it("logs you out when a refresh fails", (done) => {
    const t = {
      token: {
        encoded: "---",
        unencoded: {
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
