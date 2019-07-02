import * as React from "react";
import { Popover, Position, PopoverInteractionKind } from "@blueprintjs/core";
import { t } from "../i18next_wrapper";

interface HelpProps {
  text: string;
  requireClick?: boolean;
}

export function Help(props: HelpProps) {
  return <Popover
    position={Position.LEFT_TOP}
    interactionKind={props.requireClick
      ? PopoverInteractionKind.CLICK : PopoverInteractionKind.HOVER}
    popoverClassName={"help"} >
    <i className="fa fa-question-circle help-icon"></i>
    <div>{t(props.text)}</div>
  </Popover>;
}
