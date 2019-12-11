import {
  RootFolderNode as Tree,
  FolderUnion
} from "./constants";
import { cloneAndClimb } from "./climb";
import { Color } from "farmbot";
import { store } from "../redux/store";
import { initSave, destroy, edit, save, init } from "../api/crud";
import { Folder } from "farmbot/dist/resources/api_resources";
import { DeepPartial } from "redux";
import { findFolderById } from "../resources/selectors_by_id";
import { Actions } from "../constants";
import { t } from "../i18next_wrapper";
import { push } from "../history";
import { urlFriendly } from "../util";
import { setActiveSequenceByName } from "../sequences/set_active_sequence_by_name";

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

export const setFolderColor = (id: number, color: Color) => {
  const d = store.dispatch as Function;
  const f = findFolderById(store.getState().resources.index, id);

  d(edit(f, { color }));
  d(save(f.uuid));
};

export const setFolderName =
  (id: number, name: string) => {
    const d = store.dispatch as Function;
    const { index } = store.getState().resources;
    const folder = findFolderById(index, id);
    const action = edit(folder, { name });
    d(action);
    return d(save(folder.uuid)) as Promise<{}>;
  };

const DEFAULTS: Folder = {
  name: "New Folder",
  color: "gray",
  // tslint:disable-next-line:no-null-keyword
  parent_id: null as unknown as undefined,
};

export const addNewSequenceToFolder = (folder_id?: number) => {
  const uuidMap = store.getState().resources.index.byKind["Sequence"];
  const seqCount = Object.keys(uuidMap).length;
  const newSequence = {
    name: t("new sequence {{ num }}", { num: seqCount }),
    args: {
      version: -999,
      locals: { kind: "scope_declaration", args: {} },
    },
    color: "gray",
    folder_id,
    kind: "sequence",
    body: []
  };
  store.dispatch(init("Sequence", newSequence));
  push("/app/sequences/" + urlFriendly(newSequence.name));
  setActiveSequenceByName();
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

export function moveSequence(sequenceUuid: string, folder_id: number) {
  const d = store.dispatch as Function;
  const s = store.getState().resources.index.references[sequenceUuid];
  if (s && s.kind === "Sequence") {
    d(edit(s, { folder_id }));
    d(save(sequenceUuid));
  } else {
    throw new Error("Blooper");
  }
}
