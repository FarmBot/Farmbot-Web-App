jest.mock("axios", () => ({
  interceptors: {
    response: { use: jest.fn() },
    request: { use: jest.fn() }
  },
  post: jest.fn(() => Promise.resolve({ data: { foo: "bar" } })),
  get: jest.fn(() => Promise.resolve({ data: { foo: "bar" } })),
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

import { didLogin } from "../actions";
import { Actions } from "../../constants";
import { API } from "../../api/api";
import { auth } from "../../__test_support__/fake_state/token";

describe("didLogin()", () => {
  it("bootstraps the user session", () => {
    const dispatch = jest.fn();
    const result = didLogin(auth, dispatch);
    expect(result).toBeUndefined();

    const { iss } = auth.token.unencoded;
    expect(API.setBaseUrl).toHaveBeenCalledWith(iss);
    const actions = dispatch.mock.calls.map(x => x && x[0] && x[0].type);
    expect(actions).toContain(Actions.REPLACE_TOKEN);
  });
});
