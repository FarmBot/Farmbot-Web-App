import { maybeRefreshToken } from "../refresh_token";
import { API } from "../api/index";
import { auth } from "../__test_support__/fake_state/token";
import axios from "axios";

API.setBaseUrl("http://blah.whatever.party");

describe("maybeRefreshToken()", () => {
  let axiosGetSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    axiosGetSpy = jest.spyOn(axios, "get")
      .mockImplementation(() => Promise.reject("NO"));
  });

  afterEach(() => {
    axiosGetSpy.mockRestore();
  });

  it("logs you out when a refresh fails", async () => {
    const result = await maybeRefreshToken(auth);
    expect(result).toBeUndefined();
  });
});
