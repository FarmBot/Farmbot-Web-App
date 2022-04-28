import React from "react";
import { connect } from "react-redux";
import {
  DesignerPanel, DesignerPanelContent, DesignerPanelHeader,
} from "../../farm_designer/designer_panel";
import { Panel } from "../../farm_designer/panel_header";
import { mapStateToProps } from "./state_to_props";
import { RegimenEditorProps } from "./interfaces";
import { t } from "../../i18next_wrapper";
import {
  setActiveRegimenByName,
} from "../set_active_regimen_by_name";
import { EmptyStateWrapper, EmptyStateGraphic, ColorPicker } from "../../ui";
import { isTaggedRegimen } from "../../resources/tagged_resources";
import { Content } from "../../constants";
import { ActiveEditor } from "./active_editor";
import { ResourceTitle } from "../../sequences/panel/editor";
import { Path } from "../../internal_urls";
import { edit } from "../../api/crud";

export class RawDesignerRegimenEditor
  extends React.Component<RegimenEditorProps> {

  componentDidMount() {
    if (!this.props.current) { setActiveRegimenByName(); }
  }

  render() {
    const panelName = "designer-regimen-editor";
    const regimen = this.props.current;
    return <DesignerPanel panelName={panelName} panel={Panel.Regimens}>
      <DesignerPanelHeader
        panelName={panelName}
        panel={Panel.Regimens}
        colorClass={regimen?.body.color}
        titleElement={<ResourceTitle
          key={regimen?.body.name}
          resource={regimen}
          fallback={t("No Regimen selected")}
          dispatch={this.props.dispatch} />}
        backTo={Path.regimens()}>
        {regimen && <ColorPicker
          current={regimen.body.color || "gray"}
          targetElement={<i title={t("select color")}
            className={"icon-saucer fa fa-paint-brush"} />}
          onChange={color => this.props.dispatch(edit(regimen, { color }))} />}
      </DesignerPanelHeader>
      <DesignerPanelContent panelName={panelName}>
        <EmptyStateWrapper
          notEmpty={regimen && isTaggedRegimen(regimen) && this.props.calendar}
          graphic={EmptyStateGraphic.regimens}
          title={t("No Regimen selected.")}
          text={Content.NO_REGIMEN_SELECTED}>
          {regimen && <ActiveEditor
            dispatch={this.props.dispatch}
            regimen={regimen}
            calendar={this.props.calendar}
            resources={this.props.resources}
            variableData={this.props.variableData} />}
        </EmptyStateWrapper>
      </DesignerPanelContent>
    </DesignerPanel>;
  }
}

export const DesignerRegimenEditor =
  connect(mapStateToProps)(RawDesignerRegimenEditor);
