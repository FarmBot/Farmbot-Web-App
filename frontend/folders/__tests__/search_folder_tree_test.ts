import { TEST_GRAPH } from "./actions_test";
import { searchFolderTree } from "../search_folder_tree";

describe("searchFolderTree", () => {
  it("Reutrns an empty result set when no match is found.", () => {
    const before = JSON.stringify(TEST_GRAPH);
    const results = searchFolderTree({
      references: {},
      input: "foo",
      root: TEST_GRAPH
    });
    const after = JSON.stringify(TEST_GRAPH);
    expect(results).toBeTruthy();
    expect(results.length).toEqual(0);
    expect(before).toEqual(after); // Prevent mutation of original data.
  });
});
