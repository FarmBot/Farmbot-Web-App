import React from "react";
import {
  PopoverNext as BlueprintPopover,
  PopoverProps as BasePopoverProps,
  popoverPropsToNextProps,
} from "@blueprintjs/core";

export interface PopoverProps extends BasePopoverProps {
  target: React.ReactNode;
}

export const Popover = (props: PopoverProps) => {
  const nextProps = popoverPropsToNextProps({ ...props, minimal: true });
  return <span className={`bp6-popover-wrapper ${props.className}`}>
    <BlueprintPopover {...nextProps}>
      {props.target}
    </BlueprintPopover>
  </span>;
};
