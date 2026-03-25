let mockTimeout = Promise.resolve({ token: "fake token data" });

import { ready, storeToken } from "../actions";
import * as authActions from "../../auth/actions";
import * as refreshToken from "../../refresh_token";
import * as promiseTimeoutModule from "promise-timeout";
import { Session } from "../../session";
import { auth } from "../../__test_support__/fake_state/token";
import { fakeState } from "../../__test_support__/fake_state";
let setTokenSpy: jest.SpyInstance;
let didLoginSpy: jest.SpyInstance;
let maybeRefreshTokenSpy: jest.SpyInstance;
let timeoutSpy: jest.SpyInstance;
let fetchStoredTokenSpy: jest.SpyInstance;
let clearSpy: jest.SpyInstance;
let consoleWarnSpy: jest.SpyInstance;
describe("ready()", () => {
  const flushPromises = async () => {
    await Promise.resolve();
    await Promise.resolve();
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockTimeout = Promise.resolve({ token: "fake token data" });
    setTokenSpy = jest.spyOn(authActions, "setToken")
      .mockImplementation(auth =>
        ({ type: "REPLACE_TOKEN", payload: auth }) as ReturnType<typeof authActions.setToken>);
    didLoginSpy = jest.spyOn(authActions, "didLogin")
      .mockImplementation(() => { });
    maybeRefreshTokenSpy = jest.spyOn(refreshToken, "maybeRefreshToken")
      .mockImplementation(() => Promise.resolve(undefined) as never);
    timeoutSpy = jest.spyOn(promiseTimeoutModule, "timeout")
      .mockImplementation(() => mockTimeout as never);
    fetchStoredTokenSpy = jest.spyOn(Session, "fetchStoredToken")
      .mockReturnValue(undefined);
    clearSpy = jest.spyOn(Session, "clear")
      .mockImplementation(() => undefined as never);
    consoleWarnSpy = jest.spyOn(console, "warn").mockImplementation(() => { });
  });

  afterEach(() => {
    fetchStoredTokenSpy.mockRestore();
    clearSpy.mockRestore();
    consoleWarnSpy.mockRestore();
  });

  it("uses new token", async () => {
    const fakeAuth = { token: "fake token data" };
    mockTimeout = Promise.resolve(fakeAuth);
    const dispatch = jest.fn();
    const state = fakeState();
    ready()(dispatch, () => state);
    await flushPromises();
    expect(maybeRefreshTokenSpy).toHaveBeenCalledWith(state.auth);
    expect(setTokenSpy).toHaveBeenCalledWith(fakeAuth);
    expect(didLoginSpy).toHaveBeenCalledWith(fakeAuth, dispatch);
    expect(timeoutSpy).toHaveBeenCalled();
    expect(consoleWarnSpy).not.toHaveBeenCalled();
    expect(Session.clear).not.toHaveBeenCalled();
  });

  it("uses old token", async () => {
    mockTimeout = Promise.reject({ token: "not used" });
    const dispatch = jest.fn();
    const state = fakeState();
    ready()(dispatch, () => state);
    await flushPromises();
    expect(maybeRefreshTokenSpy).toHaveBeenCalledWith(state.auth);
    expect(setTokenSpy).toHaveBeenLastCalledWith(state.auth);
    expect(didLoginSpy).toHaveBeenCalledWith(state.auth, dispatch);
    expect(timeoutSpy).toHaveBeenCalled();
    expect(consoleWarnSpy)
      .toHaveBeenCalledWith(expect.stringContaining("Can't refresh token."));
    expect(Session.clear).not.toHaveBeenCalled();
  });

  it("calls Session.clear() when missing auth", () => {
    const dispatch = jest.fn();
    const state = fakeState();
    delete state.auth;
    const getState = () => state;
    ready()(dispatch, getState);
    expect(setTokenSpy).not.toHaveBeenCalled();
    expect(didLoginSpy).not.toHaveBeenCalled();
    expect(consoleWarnSpy).not.toHaveBeenCalled();
    expect(Session.clear).toHaveBeenCalled();
  });
});

describe("storeToken()", () => {
  beforeEach(() => {
    setTokenSpy = jest.spyOn(authActions, "setToken")
      .mockImplementation(auth =>
        ({ type: "REPLACE_TOKEN", payload: auth }) as ReturnType<typeof authActions.setToken>);
    didLoginSpy = jest.spyOn(authActions, "didLogin")
      .mockImplementation(() => { });
    consoleWarnSpy = jest.spyOn(console, "warn").mockImplementation(() => { });
  });

  afterEach(() => {
    consoleWarnSpy.mockRestore();
  });

  it("stores token", () => {
    const old = auth;
    old.token.unencoded.jti = "old";
    const dispatch = jest.fn();
    storeToken(old, dispatch)(undefined);
    expect(setTokenSpy).toHaveBeenCalledWith(old);
    expect(didLoginSpy).toHaveBeenCalledWith(old, dispatch);
    expect(consoleWarnSpy)
      .toHaveBeenCalledWith(expect.stringContaining("Can't refresh token."));
  });
});
