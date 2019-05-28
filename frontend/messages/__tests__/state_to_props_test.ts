import { fakeState } from "../../__test_support__/fake_state";
import { mapStateToProps } from "../state_to_props";
import { buildResourceIndex } from "../../__test_support__/resource_index_builder";
import {
  fakeAlert, fakeFbosConfig
} from "../../__test_support__/fake_state/resources";

describe("mapStateToProps()", () => {
  it("handles undefined", () => {
    const state = fakeState();
    state.bot.hardware.alerts = undefined;
    const props = mapStateToProps(state);
    expect(props.alerts).toEqual([]);
  });

  it("shows API alerts", () => {
    const state = fakeState();
    const alert = fakeAlert();
    alert.body.problem_tag = "api.seed_data.missing";
    state.resources = buildResourceIndex([alert]);
    const props = mapStateToProps(state);
    expect(props.alerts).toEqual([alert.body]);
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

  it("finds alert", () => {
    const state = fakeState();
    const alert = fakeAlert();
    alert.body.id = 1;
    state.resources = buildResourceIndex([alert]);
    const props = mapStateToProps(state);
    expect(props.findApiAlertById(1)).toEqual(alert.uuid);
  });
});
