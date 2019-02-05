import * as React from "react";
import { t } from "i18next";
import { DocSlug, docLink } from ".";

interface ToolTipProps {
  children?: React.ReactNode;
  className?: string;
  helpText: string;
  docPage?: DocSlug;
}

export function ToolTip(props: ToolTipProps) {
  let { className } = props;
  const { helpText } = props;
  const cn = className ? className += " title-help" : "title-help";
  return <div className={cn}>
    <i className="fa fa-question-circle title-help-icon" />
    <div className="title-help-text">
      <i>{t(helpText)}</i>
      {props.docPage &&
        <a
          href={docLink(props.docPage)}
          target="_blank">
          {" " + t("Documentation")}
          <i className="fa fa-external-link" />
        </a>}
    </div>
  </div>;
}
