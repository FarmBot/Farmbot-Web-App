import React from "react";
import { Col } from ".";
import { t } from "../i18next_wrapper";
import { ErrorBoundary } from "../error_boundary";

export interface LeftPanelProps {
  children?: React.ReactNode;
  className: string;
  title: string;
}

export function LeftPanel(props: LeftPanelProps) {
  return <Col sm={3}>
    <div className={props.className}>
      <h3>
        <i>{t(props.title)}</i>
      </h3>
      <ErrorBoundary>
        {props.children}
      </ErrorBoundary>
    </div>
  </Col>;
}
