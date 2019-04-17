import * as React from "react";
import { t } from "../i18next_wrapper";

interface Props {
  onClick(): void;
  title: string;
  expanded: boolean;
}

export let ExpandableHeader = (props: Props) => {
  const { onClick, title, expanded } = props;
  const icon_string = expanded ? "minus" : "plus";
  return <h4 className="expandable-header" onClick={onClick}>
    {t(title)}
    <span className="icon-toggle">
      &nbsp;&nbsp;[<i className={`fa fa-${icon_string}`} />]
    </span>
  </h4>;
};
