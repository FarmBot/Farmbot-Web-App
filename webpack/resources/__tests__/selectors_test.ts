import { buildResourceIndex } from "../../__test_support__/resource_index_builder";
import { findSlotByToolId, getFeeds, selectAllLogs } from "../selectors";
import { resourceReducer, emptyState } from "../reducer";
import { TaggedTool, TaggedToolSlotPointer, SpecialStatus } from "../tagged_resources";
import { createOK } from "../actions";
import { generateUuid } from "../util";
import { fakeWebcamFeed } from "../../__test_support__/fake_state/resources";
import { Actions } from "../../constants";
import * as _ from "lodash";

const TOOL_ID = 99;
const SLOT_ID = 100;
const fakeTool: TaggedTool = {
  kind: "Tool",
  specialStatus: SpecialStatus.SAVED,
  uuid: generateUuid(TOOL_ID, "Tool"),
  body: {
    name: "yadda yadda",
    id: TOOL_ID
  }
};
const fakeSlot: TaggedToolSlotPointer = {
  kind: "Point",
  specialStatus: SpecialStatus.SAVED,
  uuid: generateUuid(SLOT_ID, "Point"),
  body: {
    tool_id: TOOL_ID,
    pointer_type: "ToolSlot",
    radius: 0,
    x: 0,
    y: 0,
    z: 0,
    name: "wow",
    pointer_id: SLOT_ID,
    meta: {}
  }
};

describe("findSlotByToolId", () => {
  it("returns undefined when not found", () => {
    const state = resourceReducer(buildResourceIndex(), createOK(fakeTool));
    expect(state.index.byKindAndId["Tool." + fakeTool.body.id]);
    const result = findSlotByToolId(state.index, TOOL_ID);
    expect(result).toBeFalsy();
  });

  it("returns something when there is a match", () => {
    const initialState = buildResourceIndex();
    const state = [createOK(fakeTool), createOK(fakeSlot)]
      .reduce(resourceReducer, initialState);
    const result = findSlotByToolId(state.index, TOOL_ID);
    expect(result).toBeTruthy();
    if (result) { expect(result.kind).toBe("Point"); }
  });
});

describe("getFeeds", () => {
  it("returns empty array", () => {
    expect(getFeeds(emptyState().index).length).toBe(0);
  });

  it("finds the only WebcamFeed", () => {
    const feed = fakeWebcamFeed();
    const state = [{
      type: Actions.RESOURCE_READY,
      payload: {
        name: "WebcamFeed",
        data: feed
      }
    }].reduce(resourceReducer, emptyState());
    expect(getFeeds(state.index)[0].body).toEqual(feed);
  });
});

describe("selectAllLogs", () => {
  it("stays truthful to its name by finding all logs", () => {
    const results = selectAllLogs(buildResourceIndex().index);
    expect(results.length).toBeGreaterThan(0);
    const kinds = _(results).map("kind").uniq().value();
    expect(kinds.length).toEqual(1);
    expect(kinds[0]).toEqual("Log");
  });
});
