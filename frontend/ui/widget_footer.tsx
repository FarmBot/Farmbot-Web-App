import React from "react";

interface WidgetFooterProps {
  children?: React.ReactNode;
}

export function WidgetFooter(props: WidgetFooterProps) {
  return <div className="widget-footer">
    {props.children}
  </div>;
}
