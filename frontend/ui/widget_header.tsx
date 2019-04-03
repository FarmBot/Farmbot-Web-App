import * as React from "react";

import { docLink, DocSlug } from "./doc_link";
import { t } from "../i18next_wrapper";

interface WidgetHeaderProps {
  children?: React.ReactNode;
  helpText?: string;
  docPage?: DocSlug;
  title: string;
}

export function WidgetHeader(props: WidgetHeaderProps) {
  return <div className="widget-header">
    {props.children}
    <h5>{t(props.title)}</h5>
    {props.helpText &&
      <i className="fa fa-question-circle help-icon">
        <div className="help-text">
          {t(props.helpText)}
          {props.docPage &&
            <a
              href={docLink(props.docPage)}
              target="_blank">
              {" " + t("Documentation")}
              <i className="fa fa-external-link" />
            </a>}
        </div>
      </i>
    }
  </div>;
}
