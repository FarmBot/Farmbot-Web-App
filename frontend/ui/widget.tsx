import * as React from "react";
import { ErrorBoundary } from "../error_boundary";

interface WidgetProps {
  children?: React.ReactNode;
  className?: string;
}

export function Widget(props: WidgetProps) {
  let className = `widget-wrapper `;
  if (props.className) { className += props.className; }
  return <div className={className}>
    <ErrorBoundary>
      {props.children}
    </ErrorBoundary>
  </div>;
}
