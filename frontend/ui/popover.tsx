import React from "react";
import {
  Popover as BlueprintPopover,
  PopoverProps as BasePopoverProps,
} from "@blueprintjs/core";

export interface PopoverProps extends BasePopoverProps {
  target: React.ReactNode;
}

export const Popover = (props: PopoverProps) => {
  return <span className={`bp6-popover-wrapper ${props.className}`}>
    <BlueprintPopover {...props} minimal={true}>
      {props.target}
    </BlueprintPopover>
  </span>;
};
