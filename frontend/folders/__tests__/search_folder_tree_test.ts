import { TEST_GRAPH } from "./actions_test";
import { searchFolderTree } from "../search_folder_tree";

describe("searchFolderTree", () => {
  const searchFor = (input: string) => searchFolderTree({
    references: {},
    input,
    root: TEST_GRAPH
  });

  it("returns an empty result set when no match is found.", () => {
    const before = JSON.stringify(TEST_GRAPH);
    const results = searchFor("foo");
    const after = JSON.stringify(TEST_GRAPH);
    expect(results).toBeTruthy();
    expect(results.length).toEqual(0);
    expect(before).toEqual(after); // Prevent mutation of original data.
  });

  it("finds an `inital` folder", () => {
    const results = searchFor("one").map(x => x.name);
    expect(results.length).toEqual(1);
    expect(results).toContain("One");
    const results2 = searchFor("Ten").map(x => x.name);
    expect(results2.length).toEqual(1);
    expect(results2).toContain("Ten");
  });

  it("finds a `medial` folder", () => {
    const results = searchFor("seven").map(x => x.name);
    [ // === DIRECT MATCH:
      "Seven",
      "Seventeen",
      // == PARENTS
      "Six",
      "Sixteen",
      // == GRANDPARENTS
      "Fourteen"
    ].map(x => expect(results).toContain(x));
    expect(results.length).toEqual(5);
    const results2 = searchFor("Eleven").map(x => x.name);
    ["Eleven", "Ten"].map(x => expect(results2).toContain(x));
    expect(results2.length).toEqual(2);
  });

  it("finds a `terminal` folder", () => {
    const results = searchFor("ighteen").map(x => x.name);
    ["Eighteen", "Sixteen", "Fourteen"].map(x => expect(results).toContain(x));
  });
});
