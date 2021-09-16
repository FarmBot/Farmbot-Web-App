import { indexByToolId } from "../selectors_for_indexing";
import { buildResourceIndex } from "../../__test_support__/resource_index_builder";
import { fakeTool } from "../../__test_support__/fake_state/resources";

describe("indexByToolId()", () => {
  it("returns empty output", () => {
    const tool = fakeTool();
    tool.body.id = 0;
    expect(indexByToolId(buildResourceIndex([tool]).index)).toEqual({});
  });
});
