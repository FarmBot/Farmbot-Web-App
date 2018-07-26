import * as React from "react";
import { Col, ToolTip, DocSlug } from ".";
import { t } from "i18next";

interface CenterProps {
  children?: React.ReactNode;
  className: string;
  title: string;
  helpText: string;
  width?: number;
  docPage?: DocSlug;
}

export function CenterPanel(props: CenterProps) {
  return <Col sm={props.width || 6}>
    <div className={props.className}>
      <h3>
        <i>{t(props.title)}</i>
      </h3>
      <ToolTip helpText={t(props.helpText)} docPage={props.docPage} />
      {props.children}
    </div>
  </Col>;
}
