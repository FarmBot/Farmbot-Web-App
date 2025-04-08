import React from "react";
import { t } from "../i18next_wrapper";
import { DocSlug, docLinkClick } from "./doc_link";
import { useNavigate } from "react-router";

export interface ToolTipProps {
  helpText: string;
  docPage: DocSlug;
  dispatch: Function;
}

export const ToolTip = (props: ToolTipProps) => {
  const { helpText, dispatch, docPage } = props;
  const [isOpen, setIsOpen] = React.useState(false);
  const navigate = useNavigate();
  return <div className={"title-help"}
    onClick={e => e.stopPropagation()}>
    <i className={"fa fa-question-circle title-help-icon"}
      onClick={() => setIsOpen(!isOpen)} />
    <div className={`title-help-text ${isOpen ? "open" : ""}`}>
      <i className={"title-help-text-text"}>{t(helpText)}</i>
      {docPage &&
        <a onClick={docLinkClick({
          slug: docPage,
          navigate,
          dispatch,
        })}>
          {" " + t("Documentation")}
          <i className="fa fa-external-link" />
        </a>}
    </div>
  </div>;
};
