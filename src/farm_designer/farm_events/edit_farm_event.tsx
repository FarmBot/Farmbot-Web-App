import * as React from "react";
import { AddEditFarmEventProps } from "../interfaces";
import { connect } from "react-redux";
import { mapStateToPropsAddEdit } from "./map_state_to_props_add_edit";
import { history } from "../../history";
import { TaggedFarmEvent } from "../../resources/tagged_resources";
import { EditFEForm } from "./farm_event_form";
import { t } from "i18next";

@connect(mapStateToPropsAddEdit)
export class EditFarmEvent extends React.Component<AddEditFarmEventProps, {}> {
  redirect() {
    history.push("/app/designer/farm_events");
    return <div>{t("Loading")}...</div>;
  }

  renderForm(fe: TaggedFarmEvent) {
    return <EditFEForm farmEvent={fe}
      deviceTimezone={this.props.deviceTimezone}
      repeatOptions={this.props.repeatOptions}
      executableOptions={this.props.executableOptions}
      dispatch={this.props.dispatch}
      findExecutable={this.props.findExecutable}
      title={t("Edit Farm Event")} />
  }

  render() {
    let fe = this.props.getFarmEvent();
    return fe ? this.renderForm(fe) : this.redirect();
  }
}
