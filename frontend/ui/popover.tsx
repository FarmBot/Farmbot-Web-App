import React from "react";
import {
  Popover as Popover2,
  PopoverProps as BasePopoverProps,
} from "@blueprintjs/core";

export interface PopoverProps extends BasePopoverProps {
  target: JSX.Element;
}

export const Popover = (props: PopoverProps) => {
  return <span className={`bp5-popover-wrapper ${props.className}`}>
    <Popover2 {...props} minimal={true}>
      {props.target}
    </Popover2>
  </span>;
};
