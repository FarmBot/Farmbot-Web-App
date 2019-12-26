import * as React from "react";
import { t } from "../i18next_wrapper";

interface Props {
  onClick(): void;
  title: string;
  expanded: boolean;
}

export const ExpandableHeader = (props: Props) => {
  const { onClick, title, expanded } = props;
  const icon_string = expanded ? "minus" : "plus";
  const nbwhitespace = title != "";
  return <h4 className="expandable-header" onClick={onClick}>
    {t(title)}
    {nbwhitespace &&
      "\u00A0\u00A0"
    }
    <span className="icon-toggle">
      [<i className={`fa fa-${icon_string}`} />]
    </span>
  </h4>;
};
