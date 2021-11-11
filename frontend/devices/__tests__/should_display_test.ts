import { fakeState } from "../../__test_support__/fake_state";
import { Feature } from "../interfaces";
import { getShouldDisplayFn } from "../should_display";

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
