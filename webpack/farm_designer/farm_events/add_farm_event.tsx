import * as React from "react";
import { t } from "i18next";
import * as moment from "moment";
import { connect } from "react-redux";
import { mapStateToPropsAddEdit, } from "./map_state_to_props_add_edit";
import { init } from "../../api/crud";
import { EditFEForm } from "./edit_fe_form";
import { betterCompact, JSXChildren } from "../../util";
import { entries } from "../../resources/util";
import { Link } from "react-router";
import {
  AddEditFarmEventProps,
  TaggedExecutable,
  ExecutableType
} from "../interfaces";
import { BackArrow } from "../../ui/index";
import { SpecialStatus } from "../../resources/tagged_resources";

interface State {
  uuid: string;
}

@connect(mapStateToPropsAddEdit)
export class AddFarmEvent
  extends React.Component<AddEditFarmEventProps, Partial<State>> {

  constructor() {
    super();
    this.state = {};
  }

  get sequences() { return betterCompact(entries(this.props.sequencesById)); }

  get regimens() { return betterCompact(entries(this.props.regimensById)); }

  get executables() {
    return ([] as TaggedExecutable[])
      .concat(this.sequences)
      .concat(this.regimens)
      .filter(x => x.body.id);
  }

  get executable(): TaggedExecutable | undefined { return this.executables[0]; }

  componentDidMount() {
    if (this.executable) {
      let executable_type: ExecutableType =
        (this.executable.kind === "sequences") ? "Sequence" : "Regimen";
      let executable_id = this.executable.body.id || 1;
      let NOW = moment().toISOString();
      let action = init({
        kind: "farm_events",
        specialStatus: SpecialStatus.DIRTY,
        uuid: "---",
        body: {
          start_time: NOW,
          next_time: NOW,
          time_unit: "never",
          executable_id,
          executable_type
        }
      });
      this.props.dispatch(action);
      this.setState({ uuid: action.payload.uuid });
    }
  }

  /** No executables. Can't load form. */
  none() {
    return <p>
      {t("You haven't made any regimens or sequences yet. Please create a")}
      <Link to="/app/sequences">{t(" sequence")}</Link> {t(" or")}
      <Link to="/app/regimens">{t(" regimen")}</Link> {t("first.")}
    </p>;
  }

  /** User has executables to create FarmEvents with, has not loaded yet. */
  loading() {
    return <p>{t("Loading")}...</p>;
  }

  placeholderTemplate(children: JSXChildren) {
    return (
      <div className="panel-container magenta-panel add-farm-event-panel">
        <div className="panel-header magenta-panel">
          <p className="panel-title"> <BackArrow /> {t("No Executables")} </p>
        </div>
        <div className="panel-content">
          <label>
            {children}
          </label>
        </div>
      </div>
    );
  }

  render() {
    let { uuid } = this.state;
    // Legacy leftover from pre-TaggedResource era.
    // TODO: Proper fix where we add a `findFarmEvent` selector
    //       to mapStateToProps instead of juggling arrays.
    let fe = uuid && this.props.farmEvents.filter(x => x.uuid === uuid)[0];
    if (fe) {
      return (
        <EditFEForm
          farmEvent={fe}
          deviceTimezone={this.props.deviceTimezone}
          repeatOptions={this.props.repeatOptions}
          executableOptions={this.props.executableOptions}
          dispatch={this.props.dispatch}
          findExecutable={this.props.findExecutable}
          title={t("Add Farm Event")}
        />
      );
    } else {
      return this
        .placeholderTemplate(((this.executable) ? this.loading : this.none)());
    }
  }
}
