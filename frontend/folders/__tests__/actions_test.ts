import { FolderNode } from "../constants";
import { ingest } from "../data_transfer";
import { collapseAll } from "../actions";
import { sample } from "lodash";
import { cloneAndClimb, climb } from "../climb";

/** A set of fake Folder resources used exclusively for testing purposes.
 ```
   ├─ One
   ├─ Two
   │  └─ Three
   ├─ Four
   │  └─ Five
   ├─ Six
   │  └─ Seven
   │     ├─ Eight
   │     └─ Nine
   ├─ Ten
   │  ├─ Eleven
   │  └─ Twelve
   │     └─ Thirteen
   └─ Fourteen
      ├─ Fifteen
      └─ Sixteen
         ├─ Seventeen
         └─ Eighteen
  ``` */
const TEST_FOLDERS: FolderNode[] = [
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

/**
  ```
   ├─ One
   ├─ Two
   │  └─ Three
   ├─ Four
   │  └─ Five
   ├─ Six
   │  └─ Seven
   │     ├─ Eight
   │     └─ Nine
   ├─ Ten
   │  ├─ Eleven
   │  └─ Twelve
   │     └─ Thirteen
   └─ Fourteen
      ├─ Fifteen
      └─ Sixteen
         ├─ Seventeen
         └─ Eighteen
  ```
 */
export const TEST_GRAPH = ingest({
  folders: TEST_FOLDERS,
  localMetaAttributes: {
    [1]: { editing: false, open: true, sequences: ["childOfFolder1"] },
    [2]: { editing: false, open: true, sequences: ["childOfFolder2"] },
    [3]: { editing: false, open: true, sequences: ["childOfFolder3"] },
    [4]: { editing: false, open: true, sequences: ["childOfFolder4"] },
    [5]: { editing: false, open: true, sequences: ["childOfFolder5"] },
    [6]: { editing: false, open: true, sequences: ["childOfFolder6"] },
    [7]: { editing: false, open: true, sequences: ["childOfFolder7"] },
    [8]: { editing: false, open: true, sequences: ["childOfFolder8"] },
    [9]: { editing: false, open: true, sequences: ["childOfFolder9"] },
    [10]: { editing: false, open: true, sequences: ["childOfFolder10"] },
    [11]: { editing: false, open: true, sequences: ["childOfFolder11"] },
    [12]: { editing: false, open: true, sequences: ["childOfFolder12"] },
    [13]: { editing: false, open: true, sequences: ["childOfFolder13"] },
    [14]: { editing: false, open: true, sequences: ["childOfFolder14"] },
    [15]: { editing: false, open: true, sequences: ["childOfFolder15"] },
    [16]: { editing: false, open: true, sequences: ["childOfFolder16"] },
    [17]: { editing: false, open: true, sequences: ["childOfFolder17"] },
    [18]: { editing: false, open: true, sequences: ["childOfFolder18"] },
  }
});

describe("deletion of folders", () => {
  test.todo("can't delete populated folders");
});

describe("expand/collapse all", () => {
  const halfOpen = cloneAndClimb(TEST_GRAPH, (node) => {
    node.open = !sample([true, false]);
  });

  it("collapses all folders", async () => {
    const closed = await collapseAll(halfOpen);
    climb(closed, (node) => {
      expect(node.open).toBe(false);
    });
  });
});
