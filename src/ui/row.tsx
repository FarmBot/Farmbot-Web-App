import * as React from "react";
import { JSXChildren } from "../util";

interface RowProps {
  children?: JSXChildren;
  className?: string;
}

export function Row(props: RowProps) {
  let className = props.className ? props.className += " row" : "row";
  return <div className={className}>
    {props.children}
  </div>;
}
