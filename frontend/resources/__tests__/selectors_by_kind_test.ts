import { findTool } from "../selectors_by_kind";
import { buildResourceIndex } from "../../__test_support__/resource_index_builder";
import { error } from "../../toast/toast";

describe("findTool()", () => {
  it("throws error", () => {
    expect(() => findTool(buildResourceIndex([]).index, "Tool.uuid"))
      .toThrow("Tagged resource Tool was not found or malformed: undefined");
    expect(error).toHaveBeenCalledWith("Resource error");
  });
});
