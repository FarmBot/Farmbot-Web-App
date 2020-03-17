import * as React from "react";
import { Popover, PopoverInteractionKind, Position } from "@blueprintjs/core";

interface InputErrorProps {
  error?: string;
}

export const InputError = (props: InputErrorProps) =>
  props.error
    ? <Popover
      minimal={true}
      usePortal={false}
      position={Position.TOP_LEFT}
      modifiers={{ offset: { offset: "0, 20" } }}
      interactionKind={PopoverInteractionKind.HOVER}
      className="input-error-wrapper">
      <i className="fa fa-exclamation-circle input-error" />
      <p>{props.error}</p>
    </Popover>
    : <div className={"no-input-error"} />;
