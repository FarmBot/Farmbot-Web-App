import { FolderNode } from "../constants";
import { ingest } from "../data_transfer";
import { climb } from "../climb";

const FOLDERS: FolderNode[] = [
  { id: 1, color: "blue", name: "Water stuff", parent_id: undefined },
  { id: 2, color: "green", name: "Folder for growing things", parent_id: undefined },
  { id: 3, color: "yellow", name: "subfolder", parent_id: 2 },
  { id: 4, color: "gray", name: "tests", parent_id: undefined },
  { id: 5, color: "pink", name: "deeply nested directory", parent_id: 3 }
];
const TREE = ingest({
  folders: FOLDERS,
  localMetaAttributes: {}
});

describe("climb()", () => {
  it("traverses through the nodes", () => {
    const results: string[] = [];
    climb(TREE, (node) => results.push(node.color));
    expect(results.length).toBe(FOLDERS.length);
    expect(results.sort()).toEqual(FOLDERS.map(x => x.color).sort());
  });

  it("halts a tree climb", () => {
    let count = 0;
    climb(TREE, (_node, halt) => {
      count += 1;
      if (count == 3) { halt(); }
    });
    expect(count).toEqual(3);
  });
});

describe("data transfer", () => {
  it("converts flat data into hierarchical data", () => {
    const { folders } = TREE;
    expect(folders.length).toEqual(3);
    // ├─ FOLDER FOR GROWING THINGS
    // │  └─ SUBFOLDER
    // │     └─ DEEPLY NESTED DIRECTORY
    // ├─ TESTS
    // └─ WATER STUFF

    const l0 = folders[0];

    // Level 0, first folder
    expect(l0.name).toEqual(FOLDERS[1].name);
    expect(l0.id).toEqual(FOLDERS[1].id);
    expect(l0.color).toEqual(FOLDERS[1].color);
    expect(l0.children.length).toEqual(1);

    // Level 0, second folder
    const l0_2 = l0.children[0];
    expect(l0_2.name).toEqual(FOLDERS[2].name);
    expect(l0_2.color).toEqual(FOLDERS[2].color);
    expect((l0_2.children || []).length).toEqual(1);

    // Level 0, third folder
    const l0_3 = l0_2.children[0];
    expect(l0_3.name).toEqual(FOLDERS[4].name);
    expect(l0_3.color).toEqual(FOLDERS[4].color);
    expect((l0_3.children || []).length).toEqual(0);

    // Level 1, first folder
    expect(folders[1].name).toEqual(FOLDERS[3].name);
    expect(folders[1].color).toEqual(FOLDERS[3].color);
    expect(folders[1].children.length).toEqual(0);

    // Level 2, first folder
    expect(folders[2].name).toEqual(FOLDERS[0].name);
    expect(folders[2].color).toEqual(FOLDERS[0].color);
    expect(folders[2].children.length).toEqual(0);
  });
});
