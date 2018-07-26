import * as React from "react";
import { t } from "i18next";
import { ControlPanelState } from "../../interfaces";
import { toggleControlPanel } from "../../actions";

interface Props {
  dispatch: Function;
  name: keyof ControlPanelState;
  title: string;
  expanded: boolean;
}

export let Header = (props: Props) => {
  const { dispatch, name, title, expanded } = props;
  const icon_string = expanded ? "minus" : "plus";
  return <h4 onClick={() => dispatch(toggleControlPanel(name))}>
    {t(title)}
    <span className="icon-toggle">
      &nbsp;&nbsp;[<i className={`fa fa-${icon_string}`} />]
    </span>
  </h4>;
};
