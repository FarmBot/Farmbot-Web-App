import * as React from "react";
import { Help } from "../ui/help";
import { Popover, Position } from "@blueprintjs/core";
import { SequenceBodyItem, TaggedSequence } from "farmbot";
import { splice, remove, move } from "./step_tiles";

export interface StepIconBarProps {
  index: number;
  dispatch: Function;
  step: SequenceBodyItem;
  sequence: TaggedSequence;
  helpText: string;
}

export function StepUpDownButtonPopover(
  { onMove }: { onMove: (d: number) => () => void }) {
  return <Popover position={Position.TOP} usePortal={false}>
    <i className="fa fa-arrows-v step-control" />
    <div className={"step-up-down-arrows"}>
      <i className="fa fa-arrow-circle-up" onClick={onMove(-1)} />
      <i className="fa fa-arrow-circle-down" onClick={onMove(2)} />
    </div>
  </Popover>;
}

export function StepIconGroup(props: StepIconBarProps) {
  const { index, dispatch, step, sequence, helpText } = props;

  const onClone = () => dispatch(splice({ step, index, sequence }));
  const onTrash = () => remove({ dispatch, index, sequence });
  const onMove = (delta: number) => () => {
    const to = Math.max(index + delta, 0);
    dispatch(move({ step, sequence, from: index, to }));
  };

  return <span>
    <StepUpDownButtonPopover onMove={onMove} />
    <i className="fa fa-clone step-control" onClick={onClone} />
    <i className="fa fa-trash step-control" onClick={onTrash} />
    <Help text={helpText} />
  </span>;
}
