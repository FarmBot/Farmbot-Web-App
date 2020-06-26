import * as React from "react";
import { t } from "../i18next_wrapper";
import { ErrorBoundary } from "../error_boundary";
import { Help } from "./help";

export interface WidgetHeaderProps {
  children?: React.ReactNode;
  helpText?: string;
  title: string;
}

export function WidgetHeader(props: WidgetHeaderProps) {
  return <div className="widget-header">
    <ErrorBoundary>
      {props.children}
    </ErrorBoundary>
    <h5>{t(props.title)}</h5>
    {props.helpText && <Help text={props.helpText} />}
  </div>;
}
