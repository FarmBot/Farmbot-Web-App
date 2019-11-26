import { FolderNode } from "../constants";
import { ingest } from "../data_transfer";

// const MOCKUP_SEQUENCES: Record<number, string> = {
//   1: "Another sequence",
//   2: "Some random sequence",
//   3: "Planting seeds",
//   4: "Purple rain",
//   5: "Make it rain",
// };

const FOLDERS: FolderNode[] = [
  { id: 1, color: "blue", name: "Water stuff", parent_id: undefined },
  { id: 2, color: "green", name: "Folder for growing things", parent_id: undefined },
  { id: 3, color: "yellow", name: "subfolder", parent_id: 2 },
  { id: 4, color: "gray", name: "tests", parent_id: undefined },
  { id: 5, color: "pink", name: "deeply nested directory", parent_id: 3 }
];

describe("data transfer", () => {
  it("converts flat data into hierarchical data", () => {
    const x = ingest(FOLDERS);
    const { folders } = x;
    expect(folders.length).toEqual(3);
    const names = folders.map(x => x.name);
    ["Water stuff", "Folder for growing things", "tests"].map(name => {
      expect(names).toContain(name);
    });
    fail("Next task: Populate `medial` and `terminal` nodes.");
  });
});
