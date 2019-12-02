import {
  RootFolderNode as Tree,
  FolderUnion,
  FolderNodeInitial,
  FolderNodeMedial,
  FolderNodeTerminal
} from "./constants";
import { cloneAndClimb } from "./climb";
import { Color } from "farmbot";

type TreePromise = Promise<Tree>;

const DEFAULT_NAME = "New Folder";

const initial = (name: string): FolderNodeInitial => ({
  kind: "initial",
  name,
  color: "gray",
  children: [],
  content: [],
  id: FIX_THIS_ASAP()
});

const medial = (name: string): FolderNodeMedial => ({
  kind: "medial",
  name,
  color: "gray",
  children: [],
  content: [],
  id: FIX_THIS_ASAP()
});

const terminal = (name: string): FolderNodeTerminal => ({
  kind: "terminal",
  name,
  color: "gray",
  children: [],
  content: [],
  id: FIX_THIS_ASAP()
});

export const findFolder = (tree: Tree, id: number) => {
  let result: FolderUnion | undefined;
  cloneAndClimb(tree, (node, halt) => {
    if (node.id === id) {
      result = node;
      halt();
    }
  });
  return result;
};

export const toggleFolderOpenState = (tree: Tree, id: number) => {
  return Promise.resolve(cloneAndClimb(tree, (node, halt) => {
    if (node.id === id) {
      node.open = !node.open;
      halt();
    }
  }));
};

export const expandAll = (tree: Tree) => {
  return Promise.resolve(cloneAndClimb(tree, (node) => {
    node.open = true;
  }));
};

export const collapseAll = (tree: Tree) => {
  return Promise.resolve(cloneAndClimb(tree, (node) => {
    node.open = false;
  }));
};

export const setFolderColor = (tree: Tree, id: number, color: Color) => {
  // In the real version, I will probably just do
  // an HTTP POST and re-draw the graph at response
  // time.
  return Promise.resolve(cloneAndClimb(tree, (node, halt) => {
    if (node.id == id) {
      node.color = color;
      halt();
    }
  }));
};

export const setFolderName = (tree: Tree, id: number, name: string) => {
  return Promise.resolve(cloneAndClimb(tree, (node, halt) => {
    if (node.id == id) {
      node.name = name;
      halt();
    }
  }));
};

const FIX_THIS_ASAP = () => Math.round(Math.random() * -10000000);

export const deleteFolder = (tree: Tree, _id: number) => {
  // Step one: Find parent ID. Crash if the folder is not empty.
  // Step two: Un-splice node from parent.

  return Promise.resolve(cloneAndClimb(tree, (_node, _halt) => {
    throw new Error("Work in progress.");
  }));
};

export const createFolder =
  (tree: Tree, parent_id?: number, name = DEFAULT_NAME): TreePromise => {
    console.error("This function has problems: " +
      "ID's are not real. Can't control folder order.");
    if (!parent_id) {
      return Promise.resolve({
        ...tree,
        folders: [...tree.folders, initial(name)]
      });
    }

    return Promise.resolve(cloneAndClimb(tree, (node, halt) => {

      if (node.id == parent_id) {
        switch (node.kind) {
          case "initial":
            node.children.push(medial(name));
            return halt();
          case "medial":
            node.children.push(terminal(name));
            return halt();
          case "terminal":
            throw new Error("Can't attach folders more than 3 levels deep");
        }
      }
    }));
  };

export const moveFolderItem = (_: Tree) => Promise.reject("WIP");
export const moveFolder = (_: Tree) => Promise.reject("WIP");
export const searchSequencesAndFolders = (_: Tree) => Promise.reject("WIP");
export const searchByNameOrFolder = (_: Tree) => Promise.reject("WIP");
