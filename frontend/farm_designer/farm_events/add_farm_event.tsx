import * as React from "react";
import moment from "moment";
import { connect } from "react-redux";
import {
  mapStateToPropsAddEdit, formatDate, formatTime,
} from "./map_state_to_props_add_edit";
import { init, destroy } from "../../api/crud";
import {
  EditFEForm, FarmEventForm, FarmEventViewModel, NEVER,
} from "./edit_fe_form";
import { betterCompact, betterMerge } from "../../util";
import { entries } from "../../resources/util";
import {
  AddEditFarmEventProps,
  TaggedExecutable,
} from "../interfaces";
import { ExecutableType } from "farmbot/dist/resources/api_resources";
import {
  DesignerPanel, DesignerPanelHeader, DesignerPanelContent,
} from "../designer_panel";
import { variableList } from "../../sequences/locals_list/variable_support";
import { t } from "../../i18next_wrapper";
import { Panel } from "../panel_header";
import { SpecialStatus } from "farmbot";
import { destroyOK } from "../../resources/actions";
import { Content } from "../../constants";
import { error } from "../../toast/toast";

interface State {
  uuid: string;
  temporaryValues: Partial<FarmEventViewModel>;
}

export class RawAddFarmEvent
  extends React.Component<AddEditFarmEventProps, State> {
  temporaryValueDefaults = () => {
    const now = new Date();
    const later = new Date(now.getTime() + 60000);
    return {
      startDate: formatDate(now.toString(), this.props.timeSettings),
      startTime: formatTime(now.toString(), this.props.timeSettings),
      endDate: formatDate(now.toString(), this.props.timeSettings),
      endTime: formatTime(later.toString(), this.props.timeSettings),
      repeat: "1",
      timeUnit: NEVER,
    };
  }

  state: State = { uuid: "", temporaryValues: this.temporaryValueDefaults() };

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
        body: variableList(varData),
      });
      this.props.dispatch(action);
      this.setState({ uuid: action.payload.uuid });
    }
  }

  componentWillUnmount() {
    const { uuid } = this.state;
    const fe = this.props.findFarmEventByUuid(uuid);
    const unsaved = fe && !fe.body.id;
    if (fe && unsaved) { this.props.dispatch(destroy(fe.uuid, true)); }
  }

  getField = (field: keyof State["temporaryValues"]): string =>
    "" + this.state.temporaryValues[field];
  setField = (field: keyof State["temporaryValues"], value: string) =>
    this.setState(betterMerge(this.state, {
      temporaryValues: { [field]: value }
    }))

  render() {
    const farmEvent = this.props.findFarmEventByUuid(this.state.uuid);
    const panelName = "add-farm-event";
    return <DesignerPanel panelName={panelName} panel={Panel.FarmEvents}>
      <DesignerPanelHeader
        panelName={panelName}
        panel={Panel.FarmEvents}
        title={t("Add event")}
        onBack={(farmEvent && !farmEvent.body.id)
          ? () => this.props.dispatch(destroyOK(farmEvent))
          : undefined} />
      <DesignerPanelContent panelName={panelName}>
        {farmEvent
          ? <EditFEForm
            farmEvent={farmEvent}
            deviceTimezone={this.props.deviceTimezone}
            repeatOptions={this.props.repeatOptions}
            executableOptions={this.props.executableOptions}
            dispatch={this.props.dispatch}
            findExecutable={this.props.findExecutable}
            title={t("Add event")}
            timeSettings={this.props.timeSettings}
            autoSyncEnabled={this.props.autoSyncEnabled}
            resources={this.props.resources}
            shouldDisplay={this.props.shouldDisplay} />
          : <FarmEventForm
            isRegimen={false}
            fieldGet={this.getField}
            fieldSet={this.setField}
            timeSettings={this.props.timeSettings}
            executableOptions={[]}
            executableSet={() => { }}
            executableGet={() => undefined}
            dispatch={this.props.dispatch}
            specialStatus={SpecialStatus.DIRTY}
            onSave={() => error(t(Content.MISSING_EXECUTABLE))} />}
      </DesignerPanelContent>
    </DesignerPanel>;
  }
}

export const AddFarmEvent = connect(mapStateToPropsAddEdit)(RawAddFarmEvent);
