import * as React from "react";
import { connect } from "react-redux";
import {
  DesignerPanel, DesignerPanelContent, DesignerPanelHeader,
} from "../../farm_designer/designer_panel";
import { Panel } from "../../farm_designer/panel_header";
import { mapStateToProps } from "../state_to_props";
import { Props } from "../interfaces";
import { t } from "../../i18next_wrapper";
import {
  setActiveRegimenByName,
} from "../set_active_regimen_by_name";
import { RegimenEditor } from "../editor";

export class RawDesignerRegimenEditor extends React.Component<Props> {

  componentDidMount() {
    if (!this.props.current) { setActiveRegimenByName(); }
  }

  render() {
    const panelName = "designer-regimen-editor";
    return <DesignerPanel panelName={panelName} panel={Panel.Regimens}>
      <DesignerPanelHeader
        panelName={panelName}
        panel={Panel.Regimens}
        title={this.props.current?.body.name || t("No Regimen selected")}
        backTo={"/app/designer/regimens"} />
      <DesignerPanelContent panelName={panelName}>
        <RegimenEditor
          dispatch={this.props.dispatch}
          calendar={this.props.calendar}
          current={this.props.current}
          resources={this.props.resources}
          variableData={this.props.variableData}
          shouldDisplay={this.props.shouldDisplay} />
      </DesignerPanelContent>
    </DesignerPanel>;
  }
}

export const DesignerRegimenEditor =
  connect(mapStateToProps)(RawDesignerRegimenEditor);
