import * as React from "react";
import { t } from "i18next";
import { JSXChildren } from "../util";

interface ToolTipProps {
  children?: JSXChildren;
  className?: string;
  helpText: string;
}

export function ToolTip(props: ToolTipProps) {
  let { className, helpText } = props;
  let cn = className ? className += " title-help" : "title-help";
  return <div className={cn}>
    <i className="fa fa-question-circle title-help-icon" />
    <div className="title-help-text">
      <i>{t(helpText)}</i>
    </div>
  </div>;
}
