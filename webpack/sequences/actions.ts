import { SequenceBodyItem } from "farmbot";
import { SelectSequence } from "./interfaces";
import { edit, init, overwrite } from "../api/crud";
import { TaggedSequence } from "../resources/tagged_resources";
import { defensiveClone } from "../util";
import { push } from "../history";
import { urlFriendly } from "../util";
import { Actions } from "../constants";
import { t } from "i18next";

export function pushStep(step: SequenceBodyItem,
  dispatch: Function,
  sequence: TaggedSequence) {
  const next = defensiveClone(sequence);
  next.body.body = next.body.body || [];
  next.body.body.push(defensiveClone(step));
  dispatch(overwrite(sequence, next.body));
}

export function editCurrentSequence(dispatch: Function, seq: TaggedSequence,
  update: Partial<typeof seq.body>) {
  dispatch(edit(seq, update));
}

let count = 1;

export function copySequence(payload: TaggedSequence) {
  return function (dispatch: Function) {
    const copy = defensiveClone(payload);
    copy.body.id = undefined;
    copy.body.name = copy.body.name + t(" copy ") + (count++);
    copy.uuid = "SET_BY_REDUCER";
    dispatch(init(copy));
    push("/app/sequences/" + urlFriendly(copy.body.name));
  };
}

export function selectSequence(uuid: string): SelectSequence {
  return {
    type: Actions.SELECT_SEQUENCE,
    payload: uuid
  };
}
