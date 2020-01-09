import { mapStateToProps } from "../state_to_props";
import { buildResourceIndex } from "../../__test_support__/resource_index_builder";
import { fakeUser, fakeFarmwareEnv } from "../../__test_support__/fake_state/resources";
import { fakeState } from "../../__test_support__/fake_state";

describe("mapStateToProps()", () => {
  it("fetches the appropriate resources", () => {
    const state = fakeState();
    state.resources = buildResourceIndex([fakeUser()]);
    const result = mapStateToProps(state);
    expect(result.timeSettings).toEqual({ utcOffset: 0, hour24: false });
  });

  it("returns api props", () => {
    const state = fakeState();
    const fakeEnv = fakeFarmwareEnv();
    state.resources = buildResourceIndex([fakeEnv]);
    state.bot.minOsFeatureData = { api_farmware_env: "8.0.0" };
    state.bot.hardware.informational_settings.controller_version = "8.0.0";
    const result = mapStateToProps(state);
    expect(result.env).toEqual({ [fakeEnv.body.key]: fakeEnv.body.value });
  });
});
