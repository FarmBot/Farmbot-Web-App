import * as React from "react";
import { AddEditFarmEventProps } from "../interfaces";
import { connect } from "react-redux";
import { mapStateToPropsAddEdit } from "./map_state_to_props_add_edit";
import { history } from "../../history";
import { TaggedFarmEvent } from "farmbot";
import { EditFEForm } from "./edit_fe_form";
import { t } from "../../i18next_wrapper";
import { Panel } from "../panel_header";
import {
  DesignerPanel, DesignerPanelHeader, DesignerPanelContent
} from "../designer_panel";

export class RawEditFarmEvent extends React.Component<AddEditFarmEventProps, {}> {
  redirect() {
    history.push("/app/designer/events");
    return <div>{t("Loading")}...</div>;
  }

  renderForm(fe: TaggedFarmEvent) {
    const panelName = "edit-farm-event";
    return <DesignerPanel panelName={panelName} panel={Panel.FarmEvents}>
      <DesignerPanelHeader
        panelName={panelName}
        panel={Panel.FarmEvents}
        title={t("Edit event")} />
      <DesignerPanelContent panelName={panelName}>
        <EditFEForm farmEvent={fe}
          deviceTimezone={this.props.deviceTimezone}
          repeatOptions={this.props.repeatOptions}
          executableOptions={this.props.executableOptions}
          dispatch={this.props.dispatch}
          findExecutable={this.props.findExecutable}
          title={t("Edit event")}
          deleteBtn={true}
          timeSettings={this.props.timeSettings}
          autoSyncEnabled={this.props.autoSyncEnabled}
          resources={this.props.resources}
          shouldDisplay={this.props.shouldDisplay} />
      </DesignerPanelContent>
    </DesignerPanel>;
  }

  render() {
    const fe = this.props.getFarmEvent();
    return fe ? this.renderForm(fe) : this.redirect();
  }
}

export const EditFarmEvent = connect(mapStateToPropsAddEdit)(RawEditFarmEvent);
