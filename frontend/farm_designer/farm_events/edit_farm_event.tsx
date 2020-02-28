import * as React from "react";
import { AddEditFarmEventProps } from "../interfaces";
import { connect } from "react-redux";
import { mapStateToPropsAddEdit } from "./map_state_to_props_add_edit";
import { history } from "../../history";
import { EditFEForm } from "./edit_fe_form";
import { t } from "../../i18next_wrapper";
import { Panel } from "../panel_header";
import {
  DesignerPanel, DesignerPanelHeader, DesignerPanelContent,
} from "../designer_panel";

export class RawEditFarmEvent extends React.Component<AddEditFarmEventProps, {}> {
  render() {
    const fe = this.props.getFarmEvent();
    !fe && history.push("/app/designer/events");
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
            autoSyncEnabled={this.props.autoSyncEnabled}
            resources={this.props.resources}
            shouldDisplay={this.props.shouldDisplay} />
          : <div className={"redirect"}>{t("Redirecting")}...</div>}
      </DesignerPanelContent>
    </DesignerPanel>;
  }
}

export const EditFarmEvent = connect(mapStateToPropsAddEdit)(RawEditFarmEvent);
