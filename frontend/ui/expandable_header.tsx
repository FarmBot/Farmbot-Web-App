import React from "react";
import { t } from "../i18next_wrapper";

export interface ExpandableHeaderProps {
  onClick(): void;
  title: string;
  expanded: boolean;
  children?: React.ReactNode;
}

export const ExpandableHeader = (props: ExpandableHeaderProps) => {
  const { onClick, title, expanded } = props;
  const icon_string = expanded ? "fa-minus" : "fa-plus";
  const nbwhitespace = title != "";
  return <h4 className="expandable-header" role={"button"} onClick={onClick}>
    {t(title)}
    {nbwhitespace &&
      "\u00A0\u00A0"
    }
    <span className="icon-toggle">
      [<i className={`fa ${icon_string}`} />]
    </span>
    {props.children}
  </h4>;
};
