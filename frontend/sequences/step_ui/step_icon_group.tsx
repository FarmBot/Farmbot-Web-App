import React from "react";
import { Help } from "../../ui/help";
import { Position } from "@blueprintjs/core";
import { SequenceBodyItem, TaggedSequence } from "farmbot";
import { splice, remove, move } from "../step_tiles";
import { push } from "../../history";
import { urlFriendly } from "../../util";
import { setActiveSequenceByName } from "../set_active_sequence_by_name";
import { t } from "../../i18next_wrapper";
import { Popover } from "../../ui";
import { Path } from "../../internal_urls";

export interface StepIconBarProps {
  index: number;
  dispatch: Function;
  step: SequenceBodyItem;
  sequence: TaggedSequence;
  executeSequenceName: string | undefined;
  helpText: string;
  confirmStepDeletion: boolean;
  viewRaw: boolean | undefined;
  toggleViewRaw: (() => void) | undefined;
  monacoEditor: boolean | undefined;
  toggleMonacoEditor: (() => void) | undefined;
  links: React.ReactElement[] | undefined;
  readOnly: boolean;
  enableMarkdown?: boolean;
}

export function StepUpDownButtonPopover(
  { onMove }: { onMove: (d: number) => () => void }) {
  return <Popover position={Position.TOP} usePortal={false}
    target={<i title={t("move step")} className="fa fa-arrows-v" />}
    content={<div className={"step-up-down-arrows"}>
      <i className="fa fa-arrow-circle-up" onClick={onMove(-1)} />
      <i className="fa fa-arrow-circle-down" onClick={onMove(2)} />
    </div>} />;
}

export function StepIconGroup(props: StepIconBarProps) {
  const {
    index, dispatch, step, sequence, helpText, confirmStepDeletion, readOnly,
  } = props;

  const onClone = () => dispatch(splice({ step, index, sequence }));
  const onTrash = () =>
    remove({ dispatch, index, sequence, confirmStepDeletion });
  const onMove = (delta: number) => () => {
    const to = Math.max(index + delta, 0);
    dispatch(move({ step, sequence, from: index, to }));
  };
  const onSequenceLinkNav = (sequenceName: string) => () => {
    push(Path.sequences(urlFriendly(sequenceName)));
    setActiveSequenceByName();
  };

  return <span className={"step-control-icons"}>
    {props.executeSequenceName &&
      <i className={"fa fa-external-link"}
        title={t("open linked sequence")}
        onClick={onSequenceLinkNav(props.executeSequenceName)} />}
    {props.toggleMonacoEditor &&
      <i className={`fa fa-font ${props.monacoEditor ? "enabled" : ""}`}
        title={t("toggle fancy editor")}
        onClick={props.toggleMonacoEditor} />}
    {props.toggleViewRaw &&
      <i className={`fa fa-code ${props.viewRaw ? "enabled" : ""}`}
        title={t("toggle code view")}
        onClick={props.toggleViewRaw} />}
    <Help text={helpText} position={Position.TOP} title={t("help")}
      links={props.links} enableMarkdown={props.enableMarkdown} />
    {!readOnly && <i className={"fa fa-trash"}
      title={t("delete step")}
      onClick={onTrash} />}
    {!readOnly && <i className={"fa fa-clone"}
      title={t("duplicate step")}
      onClick={onClone} />}
    {!readOnly && <StepUpDownButtonPopover onMove={onMove} />}
  </span>;
}
