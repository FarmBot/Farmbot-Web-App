import { mapStateToProps } from "../state_to_props";
import { fakeState } from "../../__test_support__/fake_state";
import { buildResourceIndex } from "../../__test_support__/resource_index_builder";
import { TaggedLog } from "farmbot";
import { times } from "lodash";
import {
  fakeFbosConfig, fakeLog
} from "../../__test_support__/fake_state/resources";

describe("mapStateToProps()", () => {
  function fakeLogs(count: number): TaggedLog[] {
    return times(count, fakeLog);
  }

  it("returns limited number of logs", () => {
    const state = fakeState();
    state.resources = buildResourceIndex(fakeLogs(300));
    const props = mapStateToProps(state);
    expect(props.logs.length).toEqual(250);
  });

  it("API source of FBOS settings", () => {
    const state = fakeState();
    state.bot.hardware.configuration.sequence_init_log = false;
    const fakeApiConfig = fakeFbosConfig();
    fakeApiConfig.body.sequence_init_log = true;
    state.resources = buildResourceIndex([fakeApiConfig]);
    const props = mapStateToProps(state);
    expect(props.sourceFbosConfig("sequence_init_log")).toEqual({
      value: true, consistent: false
    });
  });
});
