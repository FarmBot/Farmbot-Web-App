import * as React from "react";
import { connect } from "react-redux";
import { DesignerPanel, DesignerPanelContent } from "../designer_panel";
import { DesignerNavTabs, Panel } from "../panel_header";
import { mapStateToProps } from "../../regimens/state_to_props";
import { Props } from "../../regimens/interfaces";
import { RegimensList } from "../../regimens/list";

export class RawDesignerRegimenList extends React.Component<Props> {
  render() {
    const panelName = "designer-regimen-list";
    return <DesignerPanel panelName={panelName} panel={Panel.Regimens}>
      <DesignerNavTabs />
      <DesignerPanelContent panelName={panelName}>
        <RegimensList
          usageStats={this.props.regimenUsageStats}
          dispatch={this.props.dispatch}
          regimens={this.props.regimens}
          regimen={this.props.current} />
      </DesignerPanelContent>
    </DesignerPanel>;
  }
}

export const DesignerRegimenList =
  connect(mapStateToProps)(RawDesignerRegimenList);
