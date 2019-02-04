import * as React from "react";
import { t } from "i18next";
import moment from "moment";
import { connect } from "react-redux";
import { mapStateToPropsAddEdit, } from "./map_state_to_props_add_edit";
import { init, destroy } from "../../api/crud";
import { EditFEForm } from "./edit_fe_form";
import { betterCompact } from "../../util";
import { entries } from "../../resources/util";
import {
  AddEditFarmEventProps,
  TaggedExecutable
} from "../interfaces";
import { ExecutableType } from "farmbot/dist/resources/api_resources";
import { Link } from "../../link";
import {
  DesignerPanel, DesignerPanelHeader, DesignerPanelContent
} from "../plants/designer_panel";
import { declarationList } from "../../sequences/locals_list/declaration_support";

interface State {
  uuid: string;
}

@connect(mapStateToPropsAddEdit)
export class AddFarmEvent
  extends React.Component<AddEditFarmEventProps, Partial<State>> {

  constructor(props: AddEditFarmEventProps) {
    super(props);
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
      const executable_type: ExecutableType =
        (this.executable.kind === "Sequence") ? "Sequence" : "Regimen";
      const executable_id = this.executable.body.id || 1;
      const { uuid } = this.props.findExecutable(executable_type, executable_id);
      const varData = this.props.resources.sequenceMetas[uuid];
      const action = init("FarmEvent", {
        end_time: moment().add(63, "minutes").toISOString(),
        start_time: moment().add(3, "minutes").toISOString(),
        time_unit: "never",
        executable_id,
        executable_type,
        body: declarationList(varData),
      });
      this.props.dispatch(action);
      this.setState({ uuid: action.payload.uuid });
    }
  }

  componentWillUnmount() {
    const { uuid } = this.state;
    const fe = uuid && this.props.farmEvents.filter(x => x.uuid === uuid)[0];
    const unsaved = fe && !fe.body.id;
    if (fe && unsaved) { this.props.dispatch(destroy(fe.uuid, true)); }
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

  placeholderTemplate(children: React.ReactChild | React.ReactChild[]) {
    return <DesignerPanel panelName={"add-farm-event"} panelColor={"magenta"}>
      <DesignerPanelHeader
        panelName={"add-farm-event"}
        panelColor={"magenta"}
        title={t("No Executables")} />
      <DesignerPanelContent panelName={"add-farm-event"}>
        <label>
          {children}
        </label>
      </DesignerPanelContent>
    </DesignerPanel>;
  }

  render() {
    const { uuid } = this.state;
    // Legacy leftover from pre-TaggedResource era.
    // TODO: Proper fix where we add a `findFarmEvent` selector
    //       to mapStateToProps instead of juggling arrays.
    const fe = uuid && this.props.farmEvents.filter(x => x.uuid === uuid)[0];
    if (fe) {
      return <EditFEForm
        farmEvent={fe}
        deviceTimezone={this.props.deviceTimezone}
        repeatOptions={this.props.repeatOptions}
        executableOptions={this.props.executableOptions}
        dispatch={this.props.dispatch}
        findExecutable={this.props.findExecutable}
        title={t("Add Farm Event")}
        timeOffset={this.props.timeOffset}
        autoSyncEnabled={this.props.autoSyncEnabled}
        resources={this.props.resources}
        shouldDisplay={this.props.shouldDisplay}
      />;
    } else {
      return this
        .placeholderTemplate(((this.executable) ? this.loading : this.none)());
    }
  }
}
