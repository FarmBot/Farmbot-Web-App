import React from "react";
import {
  PopoverInteractionKind, PopoverPosition, Position,
} from "@blueprintjs/core";
import { t } from "../i18next_wrapper";
import { Markdown, Popover } from "../ui";

export interface HelpProps {
  text: string;
  onHover?: boolean;
  position?: PopoverPosition;
  customIcon?: string;
  customClass?: string;
  links?: React.ReactElement[];
  title?: string;
  enableMarkdown?: boolean;
  isOpen?: boolean;
  setOpen?(): void;
  iconButton?: boolean;
}

export function Help(props: HelpProps) {
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
