import * as React from "react";
import { ControlPanelState } from "../../interfaces";
import { toggleControlPanel } from "../../actions";
import { ExpandableHeader } from "../../../ui/expandable_header";
import { t } from "../../../i18next_wrapper";
import { DeviceSetting } from "../../../constants";

interface Props {
  dispatch: Function;
  panel: keyof ControlPanelState;
  title: DeviceSetting;
  expanded: boolean;
}

export const Header = (props: Props) => {
  const { dispatch, panel, title, expanded } = props;
  return <ExpandableHeader
    expanded={expanded}
    title={t(title)}
    onClick={() => dispatch(toggleControlPanel(panel))} />;
};
