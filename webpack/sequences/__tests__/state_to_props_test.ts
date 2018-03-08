jest.mock("react-redux", () => ({
  connect: jest.fn()
}));

import { mapStateToProps } from "../state_to_props";
import { fakeState } from "../../__test_support__/fake_state";

describe("mapStateToProps()", () => {
  it("returns props", () => {
    const props = fakeState();
    const returnedProps = mapStateToProps(props);
    expect(returnedProps.sequence).toEqual(undefined);
    expect(returnedProps.syncStatus).toEqual("unknown");
  });

  it("returns shouldDisplay()", () => {
    const state = fakeState();
    state.bot.hardware.informational_settings.controller_version = "2.0.0";
    state.bot.minOsFeatureData = "{\"new_feature\": \"1.0.0\"}";
    const props = mapStateToProps(state);
    expect(props.shouldDisplay("some_feature")).toBeFalsy();
    expect(props.shouldDisplay("new_feature")).toBeTruthy();
  });
});
