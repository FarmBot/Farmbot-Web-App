jest.mock("../../session", () => ({
  Session: {
    fetchStoredToken: jest.fn(),
    getAll: () => undefined,
    clear: jest.fn(),
  }
}));

jest.mock("../../auth/actions", () => ({
  didLogin: jest.fn(),
  setToken: jest.fn(),
}));

jest.mock("../../refresh_token", () => ({ maybeRefreshToken: jest.fn() }));

let mockTimeout = Promise.resolve({ token: "fake token data" });
jest.mock("promise-timeout", () => ({ timeout: () => mockTimeout }));

import { ready, storeToken } from "../actions";
import { setToken, didLogin } from "../../auth/actions";
import { Session } from "../../session";
import { auth } from "../../__test_support__/fake_state/token";
import { fakeState } from "../../__test_support__/fake_state";

describe("ready()", () => {
  it("uses new token", async () => {
    const fakeAuth = { token: "fake token data" };
    mockTimeout = Promise.resolve(fakeAuth);
    const dispatch = jest.fn();
    const thunk = ready();
    const state = fakeState();
    console.warn = jest.fn();
    await thunk(dispatch, () => state);
    expect(setToken).toHaveBeenCalledWith(fakeAuth);
    expect(didLogin).toHaveBeenCalledWith(fakeAuth, dispatch);
    expect(console.warn).not.toHaveBeenCalled();
    expect(Session.clear).not.toHaveBeenCalled();
  });

  it("uses old token", async () => {
    mockTimeout = Promise.reject({ token: "not used" });
    const dispatch = jest.fn();
    const thunk = ready();
    const state = fakeState();
    console.warn = jest.fn();
    await thunk(dispatch, () => state);
    expect(setToken).toHaveBeenLastCalledWith(state.auth);
    expect(didLogin).toHaveBeenCalledWith(state.auth, dispatch);
    expect(console.warn)
      .toHaveBeenCalledWith(expect.stringContaining("Can't refresh token."));
    expect(Session.clear).not.toHaveBeenCalled();
  });

  it("calls Session.clear() when missing auth", () => {
    const dispatch = jest.fn();
    const state = fakeState();
    delete state.auth;
    const getState = () => state;
    const thunk = ready();
    console.warn = jest.fn();
    thunk(dispatch, getState);
    expect(setToken).not.toHaveBeenCalled();
    expect(didLogin).not.toHaveBeenCalled();
    expect(console.warn).not.toHaveBeenCalled();
    expect(Session.clear).toHaveBeenCalled();
  });
});

describe("storeToken()", () => {
  it("stores token", () => {
    const old = auth;
    old.token.unencoded.jti = "old";
    const dispatch = jest.fn();
    console.warn = jest.fn();
    storeToken(old, dispatch)(undefined);
    expect(setToken).toHaveBeenCalledWith(old);
    expect(didLogin).toHaveBeenCalledWith(old, dispatch);
    expect(console.warn)
      .toHaveBeenCalledWith(expect.stringContaining("Can't refresh token."));
  });
});
