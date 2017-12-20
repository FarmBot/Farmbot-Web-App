import { mapStateToProps } from "../state_to_props";
import { fakeState } from "../../__test_support__/fake_state";
import { buildResourceIndex } from "../../__test_support__/resource_index_builder";
import { TaggedLog, SpecialStatus } from "../../resources/tagged_resources";
import { Log } from "../../interfaces";
import { generateUuid } from "../../resources/util";
import { times } from "lodash";

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
});
