import * as React from "react";

interface WidgetBodyProps {
  children?: React.ReactNode;
}

export function WidgetBody(props: WidgetBodyProps) {
  return <div className="widget-body">
    {props.children}
  </div>;
}
