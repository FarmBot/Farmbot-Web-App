jest.unmock("../actions");

jest.mock("../../auth/actions", () => ({
  didLogin: jest.fn(),
  setToken: jest.fn(),
}));

jest.mock("../../refresh_token", () => ({ maybeRefreshToken: jest.fn() }));

let mockTimeout = Promise.resolve({ token: "fake token data" });
jest.mock("promise-timeout", () => ({ timeout: () => mockTimeout }));

import { ready, storeToken } from "../actions";
import { setToken, didLogin } from "../../auth/actions";
import { maybeRefreshToken } from "../../refresh_token";
import { Session } from "../../session";
import { auth } from "../../__test_support__/fake_state/token";
import { fakeState } from "../../__test_support__/fake_state";

afterAll(() => {
  jest.unmock("../../auth/actions");
  jest.unmock("../../refresh_token");
  jest.unmock("promise-timeout");
});
describe("ready()", () => {
  const flushPromises = async () => {
    await Promise.resolve();
    await Promise.resolve();
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockTimeout = Promise.resolve({ token: "fake token data" });
    jest.spyOn(Session, "fetchStoredToken").mockReturnValue(undefined);
    jest.spyOn(Session, "clear").mockImplementation(jest.fn());
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("uses new token", async () => {
    const fakeAuth = { token: "fake token data" };
    mockTimeout = Promise.resolve(fakeAuth);
    const dispatch = jest.fn();
    const state = fakeState();
    console.warn = jest.fn();
    ready()(dispatch, () => state);
    await flushPromises();
    expect(maybeRefreshToken).toHaveBeenCalledWith(state.auth);
    expect(setToken).toHaveBeenCalledWith(fakeAuth);
    expect(didLogin).toHaveBeenCalledWith(fakeAuth, dispatch);
    expect(console.warn).not.toHaveBeenCalled();
    expect(Session.clear).not.toHaveBeenCalled();
  });

  it("uses old token", async () => {
    mockTimeout = Promise.reject({ token: "not used" });
    const dispatch = jest.fn();
    const state = fakeState();
    console.warn = jest.fn();
    ready()(dispatch, () => state);
    await flushPromises();
    expect(maybeRefreshToken).toHaveBeenCalledWith(state.auth);
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
    ready()(dispatch, getState);
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
