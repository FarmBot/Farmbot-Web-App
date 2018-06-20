import {
  isNumericSetting,
  isBooleanSetting,
  safeBooleanSettting,
  safeNumericSetting,
  Session
} from "../session";
import { auth } from "../__test_support__/fake_state/token";

describe("fetchStoredToken", () => {
  it("can't fetch token", () => {
    expect(Session.fetchStoredToken()).toEqual(undefined);
  });

  it("can fetch token", () => {
    localStorage["session"] = JSON.stringify(auth);
    expect(Session.fetchStoredToken()).toEqual(auth);
  });
});

describe("isNumericSetting", () => {
  it("determines numericality", () => {
    expect(isNumericSetting("zoom_level")).toBe(true);
    expect(isNumericSetting("foo")).toBe(false);
  });
});

describe("isBooleanSetting", () => {
  it("determines boolean-ness of settings", () => {
    expect(isBooleanSetting("x_axis_inverted")).toBe(true);
    expect(isBooleanSetting("no")).toBe(false);
  });
});

describe("safeBooleanSetting", () => {
  it("safely fetches bool", () => {
    expect(() => safeBooleanSettting("no")).toThrow();
    expect(safeBooleanSettting("x_axis_inverted")).toBe("x_axis_inverted");
  });
});

describe("safeNumericSetting", () => {
  it("safely returns num", () => {
    expect(() => safeNumericSetting("no")).toThrow();
    expect(safeNumericSetting("zoom_level")).toBe("zoom_level");
  });
});
