const mockState = {
  auth: {
    token: {
      unencoded: { iss: "http://geocities.com" }
    }
  }
};

jest.mock("axios", () => ({
  default: {
    interceptors: {
      response: { use: jest.fn() },
      request: { use: jest.fn() }
    },
    get() { return Promise.resolve({ data: mockState }); }
  }
}));

jest.mock("../../session", () => ({
  Session: {
    fetchStoredToken: jest.fn(),
    deprecatedGetNum: () => undefined,
    deprecatedGetBool: () => undefined,
    getAll: () => undefined,
    clear: jest.fn()
  }
}));

jest.mock("../../auth/actions", () => ({
  didLogin: jest.fn(),
  setToken: jest.fn()
}));

import { ready } from "../actions";
import { setToken } from "../../auth/actions";
import { Session } from "../../session";

describe("Actions", () => {
  it("calls didLogin()", () => {
    jest.resetAllMocks();
    const dispatch = jest.fn();
    const getState = jest.fn(() => mockState);
    const thunk = ready();
    thunk(dispatch, getState);
    expect(setToken).toHaveBeenCalled();
  });

  it("Calls Session.clear() when missing auth", () => {
    jest.resetAllMocks();
    const dispatch = jest.fn();
    const getState = jest.fn(() => ({}));
    const thunk = ready();
    thunk(dispatch, getState);
    expect(Session.clear).toHaveBeenCalled();
  });
});
