import React from "react";
import { connect } from "react-redux";
import {
  DesignerPanel, DesignerPanelContent, DesignerPanelHeader,
} from "../../farm_designer/designer_panel";
import { Panel } from "../../farm_designer/panel_header";
import { t } from "../../i18next_wrapper";
import { urlFriendly } from "../../util";
import { BulkScheduler } from "../bulk_scheduler/bulk_scheduler";
import { AddButton } from "../bulk_scheduler/add_button";
import { commitBulkEditor } from "../bulk_scheduler/actions";
import { Everything } from "../../interfaces";
import {
  maybeGetRegimen, selectAllSequences, maybeGetSequence, getDeviceAccountSettings,
} from "../../resources/selectors";
import { RegimenSchedulerProps } from "./interfaces";
import { Path } from "../../internal_urls";

export const mapStateToProps = (props: Everything): RegimenSchedulerProps => {
  const {
    weeks, dailyOffsetMs, selectedSequenceUUID, currentRegimen
  } = props.resources.consumers.regimens;
  const selectedSequence =
    maybeGetSequence(props.resources.index, selectedSequenceUUID);
  const current = maybeGetRegimen(props.resources.index, currentRegimen);
  return {
    dispatch: props.dispatch,
    sequences: selectAllSequences(props.resources.index),
    resources: props.resources.index,
    current,
    selectedSequence,
    dailyOffsetMs,
    weeks,
    device: getDeviceAccountSettings(props.resources.index),
  };
};

export class RawDesignerRegimenScheduler
  extends React.Component<RegimenSchedulerProps> {
  render() {
    const panelName = "designer-regimen-scheduler";
    const regimenName = this.props.current?.body.name || "";
    return <DesignerPanel panelName={panelName} panel={Panel.Regimens}>
      <DesignerPanelHeader
        panelName={panelName}
        panel={Panel.Regimens}
        title={t("Scheduler")}
        backTo={Path.regimens(urlFriendly(regimenName))}>
        <AddButton
          active={!!this.props.sequences.length}
          onClick={() => this.props.dispatch(commitBulkEditor())} />
      </DesignerPanelHeader>
      <DesignerPanelContent panelName={panelName}>
        <div className={"bulk-scheduler"}>
          <BulkScheduler
            selectedSequence={this.props.selectedSequence}
            dailyOffsetMs={this.props.dailyOffsetMs}
            weeks={this.props.weeks}
            sequences={this.props.sequences}
            resources={this.props.resources}
            device={this.props.device}
            dispatch={this.props.dispatch} />
        </div>
      </DesignerPanelContent>
    </DesignerPanel>;
  }
}

export const DesignerRegimenScheduler =
  connect(mapStateToProps)(RawDesignerRegimenScheduler);
// eslint-disable-next-line import/no-default-export
export default DesignerRegimenScheduler;
