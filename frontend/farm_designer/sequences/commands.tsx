import * as React from "react";
import { connect } from "react-redux";
import {
  DesignerPanel, DesignerPanelContent, DesignerPanelHeader,
} from "../designer_panel";
import { mapStateToProps } from "../../sequences/state_to_props";
import { t } from "../../i18next_wrapper";
import {
  StepButtonCluster, StepButtonProps,
} from "../../sequences/step_button_cluster";
import { urlFriendly } from "../../util";

export class RawDesignerSequenceCommands
  extends React.Component<StepButtonProps> {
  render() {
    const panelName = "designer-sequence-commands";
    return <DesignerPanel panelName={panelName}>
      <DesignerPanelHeader
        panelName={panelName}
        title={t("Add Command")}
        backTo={`/app/designer/sequences/${
          urlFriendly(this.props.current?.body.name || "")}`} />
      <DesignerPanelContent panelName={panelName}>
        <StepButtonCluster
          current={this.props.current}
          dispatch={this.props.dispatch}
          shouldDisplay={this.props.shouldDisplay}
          stepIndex={this.props.stepIndex} />
      </DesignerPanelContent>
    </DesignerPanel>;
  }
}

export const DesignerSequenceCommands =
  connect(mapStateToProps)(RawDesignerSequenceCommands);
