import * as React from "react";
import { Col, ToolTip } from ".";
import { t } from "../i18next_wrapper";

interface RightPanelProps {
  children?: React.ReactNode;
  className: string;
  title: string;
  helpText: string;
  show: Boolean | undefined;
  width?: number;
}

export function RightPanel(props: RightPanelProps) {
  return <Col sm={props.width || 3} lg={3}>
    {props.show &&
      <div className={props.className}>
        <h3>
          <i>{t(props.title)}</i>
        </h3>
        <ToolTip helpText={props.helpText} />
        {props.children}
      </div>}
  </Col>;
}
