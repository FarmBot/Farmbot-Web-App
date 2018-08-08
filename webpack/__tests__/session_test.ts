import { fakeWebAppConfig } from "../__test_support__/fake_state/resources";
import { fakeState } from "../__test_support__/fake_state";

const mockConfig = fakeWebAppConfig();
jest.mock("../resources/selectors_by_kind", () => ({
  getWebAppConfig: () => mockConfig
}));

jest.mock("../api/crud", () => ({
  edit: jest.fn(),
  save: jest.fn(),
}));

const mockState = fakeState();
jest.mock("../redux/store", () => ({
  store: {
    dispatch: jest.fn(),
    getState: () => mockState,
  }
}));

import {
  isNumericSetting,
  isBooleanSetting,
  safeBooleanSettting,
  safeNumericSetting,
  Session,
} from "../session";
import { auth } from "../__test_support__/fake_state/token";
import { edit, save } from "../api/crud";

describe("fetchStoredToken", () => {
  it("can't fetch token", () => {
    expect(Session.fetchStoredToken()).toEqual(undefined);
  });

  it("can fetch token", () => {
    localStorage.setItem("session", JSON.stringify(auth));
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

describe("setBool", () => {
  it("sets bool", () => {
    Session.setBool("x_axis_inverted", false);
    expect(edit).toHaveBeenCalledWith(expect.any(Object), {
      x_axis_inverted: false
    });
    expect(save).toHaveBeenCalledWith(mockConfig.uuid);
  });
});

describe("invertBool", () => {
  it("inverts bool", () => {
    Session.invertBool("x_axis_inverted");
    expect(edit).toHaveBeenCalledWith(expect.any(Object), {
      x_axis_inverted: true
    });
    expect(save).toHaveBeenCalledWith(mockConfig.uuid);
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
    localStorage.clear = jest.fn();
    sessionStorage.clear = jest.fn();
    window.location.assign = jest.fn();
    expect(Session.clear()).toEqual(undefined);
    expect(localStorage.clear).toHaveBeenCalled();
    expect(sessionStorage.clear).toHaveBeenCalled();
    expect(window.location.assign).toHaveBeenCalled();
  });
});
