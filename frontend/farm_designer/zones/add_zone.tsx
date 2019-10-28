import React from "react";
import { connect } from "react-redux";
import {
  DesignerPanel, DesignerPanelContent, DesignerPanelHeader
} from "../plants/designer_panel";
import { Everything } from "../../interfaces";
import { t } from "../../i18next_wrapper";
import { Panel } from "../panel_header";

export interface AddZoneProps {
  dispatch: Function;
}

export interface AddZoneState {
}

export const mapStateToProps = (props: Everything): AddZoneProps => ({
  dispatch: props.dispatch,
});

export class RawAddZone extends React.Component<AddZoneProps, AddZoneState> {
  state: AddZoneState = {};
  render() {
    return <DesignerPanel panelName={"add-zone"} panel={Panel.Zones}>
      <DesignerPanelHeader
        panelName={"add-zone"}
        title={t("Add new zone")}
        backTo={"/app/designer/zones"}
        panel={Panel.Zones} />
      <DesignerPanelContent panelName={"add-zone"}>
      </DesignerPanelContent>
    </DesignerPanel>;
  }
}

export const AddZone = connect(mapStateToProps)(RawAddZone);
