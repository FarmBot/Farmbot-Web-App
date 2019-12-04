import {
  RootFolderNode as Tree,
  FolderUnion,
  FolderNodeMedial
} from "./constants";
import { cloneAndClimb } from "./climb";
import { Color } from "farmbot";
import { store } from "../redux/store";
import { initSave } from "../api/crud";
import { Folder } from "farmbot/dist/resources/api_resources";
import { DeepPartial } from "redux";

type TreePromise = Promise<Tree>;

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

export const toggleFolderOpenState =
  (tree: Tree, id: number): TreePromise => {
    return Promise.resolve(cloneAndClimb(tree, (node, halt) => {
      if (node.id === id) {
        node.open = !node.open;
        halt();
      }
    }));
  };

export const expandAll =
  (tree: Tree): TreePromise => {
    return Promise.resolve(cloneAndClimb(tree, (node) => {
      node.open = true;
    }));
  };

export const collapseAll = (tree: Tree): TreePromise => {
  return Promise.resolve(cloneAndClimb(tree, (node) => {
    node.open = false;
  }));
};

export const setFolderColor =
  (tree: Tree, id: number, color: Color): TreePromise => {
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

export const setFolderName =
  (tree: Tree, id: number, name: string): TreePromise => {
    return Promise.resolve(cloneAndClimb(tree, (node, halt) => {
      if (node.id == id) {
        node.name = name;
        halt();
      }
    }));
  };

const DEFAULTS: Folder = {
  name: "New Folder",
  color: "gray",
  // tslint:disable-next-line:no-null-keyword
  parent_id: null as unknown as undefined,
};

export const createFolder = (config: DeepPartial<Folder> = {}) => {
  const folder: Folder = { ...DEFAULTS, ...config };
  const action = initSave("Folder", folder);
  // tslint:disable-next-line:no-any
  const p: Promise<{}> = store.dispatch(action as any);
  return p;
};

export const deleteFolder = (tree: Tree, _id: number): TreePromise => {
  return Promise.resolve(cloneAndClimb(tree, (parent) => {
    switch (parent.kind) {
      case "initial":
        const index: Record<number, FolderNodeMedial> = {};
        parent.children.map(x => {
          index[x.id] = x;
        });
        return;
      case "medial":
        // parent.children.map(x => { });
        throw new Error("WIP");
      case "terminal":
        return;
    }
  }));
};

export const moveFolderItem = (_: Tree) => Promise.reject("WIP");
export const moveFolder = (_: Tree) => Promise.reject("WIP");
export const searchSequencesAndFolders = (_: Tree) => Promise.reject("WIP");
export const searchByNameOrFolder = (_: Tree) => Promise.reject("WIP");
