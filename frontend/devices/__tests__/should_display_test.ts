import { fakeState } from "../../__test_support__/fake_state";
const mockState = fakeState();
jest.mock("../../redux/store", () => ({
  store: { getState: () => mockState, dispatch: jest.fn() },
}));

import { Feature } from "../interfaces";
import { getShouldDisplayFn, shouldDisplayFeature } from "../should_display";

describe("getShouldDisplayFn()", () => {
  it("returns shouldDisplay()", () => {
    const state = fakeState();
    state.bot.hardware.informational_settings.controller_version = "2.0.0";
    state.bot.minOsFeatureData = { "jest_feature": "1.0.0" };
    const shouldDisplay = getShouldDisplayFn(state.resources.index, state.bot);
    expect(shouldDisplay("some_feature" as Feature)).toBeFalsy();
    expect(shouldDisplay(Feature.jest_feature)).toBeTruthy();
  });
});

describe("shouldDisplayFeature()", () => {
  it("should display", () => {
    mockState.bot.hardware.informational_settings.controller_version = "2.0.0";
    mockState.bot.minOsFeatureData = { "jest_feature": "1.0.0" };
    expect(shouldDisplayFeature(Feature.jest_feature)).toBeTruthy();
  });
});
