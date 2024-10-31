import React from "react";
import { connect } from "react-redux";
import {
  DesignerPanel, DesignerPanelContent, DesignerPanelHeader,
} from "../farm_designer/designer_panel";
import { Everything } from "../interfaces";
import { t } from "../i18next_wrapper";
import { Panel } from "../farm_designer/panel_header";
import { Path } from "../internal_urls";

export interface AddZoneProps {
  dispatch: Function;
}

export const mapStateToProps = (props: Everything): AddZoneProps => ({
  dispatch: props.dispatch,
});

export class RawAddZone extends React.Component<AddZoneProps, {}> {
  render() {
    return <DesignerPanel panelName={"add-zone"} panel={Panel.Zones}>
      <DesignerPanelHeader
        panelName={"add-zone"}
        title={t("Add new zone")}
        backTo={Path.zones()}
        panel={Panel.Zones} />
      <DesignerPanelContent panelName={"add-zone"}>
      </DesignerPanelContent>
    </DesignerPanel>;
  }
}

export const AddZone = connect(mapStateToProps)(RawAddZone);
// eslint-disable-next-line import/no-default-export
export default AddZone;
