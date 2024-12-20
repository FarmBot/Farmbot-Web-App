import axios from "axios";
import { t } from "../i18next_wrapper";
import { SequenceBodyItem, TaggedSequence } from "farmbot";
import { SelectSequence } from "./interfaces";
import { edit, init, overwrite } from "../api/crud";
import {
  AxiosErrorResponse, defensiveClone, prettyPrintApiErrors, urlFriendly,
} from "../util";
import { Actions } from "../constants";
import { setActiveSequenceByName } from "./set_active_sequence_by_name";
import { isNumber } from "lodash";
import { error, success } from "../toast/toast";
import { API } from "../api";
import { Path } from "../internal_urls";
import { GetState } from "../redux/interfaces";
import { selectAllSequences } from "../resources/selectors_by_kind";
import { ResourceIndex } from "../resources/interfaces";
import { getDeviceAccountSettings } from "../resources/selectors";
import { store } from "../redux/store";
import { NavigateFunction } from "react-router";

export const sequenceLengthExceeded = (sequence: TaggedSequence): boolean => {
  const device = getDeviceAccountSettings(store.getState().resources.index);
  const max = device.body.max_sequence_length || 30;
  if ((sequence.body.body || []).length >= max) {
    error(t("The maximum number of steps allowed in one sequence is {{ num }}.",
      { num: max }) + " "
      + t("Consider moving steps into subsequences."));
    return true;
  }
  return false;
};

export function pushStep(step: SequenceBodyItem,
  dispatch: Function,
  sequence: TaggedSequence,
  index?: number | undefined) {
  if (sequenceLengthExceeded(sequence)) {
    return;
  }
  const next = defensiveClone(sequence);
  next.body.body = next.body.body || [];
  next.body.body.splice(isNumber(index) ? index : Infinity, 0,
    defensiveClone(step));
  dispatch(overwrite(sequence, next.body));
}

export function editCurrentSequence(dispatch: Function, seq: TaggedSequence,
  update: Partial<typeof seq.body>) {
  dispatch(edit(seq, update));
}

export const sequenceLimitExceeded = (ri: ResourceIndex): boolean => {
  const sequences = selectAllSequences(ri);
  const device = getDeviceAccountSettings(ri);
  const max = device.body.max_sequence_count || 75;
  if (sequences.length >= max) {
    error(t("The maximum number of sequences allowed is {{ num }}.", { num: max }));
    return true;
  }
  return false;
};

let count = 1;

export const copySequence = (
  navigate: NavigateFunction,
  payload: TaggedSequence,
) =>
  (dispatch: Function, getState: GetState) => {
    const ri = getState().resources.index;
    if (sequenceLimitExceeded(ri)) {
      return;
    }
    const copy = defensiveClone(payload);
    copy.body.id = undefined;
    copy.body.name = copy.body.name + t(" copy ") + (count++);
    dispatch(init(copy.kind, copy.body));
    navigate(Path.sequences(urlFriendly(copy.body.name)));
    setActiveSequenceByName();
  };

export const pinSequenceToggle = (sequence: TaggedSequence) =>
  (dispatch: Function) => {
    const pinned = sequence.body.pinned;
    editCurrentSequence(dispatch, sequence, { pinned: !pinned });
  };

export function selectSequence(uuid: string): SelectSequence {
  return {
    type: Actions.SELECT_SEQUENCE,
    payload: uuid
  };
}

export const unselectSequence = (navigate: NavigateFunction) => {
  navigate(Path.sequences());
  return { type: Actions.SELECT_SEQUENCE, payload: undefined };
};

export const closeCommandMenu = () => ({
  type: Actions.SET_SEQUENCE_STEP_POSITION,
  payload: undefined,
});

export const publishSequence = (id: number | undefined, copyright: string) => () =>
  axios.post(`${API.current.sequencesPath}${id}/publish`, { copyright })
    .then(() => { },
      (err: AxiosErrorResponse) =>
        error(prettyPrintApiErrors(err), { title: t("Publish error") }));

export const unpublishSequence = (id: number | undefined) => () =>
  axios.post(`${API.current.sequencesPath}${id}/unpublish`)
    .then(() => { },
      (err: AxiosErrorResponse) =>
        error(prettyPrintApiErrors(err), { title: t("Unpublish error") }));

export const installSequence = (id: number | undefined) => () =>
  axios.post(`${API.current.sequencesPath}${id}/install`)
    .then(() => { },
      (err: AxiosErrorResponse) =>
        error(prettyPrintApiErrors(err), { title: t("Install error") }));

export const upgradeSequence = (
  id: number | undefined,
  sequenceVersionId: number | undefined,
) =>
  () => {
    axios.post(`${API.current.sequencesPath}${id}/upgrade/${sequenceVersionId}`)
      .then(() => success(t("Sequence upgraded.")),
        (err: AxiosErrorResponse) =>
          error(prettyPrintApiErrors(err), { title: t("Upgrade error") }));
  };
