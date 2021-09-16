import React from "react";
import { Col, ToolTip, DocSlug } from ".";
import { t } from "../i18next_wrapper";
import { ErrorBoundary } from "../error_boundary";

export interface CenterPanelProps {
  children?: React.ReactNode;
  className: string;
  title: string;
  helpText?: string;
  width?: number;
  docPage?: DocSlug;
  backButton?: React.ReactNode;
}

export function CenterPanel(props: CenterPanelProps) {
  return <Col sm={props.width || 6} lg={6}>
    <div className={props.className}>
      {props.backButton}
      <h3>
        <i>{t(props.title)}</i>
      </h3>
      {props.helpText &&
        <ToolTip helpText={t(props.helpText)} docPage={props.docPage} />}
      <ErrorBoundary>
        {props.children}
      </ErrorBoundary>
    </div>
  </Col>;
}
