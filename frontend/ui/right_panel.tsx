import * as React from "react";
import { Col, ToolTip, DocSlug } from ".";
import { t } from "../i18next_wrapper";
import { ErrorBoundary } from "../error_boundary";

interface RightPanelProps {
  children?: React.ReactNode;
  className: string;
  title: string;
  helpText: string;
  docPage?: DocSlug;
  show: Boolean | undefined;
  width?: number;
  backButton?: React.ReactNode;
}

export function RightPanel(props: RightPanelProps) {
  return <Col sm={props.width || 3} lg={3}>
    {props.show &&
      <div className={props.className}>
        {props.backButton}
        <h3>
          <i>{t(props.title)}</i>
        </h3>
        <ToolTip helpText={props.helpText} docPage={props.docPage} />
        <ErrorBoundary>
          {props.children}
        </ErrorBoundary>
      </div>}
  </Col>;
}
