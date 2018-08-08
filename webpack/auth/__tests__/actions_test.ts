jest.mock("axios", () => ({
  default: {
    interceptors: {
      response: { use: jest.fn() },
      request: { use: jest.fn() }
    },
    post: jest.fn(() => { return Promise.resolve({ data: { foo: "bar" } }); }),
    get: jest.fn(() => { return Promise.resolve({ data: { foo: "bar" } }); }),
  }
}));

jest.mock("../../api/api", () => ({
  API: {
    setBaseUrl: jest.fn(),
    inferPort: () => 443,
    current: {
      tokensPath: "/api/tokenStub",
      usersPath: "/api/userStub"
    }
  }
}));

jest.mock("../../devices/actions", () => ({
  fetchReleases: jest.fn(),
  fetchMinOsFeatureData: jest.fn(),
}));

import { didLogin } from "../actions";
import { Actions } from "../../constants";
import { API } from "../../api/api";
import { AuthState } from "../interfaces";
import { fetchReleases } from "../../devices/actions";

const mockToken = (): AuthState => ({
  token: {
    encoded: "---",
    unencoded: { iss: "iss", os_update_server: "os_update_server", jti: "---" }
  }
});

describe("didLogin()", () => {
  it("bootstraps the user session", () => {
    const dispatch = jest.fn();
    const result = didLogin(mockToken(), dispatch);
    expect(result).toBeUndefined();

    const { iss } = mockToken().token.unencoded;
    expect(API.setBaseUrl).toHaveBeenCalledWith(iss);
    const actions = dispatch.mock.calls.map(x => x && x[0] && x[0].type);
    expect(actions).toContain(Actions.REPLACE_TOKEN);
  });

  it("fetches beta release info", () => {
    const dispatch = jest.fn();
    const mockAuth = mockToken();
    mockAuth.token.unencoded.beta_os_update_server = "beta_os_update_server";
    didLogin(mockAuth, dispatch);
    expect(fetchReleases).toHaveBeenCalledWith("os_update_server");
    expect(fetchReleases).toHaveBeenCalledWith("beta_os_update_server",
      { beta: true });
  });
});
