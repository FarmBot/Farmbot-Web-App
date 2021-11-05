import React from "react";
import { SettingsPanelState } from "../../interfaces";
import { toggleControlPanel } from "../toggle_section";
import { ExpandableHeader } from "../../ui/expandable_header";
import { t } from "../../i18next_wrapper";
import { DeviceSetting } from "../../constants";

export interface HeaderProps {
  dispatch: Function;
  panel: keyof SettingsPanelState;
  title: DeviceSetting;
  expanded: boolean;
}

export const Header = (props: HeaderProps) => {
  const { dispatch, panel, title, expanded } = props;
  return <ExpandableHeader
    expanded={expanded}
    title={t(title)}
    onClick={() => dispatch(toggleControlPanel(panel))} />;
};
