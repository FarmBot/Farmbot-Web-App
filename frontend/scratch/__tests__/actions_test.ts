import { FolderNode, FolderUnion } from "../constants";
import { ingest } from "../data_transfer";
import {
  collapseAll,
  expandAll,
  findFolder,
  setFolderColor,
  setFolderName,
  toggleFolderOpenState,
  createFolder,
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

describe("creation of folders", () => {
  it("adds a folder to folder root", async () => {
    const name = "~ Folder Name ~";
    const nextGraph = await createFolder(GRAPH, undefined, name);
    expect(nextGraph.folders.map(x => x.name)).toContain(name);
  });

  it("adds a folder to an initial node", async () => {
    const name = "~ Folder Name ~";
    const nextGraph = await createFolder(GRAPH, 6, name);
    let target: FolderUnion | undefined;
    climb(nextGraph, (node) => {
      if (node.id == 6) { target = node; }
    });

    if (target && target.kind === "initial") {
      const folders = target.children;
      const names = folders.map((x) => { return x.name; });
      expect(names).toContain(name);
    } else {
      fail("Wrong target?");
    }
  });

  it("adds a folder to a medial node", () => {
    pending();
  });

  test.todo("does not add a folder to terminal node");
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
