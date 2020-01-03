import * as React from "react";
import { Popover, PopoverInteractionKind, PopoverPosition } from "@blueprintjs/core";
import { t } from "../i18next_wrapper";

interface HelpProps {
  text: string;
  requireClick?: boolean;
  position?: PopoverPosition;
  customIcon?: string;
}

export function Help(props: HelpProps) {
  return <Popover
    position={props.position}
    interactionKind={props.requireClick
      ? PopoverInteractionKind.CLICK : PopoverInteractionKind.HOVER}
    popoverClassName={"help"}>
    <i className={`fa fa-${props.customIcon || "question-circle"} help-icon`} />
    <div>{t(props.text)}</div>
  </Popover>;
}
