import {
  RootFolderNode as Tree
} from "./constants";

export const toggleFolderState = (_: Tree, _id: number) => {
  return Promise.resolve(_);
};
export const expandAll = (_: Tree) => Promise.reject("WIP");
export const collapseAll = (_: Tree) => Promise.reject("WIP");
export const setFolderColor = (_: Tree) => Promise.reject("WIP");
export const setFolderName = (_: Tree) => Promise.reject("WIP");
export const createFolder = (_: Tree) => Promise.reject("WIP");
export const deleteFolder = (_: Tree) => Promise.reject("WIP");
export const moveFolderItem = (_: Tree) => Promise.reject("WIP");
export const moveFolder = (_: Tree) => Promise.reject("WIP");
export const searchSequencesAndFolders = (_: Tree) => Promise.reject("WIP");
export const searchByNameOrFolder = (_: Tree) => Promise.reject("WIP");
