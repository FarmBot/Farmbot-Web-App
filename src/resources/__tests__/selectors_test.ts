import { buildResourceIndex } from "../../__test_support__/resource_index_builder";
import { findSlotByToolId } from "../selectors";
import { resourceReducer } from "../reducer";
import { Actions } from "../../constants";
import { init } from "../../api/crud";
import { TaggedTool } from "../tagged_resources";
import { createOK } from "../actions";
import { generateUuid } from "../util";

describe("findSlotByToolId", () => {
  it("returns undefined when not found", () => {
    const ID = 99;
    let fakeTool: TaggedTool = {
      kind: "tools",
      uuid: generateUuid(ID, "tools"),
      body: {
        name: "yadda yadda",
        id: ID
      }
    };
    let state = resourceReducer(buildResourceIndex(), createOK(fakeTool));
    expect(state.index.byKindAndId["tools." + fakeTool.body.id]);
    let result = findSlotByToolId(state.index, ID);
    expect(result).toBeFalsy();
  });
});
