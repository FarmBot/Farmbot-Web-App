import React from "react";
import {
  PopoverInteractionKind, Position,
} from "@blueprintjs/core";
import { t } from "../i18next_wrapper";
import { Markdown } from "./markdown";
import { Popover } from "./popover";

export interface HelpProps {
  text: string;
  onHover?: boolean;
  position?: Position;
  customIcon?: string;
  customClass?: string;
  links?: React.ReactElement[];
  title?: string;
  ariaLabel?: string;
  enableMarkdown?: boolean;
  isOpen?: boolean;
  setOpen?(): void;
  iconButton?: boolean;
}

export function Help(props: HelpProps) {
  const ariaLabel = props.ariaLabel
    || props.title
    || (!props.enableMarkdown ? t(props.text) : t("Help"));
  return <Popover
    position={props.position || Position.TOP_RIGHT}
    interactionKind={props.onHover
      ? PopoverInteractionKind.HOVER
      : PopoverInteractionKind.CLICK}
    className={props.customClass}
    isOpen={props.isOpen}
    popoverClassName={"help"}
    target={
      <i title={props.title}
        role={"tooltip"}
        aria-label={ariaLabel}
        className={[
          "fa",
          props.customIcon || "fa-question-circle",
          "help-icon",
          props.iconButton ? "fb-icon-button" : "",
        ].filter(c => c).join(" ")}
        onClick={props.setOpen} />}
    content={<div className={"help-text-content"}>
      {props.enableMarkdown
        ? <Markdown>{props.text}</Markdown>
        : t(props.text)}
      {props.links}
    </div>} />;
}
