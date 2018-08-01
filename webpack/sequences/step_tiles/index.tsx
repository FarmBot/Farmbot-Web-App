import * as React from "react";
import { SequenceBodyItem as Step } from "farmbot";
import { FLOAT_NUMERIC_FIELDS, NUMERIC_FIELDS } from "../interfaces";
import { ExecuteBlock } from "./tile_execute";
import { StepParams, StepInputProps, StepTitleBarProps } from "../interfaces";
import { defensiveClone, move as arrayMover } from "../../util";
import { TileIf } from "./tile_if";
import { TileWait } from "./tile_wait";
import { TileMoveAbsolute } from "./tile_move_absolute";
import { TileMoveRelative } from "./tile_move_relative";
import { TileReadPin } from "./tile_read_pin";
import { TileSendMessage } from "./tile_send_message";
import { TileWritePin } from "./tile_write_pin";
import { TileExecuteScript } from "./tile_execute_script";
import { TileTakePhoto } from "./tile_take_photo";
import * as _ from "lodash";
import { CeleryNode, LegalArgString, If, Execute, Nothing } from "farmbot";
import { TaggedSequence } from "farmbot";
import { overwrite } from "../../api/crud";
import { TileFindHome } from "./tile_find_home";
import { t } from "i18next";
import { Session } from "../../session";
import { BooleanSetting } from "../../session_keys";

interface MoveParams {
  step: Step;
  to: number;
  from: number;
  sequence: TaggedSequence
}

export function move({ step, sequence, to, from }: MoveParams) {
  const copy = defensiveClone(step);
  const next = defensiveClone(sequence);
  const seq = next.body;
  seq.body = seq.body || [];
  if (from > to) {
    seq.body = arrayMover(seq.body, from, to);
  } else {
    seq.body.splice(to, 0, defensiveClone(copy));
    delete seq.body[from];
    seq.body = _.compact(seq.body);
  }
  return overwrite(sequence, next.body);
}

interface CopyParams {
  step: Step;
  index: number;
  sequence: TaggedSequence
}

export function splice({ step, sequence, index }: CopyParams) {
  const copy = defensiveClone(step);
  const next = defensiveClone(sequence);
  const seq = next.body;
  seq.body = seq.body || [];
  seq.body.splice(index, 0, copy);
  return overwrite(sequence, next.body);
}

interface RemoveParams {
  index: number;
  dispatch: Function;
  sequence: TaggedSequence;
}

export function remove({ dispatch, index, sequence }: RemoveParams) {
  if (!Session.deprecatedGetBool(BooleanSetting.confirm_step_deletion) ||
    confirm(t("Are you sure you want to delete this step?"))) {
    const original = sequence;
    const update = defensiveClone(original);
    update.body.body = (update.body.body || []);
    delete update.body.body[index];
    update.body.body = _.compact(update.body.body);
    dispatch(overwrite(original, update.body));
  }
}

export function updateStep(props: StepInputProps) {
  return (e: React.FormEvent<HTMLInputElement>) => {
    const { dispatch, step, index, sequence, field } = props;
    const stepCopy = defensiveClone(step);
    const seqCopy = defensiveClone(sequence).body;
    const val = e.currentTarget.value;
    const isNumeric = NUMERIC_FIELDS.includes(field);
    seqCopy.body = seqCopy.body || [];

    if (isNumeric) {
      numericNonsense(val, stepCopy, field);
    } else {
      _.assign(stepCopy.args, { [field]: val });
    }

    seqCopy.body[index] = stepCopy;
    dispatch(overwrite(sequence, seqCopy));
  };
}

export function updateStepTitle(props: StepTitleBarProps) {
  return (e: React.FormEvent<HTMLInputElement>) => {
    const { dispatch, step, index, sequence } = props;
    const stepCopy = defensiveClone(step);
    const seqCopy = defensiveClone(sequence).body;
    const val = e.currentTarget.value;
    seqCopy.body = seqCopy.body || [];
    if (val == "") {
      delete stepCopy.comment;
    } else {
      stepCopy.comment = val;
    }
    seqCopy.body[index] = stepCopy;
    dispatch(overwrite(sequence, seqCopy));
  };
}

function numericNonsense(val: string, copy: CeleryNode, field: LegalArgString) {
  const parsedNumber = FLOAT_NUMERIC_FIELDS.includes(field)
    ? parseFloat(val)
    : parseInt(val, 10);
  return _.assign(copy.args, { [field]: parsedNumber });
}

export function renderCeleryNode(props: StepParams) {
  switch (props.currentStep.kind) {
    case "_if": return <TileIf {...props} />;
    case "execute_script": return <TileExecuteScript {...props} />;
    case "execute": return <ExecuteBlock {...props} />;
    case "find_home": return <TileFindHome {...props} />;
    case "move_absolute": return <TileMoveAbsolute {...props} />;
    case "move_relative": return <TileMoveRelative {...props} />;
    case "read_pin": return <TileReadPin {...props} />;
    case "send_message": return <TileSendMessage {...props} />;
    case "take_photo": return <TileTakePhoto {...props} />;
    case "wait": return <TileWait {...props} />;
    case "write_pin": return <TileWritePin {...props} />;
    default: return <div><hr /> ? Unknown step ? <hr /></div>;
  }
}

const checkBranch = (branch: Execute | Nothing, _step: If, sequence: TaggedSequence) => {
  return (branch.kind === "execute")
    && (branch.args.sequence_id === sequence.body.id);
};

export function isRecursive(step: If, sequence: TaggedSequence) {
  return checkBranch(step.args._else, step, sequence)
    || checkBranch(step.args._then, step, sequence);
}
