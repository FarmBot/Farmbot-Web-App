import { auth } from "../__test_support__/fake_state/token";
import axios from "axios";
const mockAuth = (iss = "987"): AuthState => {
  auth.token.unencoded.iss = iss;
  return auth;
};

import { AuthState } from "../auth/interfaces";
import { maybeRefreshToken } from "../refresh_token";
import { API } from "../api/index";

API.setBaseUrl("http://whatever.party");

describe("maybeRefreshToken()", () => {
  beforeEach(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (axios as any).get = jest.fn(() => Promise.resolve({ data: mockAuth("000") }));
  });

  it("gives you back your token when things fail", async () => {
    const nextToken = await maybeRefreshToken(mockAuth("111"));
    expect(nextToken?.token.unencoded.iss).toEqual("000");
  });
});
