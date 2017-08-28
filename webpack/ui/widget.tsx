import * as React from "react";
import { JSXChildren } from "../util";

interface WidgetProps {
  children?: JSXChildren;
  className?: string;
}

export function Widget(props: WidgetProps) {
  let className = `widget-wrapper `;
  if (props.className) { className += props.className; }
  return <div className={className}>
    {props.children}
  </div>;
}
