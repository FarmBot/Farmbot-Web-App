import * as React from "react";
import { AddEditFarmEventProps } from "../interfaces";
import { connect } from "react-redux";
import { mapStateToPropsAddEdit } from "./map_state_to_props_add_edit";
import { history } from "../../history";
import { TaggedFarmEvent } from "farmbot";
import { EditFEForm } from "./edit_fe_form";
import { t } from "../../i18next_wrapper";

@connect(mapStateToPropsAddEdit)
export class EditFarmEvent extends React.Component<AddEditFarmEventProps, {}> {
  redirect() {
    history.push("/app/designer/events");
    return <div>{t("Loading")}...</div>;
  }

  renderForm(fe: TaggedFarmEvent) {
    return <EditFEForm farmEvent={fe}
      deviceTimezone={this.props.deviceTimezone}
      repeatOptions={this.props.repeatOptions}
      executableOptions={this.props.executableOptions}
      dispatch={this.props.dispatch}
      findExecutable={this.props.findExecutable}
      title={t("Edit Event")}
      deleteBtn={true}
      timeOffset={this.props.timeOffset}
      autoSyncEnabled={this.props.autoSyncEnabled}
      resources={this.props.resources}
      shouldDisplay={this.props.shouldDisplay} />;
  }

  render() {
    const fe = this.props.getFarmEvent();
    return fe ? this.renderForm(fe) : this.redirect();
  }
}
