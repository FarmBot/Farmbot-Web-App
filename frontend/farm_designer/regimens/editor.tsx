import * as React from "react";
import { connect } from "react-redux";
import {
  DesignerPanel, DesignerPanelContent, DesignerPanelHeader,
} from "../designer_panel";
import { Panel } from "../panel_header";
import { mapStateToProps } from "../../regimens/state_to_props";
import { Props } from "../../regimens/interfaces";
import { t } from "../../i18next_wrapper";
import {
  setActiveRegimenByName,
} from "../../regimens/set_active_regimen_by_name";
import { RegimenEditor } from "../../regimens/editor";

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
