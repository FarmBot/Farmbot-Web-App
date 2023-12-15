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
import { SequenceReducerState } from "../interfaces";
import { StateToggleKey, StateToggles } from "./step_wrapper";

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
  stateToggles?: StateToggles;
  links: React.ReactElement[] | undefined;
  readOnly: boolean;
  enableMarkdown?: boolean;
  isProcessing: boolean;
  togglePrompt(): void;
  sequencesState: SequenceReducerState;
}

export function StepUpDownButtonPopover(
  { onMove }: { onMove: (d: number) => () => void }) {
  return <Popover position={Position.TOP} usePortal={false}
    target={<i title={t("move step")} className="fa fa-arrows-v fb-icon-button" />}
    content={<div className={"step-up-down-arrows"}>
      <i className="fa fa-arrow-circle-up" onClick={onMove(-1)} />
      <i className="fa fa-arrow-circle-down" onClick={onMove(2)} />
    </div>} />;
}

export function StepIconGroup(props: StepIconBarProps) {
  const {
    index, dispatch, step, sequence, helpText, confirmStepDeletion, readOnly,
  } = props;

  const onClone = () => {
    dispatch(splice({ step, index, sequence }));
  };
  const onTrash = () => {
    remove({ dispatch, index, sequence, confirmStepDeletion });
  };
  const onMove = (delta: number) => () => {
    const to = Math.max(index + delta, 0);
    dispatch(move({ step, sequence, from: index, to }));
  };
  const onSequenceLinkNav = (sequenceName: string) => () => {
    push(Path.sequences(urlFriendly(sequenceName)));
    setActiveSequenceByName();
  };
  const monaco = props.stateToggles?.[StateToggleKey.monacoEditor];
  const expanded = props.stateToggles?.[StateToggleKey.luaExpanded];

  return <span className={"step-control-icons"}>
    {!readOnly && props.step.kind == "lua" &&
      <i className={"fa fa-magic fb-icon-button"}
        title={t("auto-generate Lua code")}
        onClick={props.togglePrompt} />}
    {props.executeSequenceName &&
      <i className={"fa fa-external-link fb-icon-button"}
        title={t("open linked sequence")}
        onClick={onSequenceLinkNav(props.executeSequenceName)} />}
    {monaco &&
      <i className={`fa fa-font ${monaco.enabled ? "enabled" : ""} fb-icon-button`}
        title={t("toggle fancy editor")}
        onClick={monaco.toggle} />}
    {expanded &&
      <i title={t("toggle increased editor height")}
        className={[
          "fa",
          expanded.enabled ? "fa-compress" : "fa-expand",
          "fb-icon-button",
        ].join(" ")}
        onClick={expanded.toggle} />}
    {props.toggleViewRaw &&
      <i className={`fa fa-code ${props.viewRaw ? "enabled" : ""} fb-icon-button`}
        title={t("toggle code view")}
        onClick={props.toggleViewRaw} />}
    <Help iconButton={true}
      text={helpText} position={Position.TOP} title={t("help")}
      links={props.links} enableMarkdown={props.enableMarkdown} />
    {!readOnly && <i className={"fa fa-trash fb-icon-button"}
      title={t("delete step")}
      onClick={onTrash} />}
    {!readOnly && <i className={"fa fa-clone fb-icon-button"}
      title={t("duplicate step")}
      onClick={onClone} />}
    {!readOnly && <StepUpDownButtonPopover onMove={onMove} />}
  </span>;
}
