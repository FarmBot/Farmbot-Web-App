import * as React from "react";

interface WidgetProps {
  children?: React.ReactNode;
  className?: string;
}

export function Widget(props: WidgetProps) {
  let className = `widget-wrapper `;
  if (props.className) { className += props.className; }
  return <div className={className}>
    {props.children}
  </div>;
}
