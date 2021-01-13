import React from "react";
import { Help } from "../ui/help";
import { Popover, Position } from "@blueprintjs/core";
import { SequenceBodyItem, TaggedSequence } from "farmbot";
import { splice, remove, move } from "./step_tiles";
import { push } from "../history";
import { sequencesUrlBase } from "../folders/component";
import { urlFriendly } from "../util";
import { setActiveSequenceByName } from "./set_active_sequence_by_name";

export interface StepIconBarProps {
  index: number;
  dispatch: Function;
  step: SequenceBodyItem;
  sequence: TaggedSequence;
  executeSequenceName: string | undefined;
  helpText: string;
  confirmStepDeletion: boolean;
  toggleViewRaw?: () => void;
}

export function StepUpDownButtonPopover(
  { onMove }: { onMove: (d: number) => () => void }) {
  return <Popover position={Position.TOP} usePortal={false}>
    <i className="fa fa-arrows-v" />
    <div className={"step-up-down-arrows"}>
      <i className="fa fa-arrow-circle-up" onClick={onMove(-1)} />
      <i className="fa fa-arrow-circle-down" onClick={onMove(2)} />
    </div>
  </Popover>;
}

export function StepIconGroup(props: StepIconBarProps) {
  const {
    index, dispatch, step, sequence, helpText, confirmStepDeletion
  } = props;

  const onClone = () => dispatch(splice({ step, index, sequence }));
  const onTrash = () =>
    remove({ dispatch, index, sequence, confirmStepDeletion });
  const onMove = (delta: number) => () => {
    const to = Math.max(index + delta, 0);
    dispatch(move({ step, sequence, from: index, to }));
  };
  const onSequenceLinkNav = (sequenceName: string) => () => {
    push(sequencesUrlBase() + urlFriendly(sequenceName));
    setActiveSequenceByName();
  };

  return <span className={"step-control-icons"}>
    <StepUpDownButtonPopover onMove={onMove} />
    <i className={"fa fa-clone"} onClick={onClone} />
    <i className={"fa fa-trash"} onClick={onTrash} />
    <Help text={helpText} position={Position.TOP} />
    {props.toggleViewRaw &&
      <i className={"fa fa-code"} onClick={props.toggleViewRaw} />}
    {props.executeSequenceName &&
      <i className={"fa fa-external-link"}
        onClick={onSequenceLinkNav(props.executeSequenceName)} />}
  </span>;
}
