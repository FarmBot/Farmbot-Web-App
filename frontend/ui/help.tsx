import * as React from "react";
import {
  Popover, PopoverInteractionKind, PopoverPosition, Position,
} from "@blueprintjs/core";
import { t } from "../i18next_wrapper";

interface HelpProps {
  text: string;
  onHover?: boolean;
  position?: PopoverPosition;
  customIcon?: string;
  customClass?: string;
  links?: React.ReactElement[];
}

export function Help(props: HelpProps) {
  return <Popover
    position={props.position || Position.TOP_RIGHT}
    interactionKind={props.onHover
      ? PopoverInteractionKind.HOVER
      : PopoverInteractionKind.CLICK}
    className={props.customClass}
    popoverClassName={"help"}>
    <i className={`fa fa-${props.customIcon || "question-circle"} help-icon`} />
    <div className={"help-text-content"}>
      {t(props.text)}
      {props.links?.map((link, index) => <div key={index}>{link}</div>)}
    </div>
  </Popover>;
}
