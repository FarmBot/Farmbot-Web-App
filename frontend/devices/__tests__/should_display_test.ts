import { fakeState } from "../../__test_support__/fake_state";
import { Feature } from "../interfaces";
import * as shouldDisplayModule from "../should_display";
import { DevSettings } from "../../settings/dev/dev_support";

let overriddenFbosVersionSpy: jest.SpyInstance;

beforeEach(() => {
  jest.restoreAllMocks();
  overriddenFbosVersionSpy =
    jest.spyOn(DevSettings, "overriddenFbosVersion").mockReturnValue(undefined);
});

afterEach(() => {
  overriddenFbosVersionSpy.mockRestore();
});

describe("getShouldDisplayFn()", () => {
  it("returns shouldDisplay()", () => {
    const state = fakeState();
    state.bot.hardware.informational_settings.controller_version = "2.0.0";
    state.bot.minOsFeatureData = { "jest_feature": "1.0.0" };
    const shouldDisplay =
      shouldDisplayModule.getShouldDisplayFn(state.resources.index, state.bot);
    expect(shouldDisplay("some_feature" as Feature)).toBeFalsy();
    expect(shouldDisplay(Feature.jest_feature)).toBeTruthy();
  });
});

describe("shouldDisplayFeature()", () => {
  it("should display", () => {
    const result = shouldDisplayModule.shouldDisplayFeature(Feature.jest_feature);
    expect(typeof result).toEqual("boolean");
  });
});
