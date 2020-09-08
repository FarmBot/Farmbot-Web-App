const mockAuth = (iss = "987"): AuthState => ({
  token: {
    encoded: "---",
    unencoded: { iss, os_update_server: "---", jti: "---" }
  }
});

jest.mock("axios", () => ({
  get: jest.fn(() => Promise.resolve({ data: mockAuth("000") })),
  interceptors: {
    response: { use: jest.fn() },
    request: { use: jest.fn() }
  },
}));

import { AuthState } from "../auth/interfaces";
import { maybeRefreshToken } from "../refresh_token";
import { API } from "../api/index";

API.setBaseUrl("http://whatever.party");

describe("maybeRefreshToken()", () => {
  it("gives you back your token when things fail", async () => {
    const nextToken = await maybeRefreshToken(mockAuth("111"));
    expect(nextToken?.token.unencoded.iss).toEqual("000");
  });
});
