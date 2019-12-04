import { FolderNode } from "../constants";
import { ingest } from "../data_transfer";
import {
  collapseAll,
  expandAll,
  findFolder,
  setFolderColor,
  setFolderName,
  toggleFolderOpenState,
  deleteFolder,
} from "../actions";
import { times, sample } from "lodash";
import { cloneAndClimb, climb } from "../climb";

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

const randomNode = () => {
  const node = sample(FOLDERS);
  if (!node) {
    throw new Error("Never");
  }
  return node;
};

describe("deletion of folders", () => {
  it("deletes empty folders", async () => {
    const id = sample([1, 3, 5, 8, 9, 11, 13, 17, 18]);
    if (!id) {
      throw new Error("Never");
    }
    const nextGraph = await deleteFolder(GRAPH, id);
    const names: string[] = [];
    climb(nextGraph, (node) => {
      if (node.id === id) {
        fail(`Failed to delete Node #${id} (${node.name})`);
      } else {
        names.push(node.name);
      }
    });
    expect(names.length).toEqual(FOLDERS.length - 1);
  });

  test.todo("can't delete populated folders");
});

describe("setting of color, name", () => {
  it("sets the color", async () => {
    const node = randomNode();
    const nextFolder = await setFolderColor(GRAPH, node.id, "green");
    expect(findFolder(nextFolder, node.id)?.color).toEqual("green");
  });

  it("sets the name of a folder", async () => {
    const node = randomNode();
    const nextFolder = await setFolderName(GRAPH, node.id, "blah");
    expect(findFolder(nextFolder, node.id)?.name).toEqual("blah");
  });
});

describe("expand/collapse all", () => {
  const halfOpen = cloneAndClimb(GRAPH, (node) => {
    node.open = !sample([true, false]);
  });

  it("expands all folders", async () => {
    const open = await expandAll(halfOpen);
    climb(open, (node) => {
      expect(node.open).toBe(true);
    });
  });

  it("collapses all folders", async () => {
    const closed = await collapseAll(halfOpen);
    climb(closed, (node) => {
      expect(node.open).toBe(false);
    });
  });
});

describe("toggleFolderOpenState", () => {
  it("toggles the `open` value of a folder", () => {
    times(3, async () => {
      const node = randomNode();
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
