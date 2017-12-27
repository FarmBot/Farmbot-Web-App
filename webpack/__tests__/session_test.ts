import {
  isNumericSetting,
  isBooleanSetting,
  safeBooleanSettting,
  safeNumericSetting
} from "../session";

describe("isNumericSetting", () => {
  it("determines numericality", () => {
    expect(isNumericSetting("zoomLevel")).toBe(true);
    expect(isNumericSetting("foo")).toBe(false);
  });
});

describe("isBooleanSetting", () => {
  it("determines boolean-ness of settings", () => {
    expect(isBooleanSetting("xAxisInverted")).toBe(true);
    expect(isBooleanSetting("no")).toBe(false);
  });
});

describe("safeBooleanSetting", () => {
  it("safely fetches bool", () => {
    expect(() => safeBooleanSettting("NO")).toThrow();
    expect(safeBooleanSettting("xAxisInverted")).toBe("xAxisInverted");
  });
});

describe("safeNumericSetting", () => {
  it("safely returns num", () => {
    expect(() => safeNumericSetting("NO")).toThrow();
    expect(safeNumericSetting("zoomLevel")).toBe("zoomLevel");
  });
});
