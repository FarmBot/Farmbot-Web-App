import React from "react";
import { connect } from "react-redux";
import {
  DesignerPanel, DesignerPanelContent,
} from "../farm_designer/designer_panel";
import { Panel, DesignerNavTabs } from "../farm_designer/panel_header";
import { TourList } from "../help/tour_list";
import { Actions } from "../constants";
import { Everything } from "../interfaces";
import { HelpHeader } from "./header";

export interface ToursPanelProps {
  dispatch: Function;
}

export const mapStateToProps = (props: Everything): ToursPanelProps => ({
  dispatch: props.dispatch,
});

export class RawToursPanel extends React.Component<ToursPanelProps, {}> {

  componentDidMount() {
    this.props.dispatch({ type: Actions.START_TOUR, payload: undefined });
  }

  render() {
    return <DesignerPanel panelName={"tours"} panel={Panel.Help}>
      <DesignerNavTabs />
      <HelpHeader />
      <DesignerPanelContent panelName={"tours"}>
        <TourList dispatch={this.props.dispatch} />
      </DesignerPanelContent>
    </DesignerPanel>;
  }
}

export const ToursPanel = connect(mapStateToProps)(RawToursPanel);
