import { fakePoint } from "../../__test_support__/fake_state/resources";
import { buildResourceIndex } from "../../__test_support__/resource_index_builder";
import { findAll } from "../find_all";

describe("findAll()", () => {
  it("returns all", () => {
    const point = fakePoint();
    expect(findAll(buildResourceIndex([point]).index, "Tool")).toEqual([]);
  });
});
