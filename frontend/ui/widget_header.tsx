import * as React from "react";
import { DocSlug } from "./doc_link";
import { t } from "../i18next_wrapper";
import { ToolTip } from "./tooltip";
import { ErrorBoundary } from "../error_boundary";

interface WidgetHeaderProps {
  children?: React.ReactNode;
  helpText?: string;
  docPage?: DocSlug;
  title: string;
}

export function WidgetHeader(props: WidgetHeaderProps) {
  return <div className="widget-header">
    <ErrorBoundary>
      {props.children}
    </ErrorBoundary>
    <h5>{t(props.title)}</h5>
    {props.helpText &&
      <ToolTip helpText={props.helpText} docPage={props.docPage} />}
  </div>;
}
