import * as React from "react";
import { ControlPanelState } from "../../interfaces";
import { toggleControlPanel } from "../../actions";
import { ExpandableHeader } from "../../../ui/expandable_header";

interface Props {
  dispatch: Function;
  name: keyof ControlPanelState;
  title: string;
  expanded: boolean;
}

export let Header = (props: Props) => {
  const { dispatch, name, title, expanded } = props;
  return <ExpandableHeader
    expanded={expanded}
    title={title}
    onClick={() => dispatch(toggleControlPanel(name))} />;
};
