import {
  RootFolderNode as Tree,
  FolderUnion,
  RootFolderNode
} from "./constants";
import { cloneAndClimb } from "./climb";
import { Color, TaggedResource, TaggedSequence } from "farmbot";
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

interface FolderSearchProps {
  references: Record<string, TaggedResource | undefined>;
  input: string;
  root: RootFolderNode;
}

const isSearchMatchSeq =
  (searchTerm: string, s?: TaggedResource): s is TaggedSequence => {
    if (s && s.kind == "Sequence") {
      const name = s.body.name.toLowerCase();
      return name.includes(searchTerm);
    } else {
      return false;
    }
  };

const isSearchMatchFolder = (searchTerm: string, f: FolderUnion) => {
  if (f.name.toLowerCase().includes(searchTerm)) {
    return true;
  }

  return false;
};

/** Given an input search term, returns folder IDs (number) and Sequence UUIDs
 * that match */
export const searchFoldersAndSequencesForTerm = (props: FolderSearchProps) => {
  // A sequence is included if:
  //   * CASE 1: The name is a search match
  //   * CASE 2: The containing folder is a search match.

  // A folder is included if:
  //   * CASE 3: The name is a search match
  //   * CASE 4: It contains a sequence that is a match.
  //   * CASE 5: It has a child that has a search match.

  const searchTerm = props.input.toLowerCase();
  const sequenceSet = new Set<string>();
  const folderSet = new Set<FolderUnion>();

  props.root.folders.map(level1 => {
    level1.content.map(level1Sequence => { // ========= Level 1
      if (isSearchMatchSeq(searchTerm, props.references[level1Sequence])) {
        // CASE 1:
        sequenceSet.add(level1Sequence);
        // CASE 4:
        folderSet.add(level1);
      }
    });

    if (isSearchMatchFolder(searchTerm, level1)) {
      // CASE 2
      level1.content.map(uuid => sequenceSet.add(uuid));
      // CASE 3
      folderSet.add(level1);
    }

    level1.children.map(level2 => { // ================ LEVEL 2
      if (isSearchMatchFolder(searchTerm, level2)) {
        // CASE 2
        level2.content.map(uuid => sequenceSet.add(uuid));
        // CASE 3
        folderSet.add(level2);
        // CASE 5
        folderSet.add(level1);
      }

      level2.content.map(level2Sequence => {
        if (isSearchMatchSeq(searchTerm, props.references[level2Sequence])) {
          // CASE 1:
          sequenceSet.add(level2Sequence);
          // CASE 4:
          folderSet.add(level2);
          // CASE 5
          folderSet.add(level1);
        }
      });
      level2.children.map(level3 => { // ============== LEVEL 3
        if (isSearchMatchFolder(searchTerm, level3)) {
          // CASE 2
          level3.content.map(uuid => sequenceSet.add(uuid));
          // CASE 3
          folderSet.add(level3);
          // CASE 5
          folderSet.add(level2);
          // CASE 5
          folderSet.add(level1);
        }
        level3.content.map(level3Sequence => {
          if (isSearchMatchSeq(searchTerm, props.references[level3Sequence])) {
            // CASE 1:
            sequenceSet.add(level3Sequence);
            // CASE 3
            folderSet.add(level3);
            // CASE 5
            folderSet.add(level2);
            // CASE 5
            folderSet.add(level1);
          }
        });
      });
    });
  });

  return Array.from(folderSet);
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
