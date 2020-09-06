jest.mock("axios", () => ({
  interceptors: {
    response: { use: jest.fn() },
    request: { use: jest.fn() }
  },
  get: jest.fn(() => Promise.reject("NO")),
}));

jest.mock("../session", () => ({ Session: { clear: jest.fn() } }));

import { maybeRefreshToken } from "../refresh_token";
import { API } from "../api/index";

API.setBaseUrl("http://blah.whatever.party");

describe("maybeRefreshToken()", () => {

  it("logs you out when a refresh fails", async () => {
    const t = {
      token: {
        encoded: "---",
        unencoded: {
          jti: "---",
          iss: "---",
          exp: 456,
          mqtt: "---",
          os_update_server: "---"
        }
      }
    };
    const result = await maybeRefreshToken(t);
    expect(result).toBeUndefined();
  });
});
