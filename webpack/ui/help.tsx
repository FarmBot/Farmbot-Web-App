import * as React from "react";
import { Popover, Position, PopoverInteractionKind } from "@blueprintjs/core";

interface HelpProps {
  text: string;
}

export function Help(props: HelpProps) {
  return <Popover
    position={Position.LEFT_TOP}
    interactionKind={PopoverInteractionKind.HOVER}
    popoverClassName={"help"} >
    <i className="fa fa-question-circle help-icon"></i>
    <div>{props.text}</div>
  </Popover>;
}
