import { RootFolderNode as Tree } from "./interfaces";
import { cloneAndClimb } from "./climb";
import { Color, SpecialStatus, TaggedSequence } from "farmbot";
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
import { stepGet, STEP_DATATRANSFER_IDENTIFER } from "../draggable/actions";
import { joinKindAndId } from "../resources/reducer_support";
import { maybeGetSequence } from "../resources/selectors";

type TreePromise = Promise<Tree>;

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

export const setFolderName = (id: number, name: string) => {
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
  parent_id: 0,
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
  const d: Function = store.dispatch;
  const folder: Folder = { ...DEFAULTS, ...config };
  const action = initSave("Folder", folder);
  // tslint:disable-next-line:no-any
  const p: Promise<{}> = d(action);
  return p;
};

export const deleteFolder = (id: number) => {
  const d: Function = store.dispatch;
  const { index } = store.getState().resources;
  const folder = findFolderById(index, id);
  const action = destroy(folder.uuid);

  return d(action) as ReturnType<typeof action>;
};

export const updateSearchTerm = (payload: string | undefined) =>
  store.dispatch({ type: Actions.FOLDER_SEARCH, payload });

export const toggleFolderOpenState = (id: number) =>
  store.dispatch({ type: Actions.FOLDER_TOGGLE, payload: { id } });

export const toggleFolderEditState = (id: number) =>
  store.dispatch({ type: Actions.FOLDER_TOGGLE_EDIT, payload: { id } });

export const toggleAll = (payload: boolean) =>
  store.dispatch({ type: Actions.FOLDER_TOGGLE_ALL, payload });

export const sequenceEditMaybeSave =
  (sequence: TaggedSequence, update: Partial<TaggedSequence["body"]>) => {
    const dispatch: Function = store.dispatch;
    dispatch(edit(sequence, update));
    if (sequence.specialStatus == SpecialStatus.SAVED) {
      dispatch(save(sequence.uuid));
    }
  };

export function moveSequence(sequenceUuid: string, folder_id: number) {
  const s = store.getState().resources.index.references[sequenceUuid];
  if (s && s.kind === "Sequence") {
    sequenceEditMaybeSave(s, { folder_id });
  }
}

export const dropSequence = (folder_id: number) =>
  (e: React.DragEvent<HTMLElement>) => {
    const key = e.dataTransfer.getData(STEP_DATATRANSFER_IDENTIFER);
    const dispatch: Function = store.dispatch;
    const dataXferObj = dispatch(stepGet(key));
    const { sequence_id } = dataXferObj.value.args;
    const ri = store.getState().resources.index;
    const seqUuid = dataXferObj.resourceUuid ||
      ri.byKindAndId[joinKindAndId("Sequence", sequence_id)];
    const sequence = maybeGetSequence(ri, seqUuid);
    if (sequence) { sequenceEditMaybeSave(sequence, { folder_id }); }
  };
