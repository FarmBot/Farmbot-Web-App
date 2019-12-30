import * as React from "react";
import { Col, ToolTip } from ".";
import { t } from "../i18next_wrapper";
import { ErrorBoundary } from "../error_boundary";

interface LeftPanelProps {
  children?: React.ReactNode;
  className: string;
  title: string;
  helpText?: string;
  width?: number;
}

export function LeftPanel(props: LeftPanelProps) {
  return <Col sm={props.width || 3}>
    <div className={props.className}>
      <h3>
        <i>{t(props.title)}</i>
      </h3>
      {props.helpText && <ToolTip helpText={props.helpText} />}
      <ErrorBoundary>
        {props.children}
      </ErrorBoundary>
    </div>
  </Col>;
}
