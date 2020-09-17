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
import { auth } from "../__test_support__/fake_state/token";

API.setBaseUrl("http://blah.whatever.party");

describe("maybeRefreshToken()", () => {

  it("logs you out when a refresh fails", async () => {
    const result = await maybeRefreshToken(auth);
    expect(result).toBeUndefined();
  });
});
