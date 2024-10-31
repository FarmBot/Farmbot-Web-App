import React from "react";
import { AddEditFarmEventProps } from "../farm_designer/interfaces";
import { connect } from "react-redux";
import { mapStateToPropsAddEdit } from "./map_state_to_props_add_edit";
import { useNavigate } from "react-router-dom";
import { EditFEForm } from "./edit_fe_form";
import { t } from "../i18next_wrapper";
import { Panel } from "../farm_designer/panel_header";
import {
  DesignerPanel, DesignerPanelHeader, DesignerPanelContent,
} from "../farm_designer/designer_panel";
import { Path } from "../internal_urls";

export const RawEditFarmEvent = (props: AddEditFarmEventProps) => {
  const navigate = useNavigate();
  const fe = props.getFarmEvent(navigate);
  const eventsPath = Path.farmEvents();
  !fe && Path.startsWith(eventsPath) && navigate(eventsPath);
  const panelName = "edit-farm-event";
  return <DesignerPanel panelName={panelName} panel={Panel.FarmEvents}>
    <DesignerPanelHeader
      panelName={panelName}
      panel={Panel.FarmEvents}
      title={t("Edit event")} />
    <DesignerPanelContent panelName={panelName}>
      {fe
        ? <EditFEForm farmEvent={fe}
          deviceTimezone={props.deviceTimezone}
          repeatOptions={props.repeatOptions}
          executableOptions={props.executableOptions}
          dispatch={props.dispatch}
          findExecutable={props.findExecutable}
          title={t("Edit event")}
          deleteBtn={true}
          timeSettings={props.timeSettings}
          resources={props.resources} />
        : <div className={"redirect"}>{t("Redirecting")}...</div>}
    </DesignerPanelContent>
  </DesignerPanel>;
};

export const EditFarmEvent = connect(mapStateToPropsAddEdit)(RawEditFarmEvent);
// eslint-disable-next-line import/no-default-export
export default EditFarmEvent;
