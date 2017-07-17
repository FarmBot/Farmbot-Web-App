import { buildResourceIndex } from "../../__test_support__/resource_index_builder";
import { findSlotByToolId } from "../selectors";
import { resourceReducer } from "../reducer";
import { Actions } from "../../constants";
import { TaggedTool, TaggedToolSlotPointer } from "../tagged_resources";
import { createOK } from "../actions";
import { generateUuid } from "../util";

const TOOL_ID = 99;
const SLOT_ID = 100;
const fakeTool: TaggedTool = {
  kind: "tools",
  uuid: generateUuid(TOOL_ID, "tools"),
  body: {
    name: "yadda yadda",
    id: TOOL_ID
  }
};
const fakeSlot: TaggedToolSlotPointer = {
  kind: "points",
  uuid: generateUuid(SLOT_ID, "points"),
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
    let state = resourceReducer(buildResourceIndex(), createOK(fakeTool));
    expect(state.index.byKindAndId["tools." + fakeTool.body.id]);
    let result = findSlotByToolId(state.index, TOOL_ID);
    expect(result).toBeFalsy();
  });

  it("returns something when there is a match", () => {
    let initialState = buildResourceIndex();
    let state = [createOK(fakeTool), createOK(fakeSlot)]
      .reduce(resourceReducer, initialState);
    let result = findSlotByToolId(state.index, TOOL_ID);
    expect(result).toBeTruthy();
    if (result) { expect(result.kind).toBe("points"); }
  });
});
