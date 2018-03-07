import { semverCompare, SemverResult, minFwVersionCheck } from "../version";
import { shouldDisplay } from "..";

describe("semver compare", () => {
  it("knows when RIGHT_IS_GREATER: numeric", () => {
    expect(semverCompare("3.1.6", "4.0.0"))
      .toBe(SemverResult.RIGHT_IS_GREATER);

    expect(semverCompare("2.1.6", "4.1.0"))
      .toBe(SemverResult.RIGHT_IS_GREATER);

    expect(semverCompare("4.1.6", "5.1.9"))
      .toBe(SemverResult.RIGHT_IS_GREATER);

    expect(semverCompare("1.1.9", "2.0.2"))
      .toBe(SemverResult.RIGHT_IS_GREATER);
  });

  it("knows when RIGHT_IS_GREATER: undefined", () => {
    expect(semverCompare("", "1.0.0"))
      .toBe(SemverResult.RIGHT_IS_GREATER);

    expect(semverCompare("x.y.z", "1.0.0"))
      .toBe(SemverResult.RIGHT_IS_GREATER);
  });

  it("knows when RIGHT_IS_GREATER: pre-release identifiers", () => {
    expect(semverCompare("6.1.0", "6.1.1-beta"))
      .toBe(SemverResult.RIGHT_IS_GREATER);

    expect(semverCompare("1.1.1-beta", "1.1.1"))
      .toBe(SemverResult.RIGHT_IS_GREATER);
  });

  it("knows when LEFT_IS_GREATER: numeric", () => {
    expect(semverCompare("4.0.0", "3.1.6"))
      .toBe(SemverResult.LEFT_IS_GREATER);

    expect(semverCompare("4.1.0", "2.1.6"))
      .toBe(SemverResult.LEFT_IS_GREATER);

    expect(semverCompare("5.1.9", "4.1.6"))
      .toBe(SemverResult.LEFT_IS_GREATER);

    expect(semverCompare("2.0.2", "1.1.9"))
      .toBe(SemverResult.LEFT_IS_GREATER);
  });

  it("knows when LEFT_IS_GREATER: undefined", () => {
    expect(semverCompare("1.0.0", ""))
      .toBe(SemverResult.LEFT_IS_GREATER);

    expect(semverCompare("1.0.0", "x.y.z"))
      .toBe(SemverResult.LEFT_IS_GREATER);
  });

  it("knows when LEFT_IS_GREATER: pre-release identifiers", () => {
    expect(semverCompare("6.1.1-beta", "6.1.0"))
      .toBe(SemverResult.LEFT_IS_GREATER);

    expect(semverCompare("1.1.1", "1.1.1-beta"))
      .toBe(SemverResult.LEFT_IS_GREATER);
  });

  it("knows when EQUAL", () => {
    expect(semverCompare("1.1.1", "1.1.1"))
      .toBe(SemverResult.EQUAL);

    expect(semverCompare("", ""))
      .toBe(SemverResult.EQUAL);

    expect(semverCompare("1.1.1-beta", "1.1.1-beta"))
      .toBe(SemverResult.EQUAL);
  });
});

describe("minFwVersionCheck()", () => {
  it("firmware version meets or exceeds minimum", () => {
    expect(minFwVersionCheck("1.0.1R", "1.0.1")).toBeTruthy();
    expect(minFwVersionCheck("1.0.2F", "1.0.1")).toBeTruthy();
  });

  it("firmware version doesn't meet minimum", () => {
    expect(minFwVersionCheck("1.0.0R", "1.0.1")).toBeFalsy();
    expect(minFwVersionCheck(undefined, "1.0.1")).toBeFalsy();
    expect(minFwVersionCheck("1.0.0", "1.0.1")).toBeFalsy();
  });
});

describe("shouldDisplay()", () => {
  it("should display", () => {
    expect(shouldDisplay("named_pin", "1000.0.0")).toBeTruthy();
  });

  it("shouldn't display", () => {
    expect(shouldDisplay("named_pin", "1.0.0")).toBeFalsy();
    expect(shouldDisplay("named_pin", undefined)).toBeFalsy();
    expect(shouldDisplay("new_feature", "1.0.0")).toBeFalsy();
  });
});
