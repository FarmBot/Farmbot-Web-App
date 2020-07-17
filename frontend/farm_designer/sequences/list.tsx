import * as React from "react";
import { connect } from "react-redux";
import { DesignerPanel, DesignerPanelContent } from "../designer_panel";
import { DesignerNavTabs, Panel } from "../panel_header";
import { Folders } from "../../folders/component";
import { mapStateToProps } from "../../sequences/state_to_props";
import { Props } from "../../sequences/interfaces";

export class RawDesignerSequenceList extends React.Component<Props> {
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
