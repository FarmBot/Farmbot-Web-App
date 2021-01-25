import React from "react";
import { t } from "../i18next_wrapper";
import { DocSlug, docLinkClick } from "./doc_link";

export interface ToolTipProps {
  children?: React.ReactNode;
  className?: string;
  helpText: string;
  docPage?: DocSlug;
}

export const ToolTip = (props: ToolTipProps) => {
  const { helpText, className } = props;
  const [isOpen, setIsOpen] = React.useState(false);
  return <div className={["title-help", className].filter(x => x).join(" ")}
    onClick={e => e.stopPropagation()}>
    <i className={"fa fa-question-circle title-help-icon"}
      onClick={() => setIsOpen(!isOpen)} />
    <div className={`title-help-text ${isOpen ? "open" : ""}`}>
      <i className={"title-help-text-text"}>{t(helpText)}</i>
      {props.docPage &&
        <a onClick={docLinkClick(props.docPage)}>
          {" " + t("Documentation")}
          <i className="fa fa-external-link" />
        </a>}
      {props.children}
    </div>
  </div>;
};
