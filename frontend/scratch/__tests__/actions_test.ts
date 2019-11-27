import { FolderNode } from "../constants";
import { ingest } from "../data_transfer";
import { findFolder, toggleFolderOpenState } from "../actions";
import { times, sample } from "lodash";
// Folder structure used in tests:
// ├─ One
// ├─ Two
// │  └─ Three
// ├─ Four
// │  └─ Five
// ├─ Six
// │  └─ Seven
// │     ├─ Eight
// │     └─ Nine
// ├─ Ten
// │  ├─ Eleven
// │  └─ Twelve
// │     └─ Thirteen
// └─ Fourteen
//    ├─ Fifteen
//    └─ Sixteen
//       ├─ Seventeen
//       └─ Eighteen
const FOLDERS: FolderNode[] = [
  { id: 1, parent_id: undefined, color: "blue", name: "One" },
  { id: 2, parent_id: undefined, color: "blue", name: "Two" },
  { id: 3, parent_id: 2, color: "blue", name: "Three" },
  { id: 4, parent_id: undefined, color: "blue", name: "Four" },
  { id: 5, parent_id: 4, color: "blue", name: "Five" },
  { id: 6, parent_id: undefined, color: "blue", name: "Six" },
  { id: 7, parent_id: 6, color: "blue", name: "Seven" },
  { id: 8, parent_id: 7, color: "blue", name: "Eight" },
  { id: 9, parent_id: 7, color: "blue", name: "Nine" },
  { id: 10, parent_id: undefined, color: "blue", name: "Ten" },
  { id: 11, parent_id: 10, color: "blue", name: "Eleven" },
  { id: 12, parent_id: 10, color: "blue", name: "Twelve" },
  { id: 13, parent_id: 12, color: "blue", name: "Thirteen" },
  { id: 14, parent_id: undefined, color: "blue", name: "Fourteen" },
  { id: 15, parent_id: 14, color: "blue", name: "Fifteen" },
  { id: 16, parent_id: 14, color: "blue", name: "Sixteen" },
  { id: 17, parent_id: 16, color: "blue", name: "Seventeen" },
  { id: 18, parent_id: 16, color: "blue", name: "Eighteen" }
];

const GRAPH = ingest(FOLDERS);

describe("toggleFolderOpenState", () => {
  it("toggles the `open` value of a folder", () => {
    times(10, async () => {
      const node = sample(FOLDERS);
      if (!node) {
        throw new Error("Impossible");
      }
      const { id } = node;
      const before = findFolder(GRAPH, id);
      const nextGraph = await toggleFolderOpenState(GRAPH, id);
      const after = findFolder(nextGraph, id);
      if (before && after) {
        expect(after.open).toEqual(!before.open);
      } else {
        fail("Could not find ID.");
      }
    });
  });
});
