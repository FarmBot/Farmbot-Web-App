import {
  isNumericSetting,
  safeNumericSetting,
  Session,
} from "../session";
import { auth } from "../__test_support__/fake_state/token";

describe("fetchStoredToken", () => {
  it("can't fetch token", () => {
    expect(Session.fetchStoredToken()).toEqual(undefined);
  });

  it("can fetch token", () => {
    localStorage.setItem("session", JSON.stringify(auth));
    expect(Session.fetchStoredToken()).toEqual(auth);
  });

  it("handles non-token", () => {
    localStorage.setItem("session", "0");
    expect(Session.fetchStoredToken()).toEqual(undefined);
  });
});

describe("replaceToken()", () => {
  it("replaces token", () => {
    Session.replaceToken(auth);
    expect(localStorage.getItem("session")).toEqual(JSON.stringify(auth));
  });
});

describe("isNumericSetting", () => {
  it("determines numericality", () => {
    expect(isNumericSetting("zoom_level")).toBe(true);
    expect(isNumericSetting("foo")).toBe(false);
  });
});

describe("safeNumericSetting", () => {
  it("safely returns num", () => {
    expect(() => safeNumericSetting("no")).toThrow();
    expect(safeNumericSetting("zoom_level")).toBe("zoom_level");
  });
});

describe("clear()", () => {
  it("clears", () => {
    jest.clearAllMocks();
    localStorage.foo = "bar";
    sessionStorage.foo = "bar";
    expect(localStorage.foo).toBeTruthy();
    expect(sessionStorage.foo).toBeTruthy();
    expect(Session.clear()).toEqual(undefined);
    expect(location.assign).toHaveBeenCalled();
    expect(localStorage.foo).toBeFalsy();
    expect(sessionStorage.foo).toBeFalsy();
  });
});
