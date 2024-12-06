import React from "react";
import { ErrorBoundary } from "../error_boundary";

interface WidgetBodyProps {
  children?: React.ReactNode;
}

export function WidgetBody(props: WidgetBodyProps) {
  return <div className="widget-body">
    <ErrorBoundary>
      {props.children}
    </ErrorBoundary>
  </div>;
}
