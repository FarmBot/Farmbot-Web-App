let mockDev = false;
jest.mock("../../account/dev/dev_support", () => ({
  DevSettings: { futureFeaturesEnabled: () => mockDev }
}));

import { fakeState } from "../../__test_support__/fake_state";
import { mapStateToProps } from "../state_to_props";
import { buildResourceIndex } from "../../__test_support__/resource_index_builder";
import { fakeEnigma, fakeFbosConfig } from "../../__test_support__/fake_state/resources";

describe("mapStateToProps()", () => {
  it("handles undefined", () => {
    const state = fakeState();
    state.bot.hardware.enigmas = undefined;
    const props = mapStateToProps(state);
    expect(props.alerts).toEqual([]);
  });

  it("doesn't show API alerts", () => {
    const state = fakeState();
    state.resources = buildResourceIndex([fakeEnigma()]);
    mockDev = false;
    const props = mapStateToProps(state);
    expect(props.alerts).toEqual([]);
  });

  it("shows API alerts", () => {
    const state = fakeState();
    const enigma = fakeEnigma();
    state.resources = buildResourceIndex([enigma]);
    mockDev = true;
    const props = mapStateToProps(state);
    expect(props.alerts).toEqual([enigma.body]);
  });

  it("returns firmware value", () => {
    const state = fakeState();
    const fbosConfig = fakeFbosConfig();
    fbosConfig.body.api_migrated = true;
    fbosConfig.body.firmware_hardware = "arduino";
    state.resources = buildResourceIndex([fbosConfig]);
    const props = mapStateToProps(state);
    expect(props.apiFirmwareValue).toEqual("arduino");
  });
});
