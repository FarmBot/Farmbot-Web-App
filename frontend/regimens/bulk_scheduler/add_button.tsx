import * as React from "react";
import { AddButtonProps } from "./interfaces";

export function AddButton({ active, onClick: click }: AddButtonProps) {
  if (!active) { return <div />; }
  return <button
    className="fb-button green add"
    onClick={click}>
    <i className="fa fa-plus" />
  </button>;
}
