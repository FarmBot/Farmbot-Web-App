import {
  RootFolderNode as Tree,
  FolderUnion
} from "./constants";
import { cloneAndClimb } from "./climb";
import { Color } from "farmbot";

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
  return Promise.resolve(cloneAndClimb(tree, (node) => {
    if (node.id == id) {
      node.color = color;
    }
  }));
};

export const setFolderName = (tree: Tree, id: number, name: string) => {
  return Promise.resolve(cloneAndClimb(tree, (node) => {
    if (node.id == id) {
      node.name = name;
    }
  }));
};

export const createFolder = (_: Tree) => Promise.reject("WIP");
export const deleteFolder = (_: Tree) => Promise.reject("WIP");
export const moveFolderItem = (_: Tree) => Promise.reject("WIP");
export const moveFolder = (_: Tree) => Promise.reject("WIP");
export const searchSequencesAndFolders = (_: Tree) => Promise.reject("WIP");
export const searchByNameOrFolder = (_: Tree) => Promise.reject("WIP");
