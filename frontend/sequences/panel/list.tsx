import React from "react";
import { connect } from "react-redux";
import {
  DesignerPanel, DesignerPanelContent,
} from "../../farm_designer/designer_panel";
import { DesignerNavTabs, Panel } from "../../farm_designer/panel_header";
import { Folders } from "../../folders/component";
import { mapStateToProps } from "../state_to_props";
import { SequencesProps } from "../interfaces";

export class RawDesignerSequenceList extends React.Component<SequencesProps> {
  render() {
    const panelName = "designer-sequence-list";
    return <DesignerPanel panelName={panelName} panel={Panel.Sequences}>
      <DesignerNavTabs />
      <DesignerPanelContent panelName={panelName}>
        <Folders {...this.props.folderData} dispatch={this.props.dispatch} />
      </DesignerPanelContent>
    </DesignerPanel>;
  }
}

export const DesignerSequenceList =
  connect(mapStateToProps)(RawDesignerSequenceList);
