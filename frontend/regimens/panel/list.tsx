import * as React from "react";
import { connect } from "react-redux";
import {
  DesignerPanel, DesignerPanelContent,
} from "../../farm_designer/designer_panel";
import { DesignerNavTabs, Panel } from "../../farm_designer/panel_header";
import { mapStateToProps } from "../state_to_props";
import { Props } from "../interfaces";
import { RegimensList } from "../list";

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
