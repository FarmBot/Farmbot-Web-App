import { Color, SpecialStatus, TaggedSequence } from "farmbot";
import { store } from "../redux/store";
import { initSave, destroy, edit, save, init } from "../api/crud";
import { Folder } from "farmbot/dist/resources/api_resources";
import { DeepPartial } from "../redux/interfaces";
import { findFolderById } from "../resources/selectors_by_id";
import { Actions } from "../constants";
import { t } from "../i18next_wrapper";
import { urlFriendly } from "../util";
import { setActiveSequenceByName } from "../sequences/set_active_sequence_by_name";
import { stepGet, STEP_DATATRANSFER_IDENTIFIER } from "../draggable/actions";
import { joinKindAndId } from "../resources/reducer_support";
import { maybeGetSequence } from "../resources/selectors";
import { Path } from "../internal_urls";
import { UnknownAction } from "redux";
import { sequenceLimitExceeded } from "../sequences/actions";
import { NavigateFunction } from "react-router";

export const setFolderColor = (id: number, color: Color) => {
  const d = store.dispatch as Function;
  const f = findFolderById(store.getState().resources.index, id);

  d(edit(f, { color }));
  d(save(f.uuid));
};

export const setFolderName = (id: number, folderName: string) => {
  const d = store.dispatch as Function;
  const { index } = store.getState().resources;
  const folder = findFolderById(index, id);
  const action = edit(folder, { name: folderName });
  d(action);
  return d(save(folder.uuid)) as Promise<{}>;
};

const DEFAULTS = (): Folder => ({
  name: t("New Folder"),
  color: "gray",
  parent_id: 0,
});

export const addNewSequenceToFolder = (
  navigate: NavigateFunction,
  config: DeepPartial<Folder> = {},
) => {
  const ri = store.getState().resources.index;
  if (sequenceLimitExceeded(ri)) {
    return;
  }
  const uuidMap = ri.byKind["Sequence"];
  const seqCount = Object.keys(uuidMap).length;
  const newSequence = {
    name: t("New Sequence {{ num }}", { num: seqCount }),
    args: {
      version: -999,
      locals: { kind: "scope_declaration", args: {} },
    },
    color: config.color || "gray",
    folder_id: config.id,
    kind: "sequence",
    body: [],
  };
  store.dispatch(init("Sequence", newSequence) as unknown as UnknownAction);
  navigate(Path.sequences(urlFriendly(newSequence.name)));
  setActiveSequenceByName();
};

export const createFolder = (config: DeepPartial<Folder> = {}) => {
  const d: Function = store.dispatch;
  const folder: Folder = { ...DEFAULTS(), ...config };
  const action = initSave("Folder", folder);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
    const key = e.dataTransfer.getData(STEP_DATATRANSFER_IDENTIFIER);
    const dispatch: Function = store.dispatch;
    const dataXferObj = dispatch(stepGet(key));
    const { sequence_id } = dataXferObj.value.args;
    const ri = store.getState().resources.index;
    const seqUuid = dataXferObj.resourceUuid as string | undefined ||
      ri.byKindAndId[joinKindAndId("Sequence", sequence_id as number | undefined)];
    const sequence = maybeGetSequence(ri, seqUuid);
    if (sequence) { sequenceEditMaybeSave(sequence, { folder_id }); }
  };
