import React from "react";
import { Help } from "../../ui/help";
import { Popover, Position } from "@blueprintjs/core";
import { SequenceBodyItem, TaggedSequence } from "farmbot";
import { splice, remove, move } from "../step_tiles";
import { push } from "../../history";
import { sequencesUrlBase } from "../../folders/component";
import { urlFriendly } from "../../util";
import { setActiveSequenceByName } from "../set_active_sequence_by_name";
import { t } from "../../i18next_wrapper";

export interface StepIconBarProps {
  index: number;
  dispatch: Function;
  step: SequenceBodyItem;
  sequence: TaggedSequence;
  executeSequenceName: string | undefined;
  helpText: string;
  confirmStepDeletion: boolean;
  toggleViewRaw?: () => void;
  toggleMonacoEditor?(): void;
  links?: React.ReactElement[];
}

export function StepUpDownButtonPopover(
  { onMove }: { onMove: (d: number) => () => void }) {
  return <Popover position={Position.TOP} usePortal={false}>
    <i title={t("move step")} className="fa fa-arrows-v" />
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
    {props.executeSequenceName &&
      <i className={"fa fa-external-link"}
        title={t("open linked sequence")}
        onClick={onSequenceLinkNav(props.executeSequenceName)} />}
    {props.toggleMonacoEditor &&
      <i className={"fa fa-font"}
        title={t("toggle fancy editor")}
        onClick={props.toggleMonacoEditor} />}
    {props.toggleViewRaw &&
      <i className={"fa fa-code"}
        title={t("toggle code view")}
        onClick={props.toggleViewRaw} />}
    <Help text={helpText} position={Position.TOP} title={t("help")}
      links={props.links} />
    <i className={"fa fa-trash"}
      title={t("delete step")}
      onClick={onTrash} />
    <i className={"fa fa-clone"}
      title={t("duplicate step")}
      onClick={onClone} />
    <StepUpDownButtonPopover onMove={onMove} />
  </span>;
}
