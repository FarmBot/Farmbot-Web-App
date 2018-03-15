import { mapStateToProps } from "../state_to_props";
import { fakeState } from "../../__test_support__/fake_state";
import { buildResourceIndex } from "../../__test_support__/resource_index_builder";
import { TaggedLog, SpecialStatus } from "../../resources/tagged_resources";
import { Log } from "../../interfaces";
import { generateUuid } from "../../resources/util";
import { times } from "lodash";
import { fakeFbosConfig } from "../../__test_support__/fake_state/resources";

describe("mapStateToProps()", () => {
  function fakeLogs(count: number): TaggedLog[] {
    const log: Log = {
      id: 1,
      created_at: -1,
      message: "Fake log message",
      meta: {
        type: "info"
      },
      channels: []
    };
    return times(count, () => log).map((body: Log): TaggedLog => {
      return {
        kind: "Log",
        uuid: generateUuid(body.id, "Log"),
        specialStatus: SpecialStatus.SAVED,
        body
      };
    });
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
    fakeApiConfig.body.api_migrated = true;
    state.resources = buildResourceIndex([fakeApiConfig]);
    const props = mapStateToProps(state);
    expect(props.sourceFbosConfig("sequence_init_log")).toEqual({
      value: true, consistent: false
    });
  });

  it("bot source of FBOS settings", () => {
    const state = fakeState();
    state.bot.hardware.configuration.sequence_init_log = false;
    const fakeApiConfig = fakeFbosConfig();
    fakeApiConfig.body.sequence_init_log = true;
    fakeApiConfig.body.api_migrated = false;
    state.resources = buildResourceIndex([fakeApiConfig]);
    const props = mapStateToProps(state);
    expect(props.sourceFbosConfig("sequence_init_log")).toEqual({
      value: false, consistent: true
    });
  });
});
