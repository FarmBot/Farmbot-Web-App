import React from "react";
// eslint-disable-next-line import/no-deprecated
import { Popover as Popover1, IPopoverProps } from "@blueprintjs/core";

export interface PopoverProps extends IPopoverProps {
  target: JSX.Element;
}

export const Popover = (props: PopoverProps) =>
  <Popover1 {...props} targetClassName={`${props.className} bp-popover-target`} />;
