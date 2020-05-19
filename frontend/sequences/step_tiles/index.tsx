import * as React from "react";
import {
  CeleryNode, LegalArgString, If, Execute, Nothing,
  SequenceBodyItem as Step, TaggedSequence, LegalSequenceKind,
} from "farmbot";
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
import { overwrite } from "../../api/crud";
import { TileFindHome } from "./tile_find_home";
import { TileMarkAs } from "./tile_mark_as";
import { TileUnknown } from "./tile_unknown";
import { forceSetStepTag } from "../../resources/sequence_tagging";
import { compact, assign } from "lodash";
import { TileSetServoAngle } from "./tile_set_servo_angle";
import { TileSystemAction } from "./tile_system_action";
import { TileTogglePin } from "./tile_toggle_pin";
import { TileFirmwareAction } from "./tile_firmware_action";
import { TileSetZero } from "./tile_set_zero";
import { TileCalibrate } from "./tile_calibrate";
import { TileMoveHome } from "./tile_move_home";
import { t } from "../../i18next_wrapper";
import { TileAssertion } from "./tile_assertion";
import { TileEmergencyStop } from "./tile_emergency_stop";
import { TileReboot } from "./tile_reboot";
import { TileOldMarkAs } from "./tile_old_mark_as";
import { TileShutdown } from "./tile_shutdown";

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
    seq.body = compact(seq.body);
  }
  return overwrite(sequence, next.body);
}

interface CopyParams {
  step: Step;
  index: number;
  sequence: TaggedSequence
}

export function splice({ step, sequence, index }: CopyParams) {
  const copy = forceSetStepTag(defensiveClone(step));
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
  confirmStepDeletion: boolean;
}

export function remove(props: RemoveParams) {
  const { dispatch, index, sequence, confirmStepDeletion } = props;
  if (!confirmStepDeletion ||
    confirm(t("Are you sure you want to delete this step?"))) {
    const original = sequence;
    const update = defensiveClone(original);
    update.body.body = (update.body.body || []);
    delete update.body.body[index];
    update.body.body = compact(update.body.body);
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
      assign(stepCopy.args, { [field]: val });
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
  return assign(copy.args, { [field]: parsedNumber });
}

// tslint:disable-next-line:cyclomatic-complexity
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
    case "update_resource": return <TileMarkAs {...props} />;
    case "resource_update" as LegalSequenceKind:
      return <TileOldMarkAs {...props} />;
    case "set_servo_angle": return <TileSetServoAngle {...props} />;
    case "toggle_pin": return <TileTogglePin {...props} />;
    case "zero": return <TileSetZero {...props} />;
    case "calibrate": return <TileCalibrate {...props} />;
    case "home": return <TileMoveHome {...props} />;
    case "reboot": return <TileReboot {...props} />;
    case "emergency_lock": return <TileEmergencyStop {...props} />;
    case "assertion": return <TileAssertion {...props} />;
    case "power_off": return <TileShutdown {...props} />;
    case "sync": case "read_status":
    case "emergency_unlock": case "install_first_party_farmware":
      return <TileSystemAction {...props} />;
    case "check_updates": case "factory_reset":
      return <TileFirmwareAction {...props} />;
    default:
      return <TileUnknown {...props} />;
  }
}

const checkBranch =
  (branch: Execute | Nothing, _step: If, sequence: TaggedSequence) => {
    return (branch.kind === "execute")
      && (branch.args.sequence_id === sequence.body.id);
  };

export function isRecursive(step: If, sequence: TaggedSequence) {
  return checkBranch(step.args._else, step, sequence)
    || checkBranch(step.args._then, step, sequence);
}
