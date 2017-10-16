jest.mock("../../session", () => ({
  Session: {
    clear: jest.fn(),
    getBool: () => true,
    fetchStoredToken: () => ({})
  }
}));

jest.mock("farmbot-toastr", () => ({
  success: jest.fn(),
  error: jest.fn(),
  info: jest.fn(),
  warning: jest.fn()
}));

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

import { Session } from "../../session";
import { logout, requestToken, requestRegistration, didLogin } from "../actions";
import { Actions } from "../../constants";
import { success } from "farmbot-toastr";
import { API } from "../../api/api";
import axios from "axios";
import { AuthState } from "../interfaces";

describe("logout()", () => {
  it("displays the toast if you are logged out", () => {
    const result = logout();
    expect(result.type).toEqual(Actions.LOGOUT);
    expect(success).toHaveBeenCalledWith("You have been logged out.");
    expect(Session.clear).toHaveBeenCalled();
  });
});

describe("requestToken()", () => {
  it("requests an auth token over HTTP", async () => {
    const url = "geocities.com";
    const email = "foo@bar.com";
    const password = "password123";
    const result = await requestToken(email, password, url);

    expect(axios.post).toHaveBeenCalledWith("/api/tokenStub",
      { user: { email, password } });
    expect(result).toBeTruthy();
    expect(result.data.foo).toEqual("bar");
    expect(API.setBaseUrl).toHaveBeenCalledWith(url);
  });
});

describe("requestRegistration", () => {
  it("sends registration to the API", async () => {
    const inputs = {
      email: "foo@bar.co",
      password: "password",
      password_confirmation: "password",
      name: "Paul"
    };
    const resp = await requestRegistration(inputs.name,
      inputs.email,
      inputs.password,
      inputs.password_confirmation);

    expect(resp.data.foo).toEqual("bar");
    expect(axios.post).toHaveBeenCalledWith("/api/userStub", { user: inputs });
  });
});

describe("didLogin()", () => {
  it("bootstraps the user session", () => {
    const mockToken: AuthState = {
      token: {
        encoded: "---",
        unencoded: { iss: "iss", os_update_server: "os_update_server" }
      }
    };
    const dispatch = jest.fn();
    const result = didLogin(mockToken, dispatch);
    expect(result).toBeUndefined();

    const { iss } = mockToken.token.unencoded;
    expect(API.setBaseUrl).toHaveBeenCalledWith(iss);
    const actions = dispatch.mock.calls.map(x => x && x[0] && x[0].type);
    expect(actions).toContain(Actions.REPLACE_TOKEN);
  });
});
