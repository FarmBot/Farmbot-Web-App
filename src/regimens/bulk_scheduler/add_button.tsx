import * as React from "react";
import { AddButtonProps } from "./interfaces";

export function AddButton({ active, click }: AddButtonProps) {
  if (!active) { return <div />; }
  return <button
    className="fb-button green"
    onClick={click}
  >
    <i className="fa fa-plus" />
  </button>;
}
