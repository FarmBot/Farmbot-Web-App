import React from "react";
import moment from "moment";
import { connect } from "react-redux";
import {
  mapStateToPropsAddEdit, formatDateField, formatTimeField,
} from "./map_state_to_props_add_edit";
import { init, destroy } from "../api/crud";
import {
  EditFEForm, FarmEventForm, FarmEventViewModel, NEVER,
} from "./edit_fe_form";
import { betterMerge } from "../util";
import { AddEditFarmEventProps } from "../farm_designer/interfaces";
import { ExecutableType } from "farmbot/dist/resources/api_resources";
import {
  DesignerPanel, DesignerPanelHeader, DesignerPanelContent,
} from "../farm_designer/designer_panel";
import { variableList } from "../sequences/locals_list/variable_support";
import { t } from "../i18next_wrapper";
import { Panel } from "../farm_designer/panel_header";
import { SpecialStatus } from "farmbot";
import { destroyOK } from "../resources/actions";
import { Content } from "../constants";
import { error } from "../toast/toast";
import { DropDownItem, SaveBtn } from "../ui";
import { noop } from "lodash";

interface State {
  uuid: string;
  temporaryValues: Partial<FarmEventViewModel>;
}

export class RawAddFarmEvent
  extends React.Component<AddEditFarmEventProps, State> {
  temporaryValueDefaults = () => {
    const now = new Date();
    const later = new Date(now.getTime() + 180000);
    const muchLater = new Date(now.getTime() + 3780000);
    return {
      startDate: formatDateField(later.toString(), this.props.timeSettings),
      startTime: formatTimeField(later.toString(), this.props.timeSettings),
      endDate: formatDateField(later.toString(), this.props.timeSettings),
      endTime: formatTimeField(muchLater.toString(), this.props.timeSettings),
      repeat: "1",
      timeUnit: NEVER,
    };
  };

  state: State = { uuid: "", temporaryValues: this.temporaryValueDefaults() };

  initFarmEvent = (ddi: DropDownItem) => {
    const executable = this.props.findExecutable(
      ddi.headingId === "Sequence" ? "Sequence" : "Regimen",
      parseInt("" + ddi.value));
    if (executable) {
      const executable_type: ExecutableType =
        executable.kind === "Sequence" ? "Sequence" : "Regimen";
      const executable_id = executable.body.id || 1;
      const { uuid } = this.props.findExecutable(executable_type, executable_id);
      const varData = this.props.resources.sequenceMetas[uuid];
      const action = init("FarmEvent", {
        end_time: "" + moment().add(63, "minutes").toISOString(),
        start_time: "" + moment().add(3, "minutes").toISOString(),
        time_unit: "never",
        executable_id,
        executable_type,
        body: variableList(varData),
      });
      this.props.dispatch(action);
      this.setState({ uuid: action.payload.uuid });
    }
  };

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
    }));

  render() {
    const farmEvent = this.props.findFarmEventByUuid(this.state.uuid);
    const panelName = "add-farm-event";
    const ref = React.createRef<EditFEForm>();
    return <DesignerPanel panelName={panelName} panel={Panel.FarmEvents}>
      <DesignerPanelHeader
        panelName={panelName}
        panel={Panel.FarmEvents}
        title={t("Add event")}
        onBack={(farmEvent && !farmEvent.body.id)
          ? () => this.props.dispatch(destroyOK(farmEvent))
          : undefined}>
        <SaveBtn
          status={SpecialStatus.DIRTY}
          onClick={() => {
            if (farmEvent) {
              ref.current?.commitViewModel();
            } else {
              error(this.props.executableOptions
                .filter(x => !x.heading).length < 1
                ? t(Content.MISSING_EXECUTABLE)
                : t("Please select a sequence or regimen."));
            }
          }} />
      </DesignerPanelHeader>
      <DesignerPanelContent panelName={panelName}>
        {farmEvent
          ? <EditFEForm ref={ref}
            farmEvent={farmEvent}
            deviceTimezone={this.props.deviceTimezone}
            repeatOptions={this.props.repeatOptions}
            executableOptions={this.props.executableOptions}
            dispatch={this.props.dispatch}
            findExecutable={this.props.findExecutable}
            title={t("Add event")}
            setSpecialStatus={noop}
            timeSettings={this.props.timeSettings}
            resources={this.props.resources} />
          : <FarmEventForm
            isRegimen={false}
            fieldGet={this.getField}
            fieldSet={this.setField}
            timeSettings={this.props.timeSettings}
            executableOptions={this.props.executableOptions}
            executableSet={this.initFarmEvent}
            executableGet={() => undefined}
            dispatch={this.props.dispatch} />}
      </DesignerPanelContent>
    </DesignerPanel>;
  }
}

export const AddFarmEvent = connect(mapStateToPropsAddEdit)(RawAddFarmEvent);
// eslint-disable-next-line import/no-default-export
export default AddFarmEvent;
