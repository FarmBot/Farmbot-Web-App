import * as React from "react";
import { t } from "i18next";
import { JSXChildren } from "../util";

interface WidgetFooterProps {
  children?: JSXChildren;
}

export function WidgetFooter(props: WidgetFooterProps) {
  return <div className="widget-footer">
    {props.children}
  </div>;
}
