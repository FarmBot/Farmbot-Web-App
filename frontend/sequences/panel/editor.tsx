import React from "react";
import { connect } from "react-redux";
import {
  DesignerPanel, DesignerPanelContent, DesignerPanelHeader,
} from "../../farm_designer/designer_panel";
import { Panel } from "../../farm_designer/panel_header";
import { mapStateToProps } from "../state_to_props";
import { Props } from "../interfaces";
import { t } from "../../i18next_wrapper";
import { EmptyStateWrapper, EmptyStateGraphic } from "../../ui";
import {
  SequenceEditorMiddleActive,
} from "../sequence_editor_middle_active";
import { Content } from "../../constants";
import { isTaggedSequence } from "../../resources/tagged_resources";
import {
  setActiveSequenceByName,
} from "../set_active_sequence_by_name";
import { push } from "../../history";
import { urlFriendly } from "../../util";

export class RawDesignerSequenceEditor extends React.Component<Props> {

  componentDidMount() {
    if (!this.props.sequence) { setActiveSequenceByName(); }
  }

  render() {
    const panelName = "designer-sequence-editor";
    const { sequence } = this.props;
    return <DesignerPanel panelName={panelName} panel={Panel.Sequences}>
      <DesignerPanelHeader
        panelName={panelName}
        panel={Panel.Sequences}
        title={this.props.sequence?.body.name || t("No Sequence selected")}
        backTo={"/app/designer/sequences"}>
        {sequence && window.innerWidth > 450 &&
          <a className={"right-button"}
            title={t("open full-page editor")}
            onClick={() =>
              push(`/app/sequences/${urlFriendly(sequence.body.name)}`)}>
            {t("full editor")}
          </a>}
      </DesignerPanelHeader>
      <DesignerPanelContent panelName={panelName}>
        <EmptyStateWrapper
          notEmpty={this.props.sequence && isTaggedSequence(this.props.sequence)}
          graphic={EmptyStateGraphic.sequences}
          title={t("No Sequence selected.")}
          text={Content.NO_SEQUENCE_SELECTED}>
          {this.props.sequence && <SequenceEditorMiddleActive
            dispatch={this.props.dispatch}
            sequence={this.props.sequence}
            resources={this.props.resources}
            syncStatus={this.props.syncStatus}
            hardwareFlags={this.props.hardwareFlags}
            farmwareData={this.props.farmwareData}
            shouldDisplay={this.props.shouldDisplay}
            getWebAppConfigValue={this.props.getWebAppConfigValue}
            visualized={this.props.visualized}
            hoveredStep={this.props.hoveredStep}
            menuOpen={this.props.menuOpen} />}
        </EmptyStateWrapper>
      </DesignerPanelContent>
    </DesignerPanel>;
  }
}

export const DesignerSequenceEditor =
  connect(mapStateToProps)(RawDesignerSequenceEditor);
