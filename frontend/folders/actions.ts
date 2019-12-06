import {
  RootFolderNode as Tree,
  FolderUnion
} from "./constants";
import { cloneAndClimb } from "./climb";
import { Color } from "farmbot";
import { store } from "../redux/store";
import { initSave, destroy, edit, save } from "../api/crud";
import { Folder } from "farmbot/dist/resources/api_resources";
import { DeepPartial } from "redux";
import { findFolderById } from "../resources/selectors_by_id";
import { Actions } from "../constants";

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
  (id: number, name: string) => {
    const { index } = store.getState().resources;
    const folder = findFolderById(index, id);
    const action = edit(folder, { name });
    store.dispatch(action);
    // tslint:disable-next-line:no-any
    return store.dispatch(save(folder.uuid) as any) as Promise<{}>;
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

export const deleteFolder = (id: number) => {
  const { index } = store.getState().resources;
  const folder = findFolderById(index, id);
  const action = destroy(folder.uuid);
  // tslint:disable-next-line:no-any
  return store.dispatch(action as any) as ReturnType<typeof action>;
};

export const moveFolderItem = (_: Tree) => Promise.reject("WIP");
export const moveFolder = (_: Tree) => Promise.reject("WIP");

export const updateSearchTerm = (payload: string | undefined) => {
  store.dispatch({
    type: Actions.FOLDER_SEARCH,
    payload
  });
};

export const toggleFolderOpenState = (id: number) => Promise
  .resolve(store.dispatch({ type: Actions.FOLDER_TOGGLE, payload: { id } }));

export const toggleFolderEditState = (id: number) => Promise
  .resolve(store.dispatch({
    type: Actions.FOLDER_TOGGLE_EDIT,
    payload: { id }
  }));

export const toggleAll = (payload: boolean) => Promise
  .resolve(store.dispatch({ type: Actions.FOLDER_TOGGLE_ALL, payload }));

