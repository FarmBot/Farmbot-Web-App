import * as React from "react";
import { connect } from "react-redux";
import {
  DesignerPanel, DesignerPanelContent, DesignerPanelHeader,
} from "../designer_panel";
import { Panel } from "../panel_header";
import { t } from "../../i18next_wrapper";
import { urlFriendly } from "../../util";
import { mapStateToProps } from "../../regimens/state_to_props";
import { BulkScheduler } from "../../regimens/bulk_scheduler";
import { BulkEditorProps } from "../../regimens/bulk_scheduler/interfaces";
import { TaggedRegimen } from "farmbot";
import { Props } from "../../regimens/interfaces";

export interface DesignerRegimenSchedulerProps extends BulkEditorProps {
  regimen: TaggedRegimen | undefined;
}

export class RawDesignerRegimenScheduler extends React.Component<Props> {
  render() {
    const panelName = "designer-regimen-scheduler";
    return <DesignerPanel panelName={panelName} panel={Panel.Regimens}>
      <DesignerPanelHeader
        panelName={panelName}
        panel={Panel.Regimens}
        title={t("Scheduler")}
        backTo={`/app/designer/regimens/${
          urlFriendly(this.props.current?.body.name || "")}`} />
      <DesignerPanelContent panelName={panelName}>
        <div className={"bulk-scheduler"}>
          <BulkScheduler
            selectedSequence={this.props.selectedSequence}
            dailyOffsetMs={this.props.dailyOffsetMs}
            weeks={this.props.weeks}
            sequences={this.props.sequences}
            resources={this.props.resources}
            dispatch={this.props.dispatch} />
        </div>
      </DesignerPanelContent>
    </DesignerPanel>;
  }
}

export const DesignerRegimenScheduler =
  connect(mapStateToProps)(RawDesignerRegimenScheduler);
