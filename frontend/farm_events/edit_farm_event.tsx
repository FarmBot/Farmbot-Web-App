import React from "react";
import { AddEditFarmEventProps } from "../farm_designer/interfaces";
import { connect } from "react-redux";
import { mapStateToPropsAddEdit } from "./map_state_to_props_add_edit";
import { push } from "../history";
import { EditFEForm } from "./edit_fe_form";
import { t } from "../i18next_wrapper";
import { Panel } from "../farm_designer/panel_header";
import {
  DesignerPanel, DesignerPanelHeader, DesignerPanelContent,
} from "../farm_designer/designer_panel";
import { Path } from "../internal_urls";

export class RawEditFarmEvent extends React.Component<AddEditFarmEventProps, {}> {
  render() {
    const fe = this.props.getFarmEvent();
    const eventsPath = Path.farmEvents();
    !fe && Path.startsWith(eventsPath) && push(eventsPath);
    const panelName = "edit-farm-event";
    return <DesignerPanel panelName={panelName} panel={Panel.FarmEvents}>
      <DesignerPanelHeader
        panelName={panelName}
        panel={Panel.FarmEvents}
        title={t("Edit event")} />
      <DesignerPanelContent panelName={panelName}>
        {fe
          ? <EditFEForm farmEvent={fe}
            deviceTimezone={this.props.deviceTimezone}
            repeatOptions={this.props.repeatOptions}
            executableOptions={this.props.executableOptions}
            dispatch={this.props.dispatch}
            findExecutable={this.props.findExecutable}
            title={t("Edit event")}
            deleteBtn={true}
            timeSettings={this.props.timeSettings}
            resources={this.props.resources} />
          : <div className={"redirect"}>{t("Redirecting")}...</div>}
      </DesignerPanelContent>
    </DesignerPanel>;
  }
}

export const EditFarmEvent = connect(mapStateToPropsAddEdit)(RawEditFarmEvent);
