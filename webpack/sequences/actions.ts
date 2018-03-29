import { CeleryNode as Step, SequenceBodyItem } from "farmbot";
import { ChangeStepSelect, SelectSequence } from "./interfaces";
import { DropDownItem } from "../ui/index";
import { edit, init, overwrite } from "../api/crud";
import { TaggedSequence } from "../resources/tagged_resources";
import { defensiveClone } from "../util";
import { push } from "../history";
import { urlFriendly } from "../util";

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
    copy.body.name = copy.body.name + ` copy ${count++}`;
    copy.uuid = "HEY REDUCER! Set this!";
    dispatch(init(copy));
    push("/app/sequences/" + urlFriendly(copy.body.name));
  };
}

export function moveStep(step: Step,
  from: number,
  to: number) {
  return function () {
    return {
      type: "MOVE_STEP",
      payload: { step, from, to }
    };
  };
}

export function changeStepSelect(
  value: string | number,
  index: number,
  field: string): ChangeStepSelect {
  return {
    type: "CHANGE_STEP_SELECT",
    payload: { value, index, field }
  };
}

export function changeMoveAbsStepSelect(
  index: number,
  tool: DropDownItem,
  step: Step) {
  return {
    type: "CHANGE_MOVE_ABS_STEP_SELECT",
    payload: { index, tool, step }
  };
}

// Would be nice to factor this down to fit with CHANGE_STEP
export function changeMoveAbsStepValue(value: string,
  kind: string,
  index: number) {
  return {
    type: "CHANGE_MOVE_ABS_STEP_VALUE",
    payload: { value, kind, index }
  };
}

export function updateSubSequence(
  value: string | number,
  index: number,
  field: string, type: string): ChangeStepSelect {
  return {
    type: "UPDATE_SUB_SEQUENCE",
    payload: { value, index, field, type }
  };
}

export function selectSequence(uuid: string): SelectSequence {
  return {
    type: "SELECT_SEQUENCE",
    payload: uuid
  };
}

export function addComment(_: Step, index: number, comment: string) {
  return {
    type: "ADD_COMMENT",
    payload: { comment, index }
  };
}
