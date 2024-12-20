import React from "react";
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
    <h5>{t(props.title)}</h5>
    <div>
      {props.helpText && <Help text={props.helpText} />}
      <ErrorBoundary>
        {props.children}
      </ErrorBoundary>
    </div>
  </div>;
}
