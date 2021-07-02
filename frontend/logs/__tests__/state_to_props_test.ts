import { mapStateToProps } from "../state_to_props";
import { fakeState } from "../../__test_support__/fake_state";
import {
  buildResourceIndex, fakeDevice,
} from "../../__test_support__/resource_index_builder";
import { TaggedResource } from "farmbot";
import { times } from "lodash";
import {
  fakeFbosConfig, fakeLog, fakeWebAppConfig,
} from "../../__test_support__/fake_state/resources";
import { NumericSetting } from "../../session_keys";

describe("mapStateToProps()", () => {
  function fakeLogs(count: number): TaggedResource[] {
    return times(count, fakeLog);
  }

  it("returns limited number of logs", () => {
    const state = fakeState();
    state.resources = buildResourceIndex(fakeLogs(300).concat([fakeDevice()]));
    const props = mapStateToProps(state);
    expect(props.logs.length).toEqual(250);
  });

  it("API source of FBOS settings", () => {
    const state = fakeState();
    state.bot.hardware.configuration.sequence_init_log = false;
    const fakeApiConfig = fakeFbosConfig();
    fakeApiConfig.body.sequence_init_log = true;
    state.resources = buildResourceIndex([fakeApiConfig, fakeDevice()]);
    const props = mapStateToProps(state);
    expect(props.sourceFbosConfig("sequence_init_log")).toEqual({
      value: true, consistent: false
    });
  });

  it("returns value", () => {
    const state = fakeState();
    const config = fakeWebAppConfig();
    config.body.success_log = 2;
    state.resources = buildResourceIndex([config, fakeDevice()]);
    const props = mapStateToProps(state);
    expect(props.getConfigValue(NumericSetting.success_log)).toEqual(2);
  });
});
